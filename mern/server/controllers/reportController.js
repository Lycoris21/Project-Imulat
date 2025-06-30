import ReportService from "../services/reportService.js";

class ReportController {
  // Get all reports
  static async getAllReports(req, res) {
    try {
      const { search, page = 1, limit = 24, sort = 'newest' } = req.query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      
      const result = search 
        ? await ReportService.searchReports(search, pageNum, limitNum, sort)
        : await ReportService.getAllReports(pageNum, limitNum, sort);
      
      res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ error: "Error fetching reports" });
    }
  }

  // Get report by ID
  static async getReportById(req, res) {
    try {
      const report = await ReportService.getReportById(req.params.id);
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }
      res.status(200).json(report);
    } catch (error) {
      console.error("Error fetching report:", error);
      res.status(500).json({ error: "Error fetching report" });
    }
  }

  // Create new report
  static async createReport(req, res) {
    try {
      const {
        userId,
        claimIds,
        reportTitle,
        reportContent,
        truthVerdict,
        aiReportSummary,
        reportConclusion,
        reportReferences,
        reportCoverUrl
      } = req.body;

      // Basic validation
      if (!userId || !reportTitle || !reportContent || !truthVerdict || !reportConclusion) {
        return res.status(400).json({
          error: "UserId, reportTitle, reportContent, truthVerdict, and reportConclusion are required"
        });
      }

      const reportData = {
        userId,
        claimIds,
        reportTitle,
        reportContent,
        truthVerdict,
        aiReportSummary,
        reportConclusion,
        reportReferences,
        reportCoverUrl
      };

      const newReport = await ReportService.createReport(reportData);
      res.status(201).json(newReport);
    } catch (error) {
      console.error("Error creating report:", error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Error creating report" });
    }
  }


  // Update report
  static async updateReport(req, res) {
    try {
      const { claimIds, reportTitle, reportContent, truthVerdict, aiReportSummary, reportConclusion, reportReferences } = req.body;
      
      const updateData = {
        claimIds,
        reportTitle,
        reportContent,
        truthVerdict,
        aiReportSummary,
        reportConclusion,
        reportReferences
      };

      const updatedReport = await ReportService.updateReport(req.params.id, updateData);
      
      if (!updatedReport) {
        return res.status(404).json({ error: "Report not found" });
      }

      res.status(200).json(updatedReport);
    } catch (error) {
      console.error("Error updating report:", error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Error updating report" });
    }
  }

  // Delete report
  static async deleteReport(req, res) {
    try {
      const deletedReport = await ReportService.deleteReport(req.params.id);
      
      if (!deletedReport) {
        return res.status(404).json({ error: "Report not found" });
      }

      res.status(200).json({ message: "Report deleted successfully" });
    } catch (error) {
      console.error("Error deleting report:", error);
      res.status(500).json({ error: "Error deleting report" });
    }
  }

  // Get reports by truth verdict
  static async getReportsByVerdict(req, res) {
    try {
      const reports = await ReportService.getReportsByVerdict(req.params.verdict);
      res.status(200).json(reports);
    } catch (error) {
      console.error("Error fetching reports by verdict:", error);
      res.status(500).json({ error: "Error fetching reports by verdict" });
    }
  }

  // Get latest reports
  static async getLatestReports(req, res) {
    try {
      const reports = await ReportService.getLatestReports();
      res.status(200).json(reports);
    } catch (error) {
      console.error("Error fetching latest reports:", error);
      res.status(500).json({ error: "Error fetching latest reports" });
    }
  }


}

export default ReportController;
