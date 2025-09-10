const User = require("../models/User");

const getDashboard = async (req, res) => {
    try {

        const totalClients = await User.countDocuments();
        const approvedClients = await User.countDocuments({ "financialInfo.loanStatus": "Approved" });
        const pendingClients = await User.countDocuments({ "financialInfo.loanStatus": "Pending" });
        const rejectedClients = await User.countDocuments({ "financialInfo.loanStatus": "Rejected" });
        const users = await User.find().select("-password");
        
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
