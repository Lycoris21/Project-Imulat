import ClaimService from "../services/claimService.js";

class ClaimController {
  static async getAllClaims(req, res) {
    try {
      const { search, page = 1, limit = 24, sort = 'newest', user } = req.query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      const shouldSearch = search?.trim() || user;

      const result = shouldSearch
         ? await ClaimService.searchClaims(search, pageNum, limitNum, sort, user)
         : await ClaimService.getAllClaims(pageNum, limitNum, sort);

      res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching claims:", error);
      res.status(500).json({
        error: "Error fetching claims"
      });
    }
  }

  static async getClaimById(req, res) {
    try {
      const claim = await ClaimService.getClaimById(req.params.id);
      if (!claim)
        return res.status(404).json({
          error: "Claim not found"
        });
      res.status(200).json(claim);
    } catch (error) {
      console.error("Error fetching claim:", error);
      res.status(500).json({
        error: "Error fetching claim"
      });
    }
  }

  static async createClaim(req, res) {
    try {
      const claim = await ClaimService.createClaim(req.body);
      res.status(201).json(claim);
    } catch (error) {
      console.error("Error creating claim:", error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          error: error.message
        });
      }
      res.status(500).json({
        error: "Error creating claim"
      });
    }
  }

  static async updateClaim(req, res) {
    try {
      const userId = req.user?.id || req.body?.userId || req.headers['user-id'];

      const claim = await ClaimService.updateClaim(req.params.id, req.body, userId);

      if (!claim)
        return res.status(404).json({
          error: "Claim not found"
        });

      res.status(200).json(claim);
    } catch (error) {
      console.error("Error updating claim:", error);
      res.status(500).json({
        error: "Error updating claim"
      });
    }
  }

  static async deleteClaim(req, res) {
    try {
      // First get the claim to check ownership
      const claim = await ClaimService.getClaimById(req.params.id);
      if (!claim)
        return res.status(404).json({
          error: "Claim not found"
        });

      // Check authorization - user must be owner or admin
      const userId = req.body?.userId || req.headers['user-id']; // Support both body and header
      if (!userId) {
        return res.status(401).json({
          error: "User ID required"
        });
      }

      // Only owner or admin can delete
      if (claim.userId._id.toString() !== userId && req.body?.userRole !== 'admin') {
        return res.status(403).json({
          error: "You don't have permission to delete this claim"
        });
      }

      // ⬇️ Pass userId to log activity
      const result = await ClaimService.deleteClaim(req.params.id, userId);

      if (!result)
        return res.status(404).json({
          error: "Claim not found"
        });

      res.status(200).json({
        message: "Claim deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting claim:", error);
      res.status(500).json({
        error: "Error deleting claim"
      });
    }
  }

  // Get latest claims
  static async getLatestClaims(req, res) {
    try {
      const claims = await ClaimService.getLatestClaims(10); // Fetch 10 latest claims
      res.status(200).json(claims);
    } catch (error) {
      console.error("Error fetching latest claims:", error); // check backend logs
      res.status(500).json({
        error: "Failed to fetch latest claims"
      });
    }
  }
}

export default ClaimController;
