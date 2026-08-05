const bcrypt = require("bcrypt");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const generateOTP = require("../utils/generateOTP");
const sendEmail = require("../utils/sendEmail");
const { passwordResetTemplate } = require("../utils/emailTemplates");

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const SALT_ROUNDS = 10;

const register = async ({ email, phone, password }) => {
  if (!email || !phone || !password) throw new AppError("All fields are required", 400);

  const [emailTaken, phoneTaken] = await Promise.all([
    User.findOne({ email }),
    User.findOne({ phone }),
  ]);
  if (emailTaken) throw new AppError("Email already in use", 400);
  if (phoneTaken) throw new AppError("Phone already in use", 400);

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  return User.create({ email, phone, password: hashedPassword });
};

const login = async ({ email, password }) => {
  if (!email || !password) throw new AppError("Email and password are required", 400);

  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new AppError("Invalid credentials", 400);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError("Invalid credentials", 400);

  return user;
};

const changePassword = async (userId, oldPassword, newPassword) => {
  if (!oldPassword || !newPassword) throw new AppError("Both passwords are required", 400);

  const user = await User.findById(userId).select("+password");
  if (!user) throw new AppError("User not found", 400);

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) throw new AppError("Old password is incorrect", 400);

  user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await user.save();
};

const requestPasswordReset = async (email) => {
  if (!email) throw new AppError("Email is required", 400);

  const user = await User.findOne({ email });
  if (!user) throw new AppError("User not found", 404);

  const otp = generateOTP();
  user.passwordReset = {
    otp: await bcrypt.hash(otp, SALT_ROUNDS),
    otpExpires: Date.now() + OTP_EXPIRY_MS,
  };
  await user.save();

  await sendEmail(email, "🔐 Password Reset - One Time Passcode (OTP)", passwordResetTemplate(otp));
};

const getUserWithValidOTP = async (email, otp) => {
  const user = await User.findOne({ email });
  if (!user || !user.passwordReset?.otp) throw new AppError("OTP not found", 400);
  if (user.passwordReset.otpExpires < Date.now()) throw new AppError("OTP expired", 400);

  const isMatch = await bcrypt.compare(otp, user.passwordReset.otp);
  if (!isMatch) throw new AppError("Invalid OTP", 400);

  return user;
};

const verifyOTP = async (email, otp) => {
  if (!email || !otp) throw new AppError("Email and OTP are required", 400);
  await getUserWithValidOTP(email, otp);
};

const resetPassword = async ({ email, otp, newPassword, confirmPassword }) => {
  if (!email || !otp || !newPassword || !confirmPassword)
    throw new AppError("All fields are required", 400);
  if (newPassword !== confirmPassword) throw new AppError("Passwords do not match", 400);

  const user = await getUserWithValidOTP(email, otp);

  user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.passwordReset = undefined;
  await user.save();
};

module.exports = {
  register,
  login,
  changePassword,
  requestPasswordReset,
  verifyOTP,
  resetPassword,
};
