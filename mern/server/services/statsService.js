import { Claim, Report, User } from "../models/index.js";

const fetchStats = async () => {
  const [claimsCount, reportsCount, usersCount] = await Promise.all([
    Claim.countDocuments({ deletedAt: null }),
    Report.countDocuments({ deletedAt: null }),
    User.countDocuments()
  ]);

  return {
    claimsVerified: claimsCount,
    reportsPublished: reportsCount,
    activeUsers: usersCount,
    accuracyRate: "94%" // You can update this later with actual logic
  };
};

export default {
  fetchStats,
};
