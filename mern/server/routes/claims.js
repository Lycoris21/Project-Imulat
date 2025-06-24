import express from "express";
import ClaimController from "../controllers/claimController.js";

const router = express.Router();

// Get latest claims
router.get("/latest", ClaimController.getLatestClaims);

router.get("/", ClaimController.getAllClaims);
router.get("/:id", ClaimController.getClaimById);
router.post("/", ClaimController.createClaim);
router.patch("/:id", ClaimController.updateClaim);
router.delete("/:id", ClaimController.deleteClaim);

export default router;
