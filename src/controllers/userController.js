const calculateCreditScore = require("../../utils/calculateCreditScore");
const validateProfile = require("../../utils/validateProfile");

const getProfile = (req, res) => {
  res.json(req.user);
  console.log("hit")
};

const updateProfile = async (req, res) => {
  try {
    const user = req.user;
  
    if (req.body.personalInfo) user.personalInfo = { ...user.personalInfo, ...req.body.personalInfo };
    if (req.body.contactInfo) user.contactInfo = { ...user.contactInfo, ...req.body.contactInfo };
    if (req.body.financialInfo) {
      user.financialInfo = { ...user.financialInfo, ...req.body.financialInfo };
      user.financialInfo.creditScore = calculateCreditScore(user.financialInfo);
    }

    user.profileCompleted = validateProfile(user.personalInfo, user.contactInfo, user.financialInfo);

    await user.save();
    res.json(user);
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const user = req.user;
    await user.deleteOne();
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Delete Account Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

const applyLoan = async (req, res) => {
  try {
    const { amountRequested } = req.body;


    if (!amountRequested || amountRequested <= 0) {
      return res.status(400).json({ message: "Loan amount is required and must be positive" });
    }

    const user = req.user;
    user.financialInfo.amountRequested = amountRequested;
    user.financialInfo.loanStatus = "Pending";
    await user.save();

    res.json({
      message: "Loan application submitted successfully",
      loanStatus: user.financialInfo.loanStatus,
      amountRequested: user.financialInfo.amountRequested,
    });
  } catch (err) {
    console.error("Apply Loan Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { deleteAccount, getProfile, updateProfile, applyLoan };
