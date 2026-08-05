const AppError = require("../utils/AppError");
const calculateCreditScore = require("../utils/calculateCreditScore");
const validateProfile = require("../utils/validateProfile");
const { uploadImageToCloudinary, deleteImageFromCloudinary } = require("./uploadService");

const PROFILE_IMAGE_FOLDER = "guiheandco/profiles";

const updateProfile = async (user, { personalInfo, contactInfo, financialInfo, loanInfo }) => {
  if (personalInfo) user.personalInfo = { ...user.personalInfo.toObject(), ...personalInfo };
  if (contactInfo) user.contactInfo = { ...user.contactInfo.toObject(), ...contactInfo };

  if (financialInfo) {
    user.financialInfo = { ...user.financialInfo.toObject(), ...financialInfo };
    user.financialInfo.creditScore = calculateCreditScore(user.financialInfo);
    user.financialInfo.creditScoreUpdatedAt = new Date();
  }

  if (loanInfo && typeof loanInfo.existingLoans === "boolean") {
    user.loanInfo.existingLoans = loanInfo.existingLoans;
  }

  const wasCompleted = user.profileCompleted;
  user.profileCompleted = validateProfile(user.personalInfo, user.contactInfo, user.financialInfo);

  if (!wasCompleted && user.profileCompleted) {
    user.profileSubmittedAt = new Date();
  }

  await user.save();
  return user;
};

const updateProfilePicture = async (user, file) => {
  if (!file) throw new AppError("Image file is required", 400);

  const previousPublicId = user.personalInfo.profileImage?.publicId;

  const { url, publicId } = await uploadImageToCloudinary(file.buffer, PROFILE_IMAGE_FOLDER);
  user.personalInfo.profileImage = { url, publicId };
  await user.save();

  if (previousPublicId) await deleteImageFromCloudinary(previousPublicId);

  return user;
};

const deleteAccount = async (user) => {
  const publicId = user.personalInfo.profileImage?.publicId;

  await user.deleteOne();

  if (publicId) await deleteImageFromCloudinary(publicId);
};

const applyLoan = async (user, amountRequested) => {
  if (!amountRequested || amountRequested <= 0) {
    throw new AppError("Loan amount is required and must be positive", 400);
  }

  if (user.loanInfo.loanStatus === "pending") {
    throw new AppError("You already have a pending loan application", 400);
  }

  const monthlyIncome = user.financialInfo.annualIncome / 12;
  const monthlyDebt = amountRequested / 12;

  const debtToIncomeRatio =
    monthlyIncome > 0 ? Math.min(Math.max(monthlyDebt / monthlyIncome, 0), 1) : 1;

  user.loanInfo.amountRequested = amountRequested;
  user.loanInfo.loanStatus = "pending";
  user.loanInfo.appliedAt = new Date();
  user.financialInfo.debtToIncomeRatio = parseFloat((debtToIncomeRatio * 100).toFixed(2));

  await user.save();
  return user;
};

module.exports = {
  updateProfile,
  updateProfilePicture,
  deleteAccount,
  applyLoan,
};