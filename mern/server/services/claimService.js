import { Claim, Comment} from "../models/index.js";
import aiSummaryService from "./aiSummaryService.js";
import ReactionService from './reactionService.js';

let aiEnabled = false;

class ClaimService {
  static async getAllClaims() {
    const claims = await Claim.find({deletedAt: null})
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
  static async searchClaims(query) {
    const searchRegex = new RegExp(query, 'i'); // Case-insensitive search
    
    const claims = await Claim.find({
      $and: [
        {
           $or: [
            { claimTitle: { $regex: searchRegex } },
            { claimContent: { $regex: searchRegex } },
            { aiClaimSummary: { $regex: searchRegex } }
          ],
        },
        { deletedAt: null }
      ]
    })
    .populate('userId', 'username email')
    .populate("reportId", "reportTitle")
    .sort({ createdAt: -1 })
    .limit(50) // Limit results
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
}

export default ClaimService;
