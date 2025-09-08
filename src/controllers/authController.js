const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../../utils/sendEmail");

const setTokenCookie = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return token;
};
const registerUser = async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    if (!email || !phone || !password) return res.status(400).json({ message: "All fields are required" });

    const existUser = await User.findOne({ email });
    if (existUser) return res.status(400).json({ message: "User already exists with this email" });

    const existPhone = await User.findOne({ phone });
    if (existPhone) return res.status(400).json({ message: "User already exists with this phone" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, phone, password: hashedPassword });

    setTokenCookie(res, user._id);

    res.status(201).json({
      _id: user._id, email: user.email, phone: user.phone,
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
      _id: user._id,
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
    if (!oldPassword || !newPassword) return res.status(400).json({ message: "Both passwords are required" });

    const user = await User.findById(req.user._id).select("+password");
    if (!user || !user.password) return res.status(400).json({ message: "User not found or password missing" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Old password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const validateOTP = (user, otp) => {
  if (!user || !user.resetPasswordOTP) return "OTP not found";
  if (user.resetPasswordExpires < Date.now()) return "OTP expired";
  if (user.resetPasswordOTP !== otp) return "Invalid OTP";
  return null;
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail(
      email,
      "Password Reset OTP",
      `
      <div style="font-family: Arial, sans-serif; background:#f4f7fb; padding:20px;">
        <div style="max-width:500px;margin:auto;background:#fff;border-radius:8px;padding:30px;box-shadow:0 4px 10px rgba(0,0,0,0.1);">
          <h1 style="color:#2c3e50;text-align:center;">🔐 Password Reset</h1>
          <p style="color:#555;font-size:16px;">Use the OTP below to reset your password:</p>
          <div style="text-align:center;margin:20px 0;">
            <h2 style="display:inline-block;background:#2c3e50;color:#fff;padding:12px 24px;border-radius:6px;letter-spacing:2px;">
              ${otp}
            </h2>
          </div>
          <p style="color:#555;font-size:14px;text-align:center;">Expires in <strong>10 minutes</strong>.</p>
        </div>
      </div>`
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
    const user = await User.findOne({ email });
    const error = validateOTP(user, otp);
    if (error) return res.status(400).json({ message: error });

    res.json({ message: "OTP verified" });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    const user = await User.findOne({ email });
    const error = validateOTP(user, otp);
    if (error) return res.status(400).json({ message: error });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  registerUser, loginUser, logoutUser, changePassword,
  requestPasswordReset, verifyOTP, resetPassword
};
