import { Report, User, Claim, Comment } from "../models/index.js";
import aiSummaryService from "./aiSummaryService.js";
import ReactionService from "./reactionService.js";

let aiEnabled = false;

class ReportService {
  // Get all reports
  static async getAllReports() {
    const reports = await Report.find({deletedAt: null})
      .populate('userId', 'username email')
      .populate('claimIds', 'claimTitle aiTruthIndex')
      .sort({ createdAt: -1 });

    const reportsWithMeta = await Promise.all(
      reports.map(async (report) => {
        const count = await Comment.countDocuments({
          targetType: 'report',
          targetId: report._id,
        });

        const reactionCounts = await ReactionService.countReactions(report._id, 'report');
        const plainReport = report.toObject({ virtuals: true });

        return {
          ...plainReport,
          commentCount: count,
          reactionCounts
        };
      })
    );

    return reportsWithMeta;
  }

  // Get report by ID
  static async getReportById(id) {
    const report = await Report.findOne({ _id: id, deletedAt: null })
      .populate('userId', 'username email bio')
      .populate('claimIds');

    if (!report) return null;

    const reactionCounts = await ReactionService.countReactions(id, 'report');
    const commentCount = await Comment.countDocuments({ targetType: 'report', targetId: id });
    const reportObj = report.toObject({ virtuals: true });
    reportObj.reactionCounts = reactionCounts;
    reportObj.commentCount = commentCount;

    return reportObj;
  }

  // Create new report
  static async createReport(reportData) {
    const { userId, claimIds, reportContent } = reportData;

    try {
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");

      if (claimIds && claimIds.length > 0) {
        const claims = await Claim.find({ _id: { $in: claimIds } });
        if (claims.length !== claimIds.length) {
          throw new Error("One or more claims not found");
        }
      }

      const aiReportSummary = aiEnabled ? await aiSummaryService.generateAISummary(reportContent) : "SAMPLE AI SUMMARY";

      const newReport = new Report({
        ...reportData,
        aiReportSummary,
        claimIds: claimIds || []
      });

      const savedReport = await newReport.save();

      const populated = await Report.findById(savedReport._id)
        .populate('userId', 'username email')
        .populate('claimIds', 'claimTitle aiTruthIndex');

      return populated?.toObject({ virtuals: true }) || null;
    } catch (err) {
      console.error("Error in createReport:", err);
      throw err;
    }
  }

  // Update report
  static async updateReport(id, updateData) {
    const updated = await Report.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('userId', 'username email')
      .populate('claimIds', 'claimTitle aiTruthIndex');

    return updated?.toObject({ virtuals: true }) || null;
  }

  // Delete report
  static async deleteReport(id) {
    return await Report.findByIdAndUpdate(
      id,
      { deletedAt: new Date() },
      { new: true }
    );
  }

  // Get reports by truth verdict
  static async getReportsByVerdict(verdict) {
    const reports = await Report.find({ truthVerdict: verdict, deletedAt: null })
      .populate('userId', 'username email')
      .populate('claimIds', 'claimTitle aiTruthIndex')
      .sort({ createdAt: -1 });

    const reportsWithMeta = await Promise.all(
      reports.map(async (report) => {
        const count = await Comment.countDocuments({
          targetType: 'report',
          targetId: report._id,
        });

        const reactionCounts = await ReactionService.countReactions(report._id, 'report');

        return {
          ...report.toObject({ virtuals: true }),
          commentCount: count,
          reactionCounts,
        };
      })
    );

    return reportsWithMeta;
  }


  // Get reports by user
  static async getReportsByUser(userId) {
    const reports = await Report.find({ userId, deletedAt: null })
      .populate('userId', 'username email')
      .populate('claimIds', 'claimTitle aiTruthIndex')
      .sort({ createdAt: -1 });

    const reportsWithMeta = await Promise.all(
      reports.map(async (report) => {
        const count = await Comment.countDocuments({
          targetType: 'report',
          targetId: report._id,
        });

        const reactionCounts = await ReactionService.countReactions(report._id, 'report');

        return {
          ...report.toObject({ virtuals: true }),
          commentCount: count,
          reactionCounts,
        };
      })
    );

    return reportsWithMeta;
  }

  // Get latest reports
  static async getLatestReports() {
    const reports = await Report.find({ deletedAt: null })
      .populate('userId', 'username email')
      .populate('claimIds', 'claimTitle aiTruthIndex')
      .sort({ createdAt: -1 })
      .limit(10);

    const reportsWithMeta = await Promise.all(
      reports.map(async (report) => {
        const count = await Comment.countDocuments({
          targetType: 'report',
          targetId: report._id,
        });

        const reactionCounts = await ReactionService.countReactions(report._id, 'report');

        return {
          ...report.toObject({ virtuals: true }),
          commentCount: count,
          reactionCounts,
        };
      })
    );

    return reportsWithMeta;
  }

  // Search reports
  static async searchReports(query) {
    const searchRegex = new RegExp(query, 'i'); // Case-insensitive search

    const reports = await Report.find({
      $and: [
        {
          $or: [
            { reportTitle: { $regex: searchRegex } },
            { reportContent: { $regex: searchRegex } },
            { reportDescription: { $regex: searchRegex } },
            { aiReportSummary: { $regex: searchRegex } }
          ]
        },
        { deletedAt: null }
      ]
    })
      .populate('userId', 'username email')
      .populate('claimIds', 'claimTitle aiTruthIndex')
      .sort({ createdAt: -1 })
      .limit(50); // Limit results

    const reportsWithMeta = await Promise.all(
      reports.map(async (report) => {
        const count = await Comment.countDocuments({
          targetType: 'report',
          targetId: report._id,
        });

        const reactionCounts = await ReactionService.countReactions(report._id, 'report');
        const plainReport = report.toObject({ virtuals: true });

        return {
          ...plainReport,
          commentCount: count,
          reactionCounts
        };
      })
    );

    return reportsWithMeta;
  }


}

export default ReportService;
