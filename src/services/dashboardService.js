const User = require("../models/User");

const buildFilter = ({ city, minScore, maxScore, minIncome, status }) => {
  const filter = {};

  if (city) filter["contactInfo.city"] = { $regex: new RegExp(city, "i") };

  if (minScore || maxScore) {
    filter["financialInfo.creditScore"] = {};
    if (minScore) filter["financialInfo.creditScore"].$gte = Number(minScore);
    if (maxScore) filter["financialInfo.creditScore"].$lte = Number(maxScore);
  }

  if (minIncome) filter["financialInfo.annualIncome"] = { $gte: Number(minIncome) };

  if (status && status.toLowerCase() !== "all") {
    filter["loanInfo.loanStatus"] = status.toLowerCase();
  }

  return filter;
};

const getDashboardData = async (query) => {
  const filter = buildFilter(query);

  const [totalClients, approvedClients, pendingClients, rejectedClients, users] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ "loanInfo.loanStatus": "approved" }),
    User.countDocuments({ "loanInfo.loanStatus": "pending" }),
    User.countDocuments({ "loanInfo.loanStatus": "rejected" }),
    User.find(filter),
  ]);

  return {
    summary: { totalClients, approvedClients, pendingClients, rejectedClients },
    users,
  };
};

module.exports = { getDashboardData };
