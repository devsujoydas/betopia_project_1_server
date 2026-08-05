const asyncHandler = require("../utils/asyncHandler");
const dashboardService = require("../services/dashboardService");

const getDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getDashboardData(req.query);
  res.json(data);
});

module.exports = { getDashboard };
