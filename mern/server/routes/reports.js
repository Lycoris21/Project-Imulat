import express from "express";
import ReportController from "../controllers/reportController.js";
import { validateReport } from "../middleware/validation.js";

const router = express.Router();

// Get latest reports
router.get("/latest", ReportController.getLatestReports);

// Get reports by truth verdict
router.get("/verdict/:verdict", ReportController.getReportsByVerdict);

// Get pending reports
router.get('/pending', ReportController.getPendingReports);

// Get all reports
router.get("/", ReportController.getAllReports);

// Get a single report by ID
router.get("/:id", ReportController.getReportById);

// Create a new report
router.post("/", validateReport, ReportController.createReport);

// Update a report
router.patch("/:id", ReportController.updateReport);

// Delete a report
router.delete("/:id", ReportController.deleteReport);

// Review a report
router.post('/:reportId/review', ReportController.submitPeerReview);

// Get reviews
router.get('/:reportId/peer-reviews', ReportController.getPeerReviews);

export default router;
