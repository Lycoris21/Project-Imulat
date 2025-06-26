import { Claim, Comment} from "../models/index.js";
import aiSummaryService from "./aiSummaryService.js";

class ClaimService {
  static async getAllClaims() {
    const claims = await Claim.find({})
      .populate('userId', 'username email')
      .populate("reportId", "reportTitle")
      .sort({ createdAt: -1 })
      .lean(); // important: use lean() to allow adding custom fields

    // Append commentCount for each claim
    const claimsWithCommentCount = await Promise.all(
      claims.map(async (claim) => {
        const count = await Comment.countDocuments({
          targetType: 'claim',
          targetId: claim._id,
        });
        return {
          ...claim,
          commentCount: count,
        };
      })
    );

    return claimsWithCommentCount;
  }

  static async getClaimById(id) {
    return await Claim.findById(id)
      .populate("userId", "username email")
      .populate("reportId", "reportTitle");
  }

   // Get reports by user
    static async getClaimsByUser(userId) {
      return await Claim.find({ userId })
        .populate('userId', 'username email')
        .populate("reportId", "reportTitle")
        .sort({ createdAt: -1 })
        .lean();
    }
  

 static async createClaim(claimData) {
    const { claimContent } = claimData;

    try {
      console.log("Creating claim with content:", claimContent); // ✅ log input

      const aiClaimSummary = await aiSummaryService.generateAISummary(claimContent);
      const aiTruthIndex = await aiSummaryService.generateTruthIndex(claimContent);

      const newClaim = new Claim({
        ...claimData,
        aiClaimSummary,
        aiTruthIndex: aiTruthIndex ?? Math.floor(Math.random() * 101),
      });

      const savedClaim = await newClaim.save();
      console.log("Saved Claim:", savedClaim); // ✅ confirm successful DB save

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
    return await Claim.findByIdAndDelete(id);
  }

  static async getLatestClaims(limit = 10) {
    const claims = await Claim.find({})
      .populate('userId', 'username email')
      .populate("reportId", "reportTitle")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(); // important: use lean() to allow adding custom fields

    // Append commentCount for each claim
    const claimsWithCommentCount = await Promise.all(
      claims.map(async (claim) => {
        const count = await Comment.countDocuments({
          targetType: 'claim',
          targetId: claim._id,
        });
        return {
          ...claim,
          commentCount: count,
        };
      })
    );

    return claimsWithCommentCount;
  }
}

export default ClaimService;
