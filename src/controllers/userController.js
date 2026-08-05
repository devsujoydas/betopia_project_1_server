const asyncHandler = require("../utils/asyncHandler");
const userService = require("../services/userService");

const getProfile = (req, res) => {
  res.json(req.user);
};

const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user, req.body);
  res.json(user);
});

const updateProfilePicture = asyncHandler(async (req, res) => {
  const user = await userService.updateProfilePicture(req.user, req.file);
  res.json({
    success: true,
    message: "Profile picture updated successfully",
    profileImage: user.personalInfo.profileImage,
  });
});

const deleteAccount = asyncHandler(async (req, res) => {
  await userService.deleteAccount(req.user);
  res.json({ message: "Account deleted successfully" });
});

const applyLoan = asyncHandler(async (req, res) => {
  const user = await userService.applyLoan(req.user, req.body.amountRequested);
  res.json(user);
});

module.exports = {
  getProfile,
  updateProfile,
  updateProfilePicture,
  deleteAccount,
  applyLoan,
};
