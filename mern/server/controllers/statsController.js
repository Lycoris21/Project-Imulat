import statsService from "../services/statsService.js";

const getStats = async (req, res) => {
  try {
    const stats = await statsService.fetchStats();
    res.status(200).json(stats);
  } catch (error) {
    console.error("StatsController error:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};

export default {
  getStats,
};
