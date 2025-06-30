import { Report, User, Claim, Comment } from "../models/index.js";
import aiSummaryService from "./aiSummaryService.js";
import ReactionService from "./reactionService.js";

let aiEnabled = true;

class ReportService {
  // Get all reports
  static async getAllReports(page = 1, limit = 24, sort = 'newest') {
    const skip = (page - 1) * limit;
    
    // Build sort criteria
    let sortCriteria = { createdAt: -1 }; // default: newest
    switch (sort) {
      case 'oldest':
        sortCriteria = { createdAt: 1 };
        break;
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        break;
      case 'thisWeek':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        break;
      case 'thisMonth':
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        break;
      case 'mostLiked':
        sortCriteria = { 'reactionCounts.like': -1 };
        break;
      case 'mostCommented':
        sortCriteria = { commentCount: -1 };
        break;
      case 'highestTruth':
        sortCriteria = { truthVerdict: -1 };
        break;
      default:
        sortCriteria = { createdAt: -1 };
    }

    // Base query
    let query = { deletedAt: null };
    
    // Add date filters for time-based sorts
    if (sort === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      query.createdAt = { $gte: today, $lt: tomorrow };
    } else if (sort === 'thisWeek') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      query.createdAt = { $gte: weekAgo };
    } else if (sort === 'thisMonth') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      query.createdAt = { $gte: monthAgo };
    }

    const [reports, total] = await Promise.all([
      Report.find(query)
        .populate('userId', 'username email')
        .populate('claimIds', 'claimTitle aiTruthIndex')
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit),
      Report.countDocuments(query)
    ]);

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

    return {
      reports: reportsWithMeta,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
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
  static async searchReports(query, page = 1, limit = 24, sort = 'newest') {
    const skip = (page - 1) * limit;
    const searchRegex = new RegExp(query, 'i'); // Case-insensitive search

    // Build sort criteria
    let sortCriteria = { createdAt: -1 }; // default: newest
    switch (sort) {
      case 'oldest':
        sortCriteria = { createdAt: 1 };
        break;
      case 'mostLiked':
        sortCriteria = { 'reactionCounts.like': -1 };
        break;
      case 'mostCommented':
        sortCriteria = { commentCount: -1 };
        break;
      case 'highestTruth':
        sortCriteria = { truthVerdict: -1 };
        break;
      default:
        sortCriteria = { createdAt: -1 };
    }

    const searchQuery = {
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
    };

    const [reports, total] = await Promise.all([
      Report.find(searchQuery)
        .populate('userId', 'username email')
        .populate('claimIds', 'claimTitle aiTruthIndex')
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit),
      Report.countDocuments(searchQuery)
    ]);

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

    return {
      reports: reportsWithMeta,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }


}

export default ReportService;
