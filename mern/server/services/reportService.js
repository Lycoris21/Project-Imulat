import { Report, User, Claim } from "../models/index.js";

class ReportService {
  // Get all reports
  static async getAllReports() {
    return await Report.find({})
      .populate('userId', 'username email')
      .populate('claimIds', 'claimTitle aiTruthIndex')
      .sort({ createdAt: -1 });
  }

  // Get report by ID
  static async getReportById(id) {
    return await Report.findById(id)
      .populate('userId', 'username email bio')
      .populate('claimIds');
  }

  // Create new report
  static async createReport(reportData) {
    const { userId, claimIds } = reportData;

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

    const newReport = new Report({
      ...reportData,
      claimIds: claimIds || []
    });

    const savedReport = await newReport.save();
    
    // Return populated report
    return await Report.findById(savedReport._id)
      .populate('userId', 'username email')
      .populate('claimIds', 'claimTitle aiTruthIndex');
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
}

export default ReportService;
