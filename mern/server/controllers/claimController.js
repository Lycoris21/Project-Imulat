import ClaimService from "../services/claimService.js";

class ClaimController {
  static async getAllClaims(req, res) {
    try {
      const claims = await ClaimService.getAllClaims();
      res.status(200).json(claims);
    } catch (error) {
      console.error("Error fetching claims:", error);
      res.status(500).json({ error: "Error fetching claims" });
    }
  }

  static async getClaimById(req, res) {
    try {
      const claim = await ClaimService.getClaimById(req.params.id);
      if (!claim) return res.status(404).json({ error: "Claim not found" });
      res.status(200).json(claim);
    } catch (error) {
      console.error("Error fetching claim:", error);
      res.status(500).json({ error: "Error fetching claim" });
    }
  }

  static async createClaim(req, res) {
    try {
      const claim = await ClaimService.createClaim(req.body);
      res.status(201).json(claim);
    } catch (error) {
      console.error("Error creating claim:", error);
      res.status(500).json({ error: "Error creating claim" });
    }
  }

  static async updateClaim(req, res) {
    try {
      const claim = await ClaimService.updateClaim(req.params.id, req.body);
      if (!claim) return res.status(404).json({ error: "Claim not found" });
      res.status(200).json(claim);
    } catch (error) {
      console.error("Error updating claim:", error);
      res.status(500).json({ error: "Error updating claim" });
    }
  }

  static async deleteClaim(req, res) {
    try {
      const result = await ClaimService.deleteClaim(req.params.id);
      if (!result) return res.status(404).json({ error: "Claim not found" });
      res.status(200).json({ message: "Claim deleted successfully" });
    } catch (error) {
      console.error("Error deleting claim:", error);
      res.status(500).json({ error: "Error deleting claim" });
    }
  }

  // Get latest claims
  static async getLatestClaims(req, res) {
    try {
      const claims = await ClaimService.getLatestClaims(10); // Fetch 10 latest claims
      res.status(200).json(claims);
    } catch (error) {
      console.error("Error fetching latest claims:", error); // check backend logs
      res.status(500).json({ error: "Failed to fetch latest claims" });
    }
  }
}

export default ClaimController;