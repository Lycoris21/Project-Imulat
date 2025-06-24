import Claim from "../models/Claim.js";

class ClaimService {
  static async getAllClaims() {
    return await Claim.find({})
      .populate("userId", "username email")
      .populate("reportId", "reportTitle");
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
    return await Claim.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("userId", "username email")
      .populate("reportId", "reportTitle");
  }
}

export default ClaimService;
