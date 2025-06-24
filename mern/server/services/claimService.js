import { Claim, Comment} from "../models/index.js";

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

  static async createClaim(claimData) {
    const newClaim = new Claim(claimData);
    return await newClaim.save();
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
