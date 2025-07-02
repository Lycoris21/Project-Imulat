import { Claim, Comment, User} from "../models/index.js";
import aiSummaryService from "./aiSummaryService.js";
import ReactionService from './reactionService.js';
import mongoose from "mongoose";

let aiEnabled = true;

class ClaimService {
  static async getAllClaims(page = 1, limit = 24, sort = 'newest') {
    const skip = (page - 1) * limit;
    
    // Base match criteria
    let matchCriteria = { deletedAt: null };
    
    // Add date filters for time-based sorts
    if (sort === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      matchCriteria.createdAt = { $gte: today, $lt: tomorrow };
    } else if (sort === 'thisWeek') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      matchCriteria.createdAt = { $gte: weekAgo };
    } else if (sort === 'thisMonth') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      matchCriteria.createdAt = { $gte: monthAgo };
    }

    // Build sort criteria
    let sortCriteria = { createdAt: -1 }; // default: newest
    switch (sort) {
      case 'oldest':
        sortCriteria = { createdAt: 1 };
        break;
      case 'mostLiked':
        sortCriteria = { likeCount: -1 };
        break;
      case 'mostCommented':
        sortCriteria = { commentCount: -1 };
        break;
      case 'highestTruth':
        sortCriteria = { aiTruthIndex: -1 };
        break;
      case 'hottest':
        sortCriteria = { hotScore: -1 };
        break;
      default:
        sortCriteria = { createdAt: -1 };
    }

    // Use aggregation for sorting by reaction counts or comment counts
    if (sort === 'mostLiked' || sort === 'mostCommented' || sort === 'hottest') {
      const pipeline = [
        { $match: matchCriteria },
        {
          $lookup: {
            from: 'comments',
            let: { claimId: '$_id' },
            pipeline: [
              { $match: { $expr: { $and: [{ $eq: ['$targetType', 'claim'] }, { $eq: ['$targetId', '$$claimId'] }] } } }
            ],
            as: 'comments'
          }
        },
        {
          $lookup: {
            from: 'reactions',
            let: { claimId: '$_id' },
            pipeline: [
              { $match: { $expr: { $and: [{ $eq: ['$targetType', 'claim'] }, { $eq: ['$targetId', '$$claimId'] }, { $eq: ['$reactionType', 'like'] }] } } }
            ],
            as: 'likes'
          }
        },
        {
          $addFields: {
            commentCount: { $size: '$comments' },
            likeCount: { $size: '$likes' },
            hotScore: { $add: [{ $size: '$comments' }, { $multiply: [{ $size: '$likes' }, 2] }] }
          }
        },
        { $sort: sortCriteria },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userId',
            pipeline: [{ $project: { username: 1, email: 1 } }]
          }
        },
        {
          $lookup: {
            from: 'reports',
            localField: 'reportId',
            foreignField: '_id',
            as: 'reportId',
            pipeline: [{ $project: { reportTitle: 1 } }]
          }
        },
        {
          $addFields: {
            userId: { $arrayElemAt: ['$userId', 0] },
            reportId: { $arrayElemAt: ['$reportId', 0] }
          }
        }
      ];

      const [claims, totalResult] = await Promise.all([
        Claim.aggregate(pipeline),
        Claim.aggregate([
          { $match: matchCriteria },
          { $count: 'total' }
        ])
      ]);

      const total = totalResult[0]?.total || 0;

      // Add reaction counts for each claim
      const claimsWithMeta = await Promise.all(
        claims.map(async (claim) => {
          const reactionCounts = await ReactionService.countReactions(claim._id, 'claim');
          return {
            ...claim,
            reactionCounts,
          };
        })
      );

      return {
        claims: claimsWithMeta,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } else {
      // Use regular query for other sorts
      const [claims, total] = await Promise.all([
        Claim.find(matchCriteria)
          .populate('userId', 'username email')
          .populate("reportId", "reportTitle")
          .sort(sortCriteria)
          .skip(skip)
          .limit(limit)
          .lean(),
        Claim.countDocuments(matchCriteria)
      ]);

      const claimsWithMeta = await Promise.all(
        claims.map(async (claim) => {
          const [commentCount, reactionCounts] = await Promise.all([
            Comment.countDocuments({ targetType: 'claim', targetId: claim._id }),
            ReactionService.countReactions(claim._id, 'claim'),
          ]);

          return {
            ...claim,
            commentCount,
            reactionCounts,
          };
        })
      );

      return {
        claims: claimsWithMeta,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    }
  }

  static async getClaimById(id) {
    const claim = await Claim.findOne({ _id: id, deletedAt: null })
      .populate("userId", "username email")
      .populate("reportId", "reportTitle")
      .lean();

    if (!claim) return null;

    const [commentCount, reactionCounts] = await Promise.all([
      Comment.countDocuments({ targetType: 'claim', targetId: id }),
      ReactionService.countReactions(id, 'claim'),
    ]);

    return {
      ...claim,
      commentCount,
      reactionCounts,
    };
  }

  // Get reports by user
  static async getClaimsByUser(userId) {
    const claims = await Claim.find({ userId, deletedAt: null })
      .populate('userId', 'username email')
      .populate("reportId", "reportTitle")
      .sort({ createdAt: -1 })
      .lean();

    const claimsWithMeta = await Promise.all(
      claims.map(async (claim) => {
        const [commentCount, reactionCounts] = await Promise.all([
          Comment.countDocuments({ targetType: 'claim', targetId: claim._id }),
          ReactionService.countReactions(claim._id, 'claim'),
        ]);

        return {
          ...claim,
          commentCount,
          reactionCounts,
        };
      })
    );

    return claimsWithMeta;
  }

 static async createClaim(claimData) {
    const { claimContent } = claimData;

    try {
      console.log("Creating claim with content:", claimContent); // log input

      const aiClaimSummary = aiEnabled ? await aiSummaryService.generateAISummary(claimContent) : "SAMPLE AI SUMMARY";
      const aiTruthIndex = aiEnabled ? await aiSummaryService.generateTruthIndex(claimContent) : Math.floor(Math.random() * 101);;

      const newClaim = new Claim({
        ...claimData,
        aiClaimSummary,
        aiTruthIndex: aiTruthIndex ?? Math.floor(Math.random() * 101),
      });

      const savedClaim = await newClaim.save();
      console.log("Saved Claim:", savedClaim); 

      return savedClaim;
    } catch (err) {
      console.error("Error in createClaim:", err);
      throw err;
    }
  }

  static async updateClaim(id, updateData) {
    return await Claim.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  static async deleteClaim(id) {
    return await Claim.findByIdAndUpdate(
      id,
      { deletedAt: new Date() },
      { new: true }
    );
  }

  static async getLatestClaims(limit = 10) {
    const claims = await Claim.find({deletedAt: null})
      .populate('userId', 'username email')
      .populate("reportId", "reportTitle")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const claimsWithMeta = await Promise.all(
      claims.map(async (claim) => {
        const [commentCount, reactionCounts] = await Promise.all([
          Comment.countDocuments({ targetType: 'claim', targetId: claim._id }),
          ReactionService.countReactions(claim._id, 'claim'),
        ]);

        return {
          ...claim,
          commentCount,
          reactionCounts,
        };
      })
    );

    return claimsWithMeta;
  }

  // Search claims
  static async searchClaims(query, page = 1, limit = 24, sort = 'newest', user = null) {
    const skip = (page - 1) * limit;
    const searchRegex = new RegExp(query, 'i'); // Case-insensitive search

    let userIds = [];

    if (!user) {
      const matchedUsers = await User.find({
        $or: [
          { username: { $regex: searchRegex } },
          { email: { $regex: searchRegex } }
        ]
      }).select('_id');
      userIds = matchedUsers.map(u => u._id);
    }

    const searchQuery = {
      $and: [
        user
          ? {
              $and: [
                { userId: new mongoose.Types.ObjectId(user) },
                {
                  $or: [
                    { claimTitle: searchRegex },
                    { claimContent: searchRegex },
                    { aiClaimSummary: searchRegex },
                  ],
                },
              ],
            }
          : {
              $or: [
                { claimTitle: searchRegex },
                { claimContent: searchRegex },
                { aiClaimSummary: searchRegex },
                  ...(userIds.length > 0 ? [{ userId: { $in: userIds } }] : [])
              ],
            },
        { deletedAt: null },
      ],
    };

    // Build sort criteria
    let sortCriteria = { createdAt: -1 }; // default: newest
    switch (sort) {
      case 'oldest':
        sortCriteria = { createdAt: 1 };
        break;
      case 'mostLiked':
        sortCriteria = { likeCount: -1 };
        break;
      case 'mostCommented':
        sortCriteria = { commentCount: -1 };
        break;
      case 'highestTruth':
        sortCriteria = { aiTruthIndex: -1 };
        break;
      case 'hottest':
        sortCriteria = { hotScore: -1 };
        break;
      default:
        sortCriteria = { createdAt: -1 };
    }

    // Use aggregation for sorting by reaction counts or comment counts
    if (sort === 'mostLiked' || sort === 'mostCommented' || sort === 'hottest') {
      const pipeline = [
        { $match: searchQuery },
        {
          $lookup: {
            from: 'comments',
            let: { claimId: '$_id' },
            pipeline: [
              { $match: { $expr: { $and: [{ $eq: ['$targetType', 'claim'] }, { $eq: ['$targetId', '$$claimId'] }] } } }
            ],
            as: 'comments'
          }
        },
        {
          $lookup: {
            from: 'reactions',
            let: { claimId: '$_id' },
            pipeline: [
              { $match: { $expr: { $and: [{ $eq: ['$targetType', 'claim'] }, { $eq: ['$targetId', '$$claimId'] }, { $eq: ['$reactionType', 'like'] }] } } }
            ],
            as: 'likes'
          }
        },
        {
          $addFields: {
            commentCount: { $size: '$comments' },
            likeCount: { $size: '$likes' },
            hotScore: { $add: [{ $size: '$comments' }, { $multiply: [{ $size: '$likes' }, 1.5] }] }
          }
        },
        { $sort: sortCriteria },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userId',
            pipeline: [{ $project: { username: 1, email: 1 } }]
          }
        },
        {
          $lookup: {
            from: 'reports',
            localField: 'reportId',
            foreignField: '_id',
            as: 'reportId',
            pipeline: [{ $project: { reportTitle: 1 } }]
          }
        },
        {
          $addFields: {
            userId: { $arrayElemAt: ['$userId', 0] },
            reportId: { $arrayElemAt: ['$reportId', 0] }
          }
        }
      ];

      const [claims, totalResult] = await Promise.all([
        Claim.aggregate(pipeline),
        Claim.aggregate([
          { $match: searchQuery },
          { $count: 'total' }
        ])
      ]);

      const total = totalResult[0]?.total || 0;

      // Add reaction counts for each claim
      const claimsWithMeta = await Promise.all(
        claims.map(async (claim) => {
          const reactionCounts = await ReactionService.countReactions(claim._id, 'claim');
          return {
            ...claim,
            reactionCounts,
          };
        })
      );

      return {
        claims: claimsWithMeta,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } else {
      // Use regular query for other sorts
      const [claims, total] = await Promise.all([
        Claim.find(searchQuery)
          .populate('userId', 'username email')
          .populate("reportId", "reportTitle")
          .sort(sortCriteria)
          .skip(skip)
          .limit(limit)
          .lean(),
        Claim.countDocuments(searchQuery)
      ]);

      const claimsWithMeta = await Promise.all(
        claims.map(async (claim) => {
          const [commentCount, reactionCounts] = await Promise.all([
            Comment.countDocuments({ targetType: 'claim', targetId: claim._id }),
            ReactionService.countReactions(claim._id, 'claim'),
          ]);

          return {
            ...claim,
            commentCount,
            reactionCounts,
          };
        })
      );

      return {
        claims: claimsWithMeta,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    }
  }

}

export default ClaimService;
