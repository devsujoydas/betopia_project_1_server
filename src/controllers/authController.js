const asyncHandler = require("../utils/asyncHandler");
const { setTokenCookie } = require("../utils/setTokenCookie");
const authService = require("../services/authService");

const registerUser = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  setTokenCookie(res, user._id);
  res.status(201).json(user);
});

const loginUser = asyncHandler(async (req, res) => {
  const user = await authService.login(req.body);
  setTokenCookie(res, user._id);
  res.json(user);
});

const logoutUser = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  await authService.changePassword(req.user._id, oldPassword, newPassword);
  res.json({ message: "Password updated successfully" });
});

const requestPasswordReset = asyncHandler(async (req, res) => {
  await authService.requestPasswordReset(req.body.email);
  res.json({ message: "OTP sent to email" });
});

const verifyOTP = asyncHandler(async (req, res) => {
  await authService.verifyOTP(req.body.email, req.body.otp);
  res.json({ message: "OTP verified" });
});

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  res.json({ message: "Password reset successful" });
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  changePassword,
  requestPasswordReset,
  verifyOTP,
  resetPassword,
};
