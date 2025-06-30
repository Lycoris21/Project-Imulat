import { Claim, Comment} from "../models/index.js";
import aiSummaryService from "./aiSummaryService.js";
import ReactionService from './reactionService.js';

let aiEnabled = true;

class ClaimService {
  static async getAllClaims(page = 1, limit = 24, sort = 'newest') {
    const skip = (page - 1) * limit;
    
    // Build sort criteria
    let sortCriteria = { createdAt: -1 }; // default: newest
    switch (sort) {
      case 'oldest':
        sortCriteria = { createdAt: 1 };
        break;
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        break;
      case 'thisWeek':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        break;
      case 'thisMonth':
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        break;
      case 'mostLiked':
        sortCriteria = { 'reactionCounts.like': -1 };
        break;
      case 'mostCommented':
        sortCriteria = { commentCount: -1 };
        break;
      case 'highestTruth':
        sortCriteria = { aiTruthIndex: -1 };
        break;
      default:
        sortCriteria = { createdAt: -1 };
    }

    // Base query
    let query = { deletedAt: null };
    
    // Add date filters for time-based sorts
    if (sort === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      query.createdAt = { $gte: today, $lt: tomorrow };
    } else if (sort === 'thisWeek') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      query.createdAt = { $gte: weekAgo };
    } else if (sort === 'thisMonth') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      query.createdAt = { $gte: monthAgo };
    }

    const [claims, total] = await Promise.all([
      Claim.find(query)
        .populate('userId', 'username email')
        .populate("reportId", "reportTitle")
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .lean(),
      Claim.countDocuments(query)
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
      console.log("Saved Claim:", savedClaim); // confirm successful DB save

      return savedClaim;
    } catch (err) {
      console.error("Error in createClaim:", err); // ❌ log any caught error
      throw err; // rethrow to let controller handle the error response
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
  static async searchClaims(query, page = 1, limit = 24, sort = 'newest') {
    const skip = (page - 1) * limit;
    const searchRegex = new RegExp(query, 'i'); // Case-insensitive search

    // Build sort criteria
    let sortCriteria = { createdAt: -1 }; // default: newest
    switch (sort) {
      case 'oldest':
        sortCriteria = { createdAt: 1 };
        break;
      case 'mostLiked':
        sortCriteria = { 'reactionCounts.like': -1 };
        break;
      case 'mostCommented':
        sortCriteria = { commentCount: -1 };
        break;
      case 'highestTruth':
        sortCriteria = { aiTruthIndex: -1 };
        break;
      default:
        sortCriteria = { createdAt: -1 };
    }

    const searchQuery = {
      $and: [
        {
          $or: [
            { claimTitle: searchRegex },
            { claimContent: searchRegex },
            { aiClaimSummary: searchRegex }
          ]
        },
        { deletedAt: null }
      ]
    };

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

export default ClaimService;
