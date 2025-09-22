const User = require("../models/User");

const getDashboard = async (req, res) => {
  try {
    const { city, minScore, maxScore, minIncome, status } = req.query;

    const filter = {};
 
    if (city) {
      filter["contactInfo.city"] = { $regex: new RegExp(city, "i") };
    }
 
    if (minScore || maxScore) {
      filter["financialInfo.creditScore"] = {};
      if (minScore) filter["financialInfo.creditScore"].$gte = Number(minScore);
      if (maxScore) filter["financialInfo.creditScore"].$lte = Number(maxScore);
    }
 
    if (minIncome) {
      filter["financialInfo.annualIncome"] = { $gte: Number(minIncome) };
    }
 
    if (status && status.toLowerCase() !== "all") {
      filter["loanInfo.loanStatus"] = status.toLowerCase(); // FIXED
    }
 
    const totalClients = await User.countDocuments();
    const approvedClients = await User.countDocuments({ "loanInfo.loanStatus": "approved" });
    const pendingClients = await User.countDocuments({ "loanInfo.loanStatus": "pending" });
    const rejectedClients = await User.countDocuments({ "loanInfo.loanStatus": "rejected" });
 
    const users = await User.find(filter).select("-password");

    res.json({
      summary: {
        totalClients,
        approvedClients,
        pendingClients,
        rejectedClients,
      },
      users,
    });
  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};



module.exports = { getDashboard };
