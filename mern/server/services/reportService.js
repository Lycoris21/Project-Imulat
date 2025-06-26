import { Report, User, Claim, Comment} from "../models/index.js";
import aiSummaryService from "./aiSummaryService.js";

class ReportService {
  // Get all reports
  static async getAllReports() {
    const reports = await Report.find({})
      .populate('userId', 'username email')
      .populate('claimIds', 'claimTitle aiTruthIndex')
      .sort({ createdAt: -1 })
      .lean(); // important: use lean() to allow adding custom fields

    // Append commentCount for each report
    const reportsWithCommentCount = await Promise.all(
      reports.map(async (report) => {
        const count = await Comment.countDocuments({
          targetType: 'report',
          targetId: report._id,
        });
        return {
          ...report,
          commentCount: count,
        };
      })
    );

    return reportsWithCommentCount;
  }

  // Get report by ID
  static async getReportById(id) {
    return await Report.findById(id)
      .populate('userId', 'username email bio')
      .populate('claimIds');
  }

  // Create new report
  static async createReport(reportData) {
    const { userId, claimIds , reportContent} = reportData;

    try {
      // Verify user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // If claimIds provided, verify they exist
      if (claimIds && claimIds.length > 0) {
        const claims = await Claim.find({ _id: { $in: claimIds } });
        if (claims.length !== claimIds.length) {
          throw new Error("One or more claims not found");
        }
      }

      const aiReportSummary = await aiSummaryService.generateAISummary(reportContent);

      const newReport = new Report({
        ...reportData,
        aiReportSummary,
        claimIds: claimIds || []
      });

      const savedReport = await newReport.save();
      console.log("Saved Report:", savedReport); // ✅ confirm successful DB save

      // Return populated report
      return await Report.findById(savedReport._id)
        .populate('userId', 'username email')
        .populate('claimIds', 'claimTitle aiTruthIndex');
    } catch (err) {
      console.error("Error in createReport:", err); // ❌ log any caught error
      throw err; // rethrow to let controller handle the error response
    }
  }

  // Update report
  static async updateReport(id, updateData) {
    return await Report.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'username email')
     .populate('claimIds', 'claimTitle aiTruthIndex');
  }

  // Delete report
  static async deleteReport(id) {
    return await Report.findByIdAndDelete(id);
  }

  // Get reports by truth verdict
  static async getReportsByVerdict(verdict) {
    return await Report.find({ truthVerdict: verdict })
      .populate('userId', 'username email')
      .populate('claimIds', 'claimTitle aiTruthIndex')
      .sort({ createdAt: -1 });
  }

  // Get reports by user
  static async getReportsByUser(userId) {
    return await Report.find({ userId })
      .populate('userId', 'username email')
      .populate('claimIds', 'claimTitle aiTruthIndex')
      .sort({ createdAt: -1 });
  }

  static async getLatestReports() {
    const reports = await Report.find({})
      .populate('userId', 'username email')
      .populate('claimIds', 'claimTitle aiTruthIndex')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(); // important: use lean() to allow adding custom fields

    // Append commentCount for each report
    const reportsWithCommentCount = await Promise.all(
      reports.map(async (report) => {
        const count = await Comment.countDocuments({
          targetType: 'report',
          targetId: report._id,
        });
        return {
          ...report,
          commentCount: count,
        };
      })
    );

    return reportsWithCommentCount;
  }
}

export default ReportService;
