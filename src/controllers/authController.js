const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const sendEmail = require("../../utils/sendEmail");


const setTokenCookie = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, 
  });

  return token;
};


const registerUser = async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    if (!email || !phone || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existUser = await User.findOne({ email });
    if (existUser) return res.status(400).json({ message: "Email already in use" });

    const existPhone = await User.findOne({ phone });
    if (existPhone) return res.status(400).json({ message: "Phone already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, phone, password: hashedPassword });

    setTokenCookie(res, user._id);

    res.status(201).json({
      id: user._id,
      email: user.email,
      phone: user.phone,
      profileCompleted: user.profileCompleted,
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    setTokenCookie(res, user._id);

    res.json({
      id: user._id,
      email: user.email,
      phone: user.phone,
      profileCompleted: user.profileCompleted,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

const logoutUser = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
      return res.status(400).json({ message: "Both passwords are required" });

    const user = await User.findById(req.user._id).select("+password");
    if (!user || !user.password)
      return res.status(400).json({ message: "User not found or password missing" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Old password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Change Password Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = await bcrypt.hash(otp, 10);

    user.passwordReset = {
      otp: hashedOTP,
      otpExpires: Date.now() + 10 * 60 * 1000,
    };
    await user.save();

    await sendEmail(
      email,
      "Password Reset OTP",
      `<h2>Your OTP: ${otp}</h2><p>Expires in 10 minutes</p>`
    );

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("Request Reset Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const user = await User.findOne({ email });
    if (!user || !user.passwordReset?.otp) return res.status(400).json({ message: "OTP not found" });

    if (user.passwordReset.otpExpires < Date.now()) return res.status(400).json({ message: "OTP expired" });

    const isMatch = await bcrypt.compare(otp, user.passwordReset.otp);
    if (!isMatch) return res.status(400).json({ message: "Invalid OTP" });

    res.json({ message: "OTP verified" });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
 
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;
    if (!email || !otp || !newPassword || !confirmPassword)
      return res.status(400).json({ message: "All fields are required" });

    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    const user = await User.findOne({ email });
    if (!user || !user.passwordReset?.otp) return res.status(400).json({ message: "OTP not found" });

    if (user.passwordReset.otpExpires < Date.now()) return res.status(400).json({ message: "OTP expired" });

    const isMatch = await bcrypt.compare(otp, user.passwordReset.otp);
    if (!isMatch) return res.status(400).json({ message: "Invalid OTP" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordReset = {};
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
 


module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  changePassword,
  requestPasswordReset,
  verifyOTP,
  resetPassword,
};
