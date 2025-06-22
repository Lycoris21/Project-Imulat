import express from "express";
import { Report, User, Claim } from "../models/index.js";

const router = express.Router();

// Get all reports with user and claim details
router.get("/", async (req, res) => {
  try {
    const reports = await Report.find({})
      .populate('userId', 'username email')
      .populate('claimIds', 'claimTitle aiTruthIndex')
      .sort({ createdAt: -1 });
    
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ error: "Error fetching reports" });
  }
});

// Get a single report by ID with full details
router.get("/:id", async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('userId', 'username email bio')
      .populate('claimIds');

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.status(200).json(report);
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({ error: "Error fetching report" });
  }
});

// Create a new report
router.post("/", async (req, res) => {
  try {
    const { userId, claimIds, reportTitle, reportContent, truthVerdict, aiReportSummary, reportConclusion, reportReferences } = req.body;
    
    // Basic validation
    if (!userId || !reportTitle || !reportContent || !truthVerdict || !reportConclusion) {
      return res.status(400).json({ error: "UserId, reportTitle, reportContent, truthVerdict, and reportConclusion are required" });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // If claimIds provided, verify they exist
    if (claimIds && claimIds.length > 0) {
      const claims = await Claim.find({ _id: { $in: claimIds } });
      if (claims.length !== claimIds.length) {
        return res.status(400).json({ error: "One or more claims not found" });
      }
    }

    const newReport = new Report({
      userId,
      claimIds: claimIds || [],
      reportTitle,
      reportContent,
      truthVerdict,
      aiReportSummary,
      reportConclusion,
      reportReferences
    });

    const savedReport = await newReport.save();
    
    // Return populated report
    const populatedReport = await Report.findById(savedReport._id)
      .populate('userId', 'username email')
      .populate('claimIds', 'claimTitle aiTruthIndex');
    
    res.status(201).json(populatedReport);
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({ error: "Error creating report" });
  }
});

// Update a report
router.patch("/:id", async (req, res) => {
  try {
    const { claimIds, reportTitle, reportContent, truthVerdict, aiReportSummary, reportConclusion, reportReferences } = req.body;
    
    const updatedReport = await Report.findByIdAndUpdate(
      req.params.id,
      { claimIds, reportTitle, reportContent, truthVerdict, aiReportSummary, reportConclusion, reportReferences },
      { new: true, runValidators: true }
    ).populate('userId', 'username email')
     .populate('claimIds', 'claimTitle aiTruthIndex');

    if (!updatedReport) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.status(200).json(updatedReport);
  } catch (error) {
    console.error("Error updating report:", error);
    res.status(500).json({ error: "Error updating report" });
  }
});

// Delete a report
router.delete("/:id", async (req, res) => {
  try {
    const deletedReport = await Report.findByIdAndDelete(req.params.id);
    
    if (!deletedReport) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    console.error("Error deleting report:", error);
    res.status(500).json({ error: "Error deleting report" });
  }
});

// Get reports by truth verdict
router.get("/verdict/:verdict", async (req, res) => {
  try {
    const reports = await Report.find({ truthVerdict: req.params.verdict })
      .populate('userId', 'username email')
      .populate('claimIds', 'claimTitle aiTruthIndex')
      .sort({ createdAt: -1 });
    
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching reports by verdict:", error);
    res.status(500).json({ error: "Error fetching reports by verdict" });
  }
});

export default router;
