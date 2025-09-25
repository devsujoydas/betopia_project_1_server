const calculateCreditScore = require("../../utils/calculateCreditScore");
const validateProfile = require("../../utils/validateProfile");

const getProfile = (req, res) => {
  res.json(req.user);
};




const updateProfilePicture = async (req, res) => {
  try {
    const user = req.user;
    const { profilePhotoUrl } = req.body;

    if (!profilePhotoUrl) {
      return res.status(400).json({ message: "Profile photo URL is required" });
    }

    user.personalInfo.profilePhotoUrl = profilePhotoUrl;
    await user.save();

    res.json({
      success: true,
      message: "Profile picture updated successfully",
      profilePhotoUrl: user.personalInfo.profilePhotoUrl,
    });
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
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
      return res
        .status(400)
        .json({ message: "Loan amount is required and must be positive" });
    }

    const user = req.user;

    // Monthly income ধরে নাও (annualIncome ÷ 12)
    const monthlyIncome = user.financialInfo.annualIncome / 12;

    // Simple assumption: 1 year loan, interest ignored
    const monthlyDebt = amountRequested / 12;

    // Debt-to-Income Ratio (0–100%)
    const debtToIncomeRatio = Math.min(Math.max(monthlyDebt / monthlyIncome, 0), 1);

    // Save loan info
    user.loanInfo.amountRequested = amountRequested;
    user.loanInfo.loanStatus = "pending";

    // Save DTI as percentage with 2 decimals
    user.financialInfo.debtToIncomeRatio = parseFloat(
      (debtToIncomeRatio * 100).toFixed(2)
    );

    await user.save();

    res.json(user );
  } catch (err) {
    console.error("Apply Loan Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};



module.exports = { deleteAccount, getProfile, updateProfilePicture, updateProfile, applyLoan };
