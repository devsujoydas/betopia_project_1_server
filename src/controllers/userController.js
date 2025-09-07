const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
 
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

    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const existPhone = await User.findOne({ phone });
    if (existPhone) {
      return res.status(400).json({ message: "User already exists with this phone" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      phone,
      password: hashedPassword,
      profileCompleted: false,
    });

    setTokenCookie(res, user._id);

    res.status(201).json({
      _id: user._id,
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

    const user = await User.findOne({ email });
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

const getProfile = (req, res) => {
  res.json(req.user); 
};




const updateProfile = async (req, res) => {
  try {
    const user = req.user;

    if (req.body.personalInfo) {
      user.personalInfo = { ...user.personalInfo, ...req.body.personalInfo };
    }

    if (req.body.contactInfo) {
      user.contactInfo = { ...user.contactInfo, ...req.body.contactInfo };
    }

    if (req.body.financialInfo) {
      user.financialInfo = { ...user.financialInfo, ...req.body.financialInfo };

      const {
        annualIncome = 0,
        landValue = 0,
        mobileMoneyBalance = 0,
        electricityBill = 0,
      } = user.financialInfo;

      const balance =
        annualIncome + landValue + mobileMoneyBalance - electricityBill;

      const calculateScore = (minBal, maxBal, minScore, maxScore, value) => {
        if (value <= minBal) return minScore;
        if (value >= maxBal) return maxScore;
        return (
          minScore +
          ((value - minBal) / (maxBal - minBal)) * (maxScore - minScore)
        );
      };

      let creditScore = 0;

      if (balance >= 0 && balance <= 39999) {
        creditScore = calculateScore(0, 39999, 0, 39, balance);
      } else if (balance >= 40000 && balance <= 59999) {
        creditScore = calculateScore(40000, 59999, 40, 59, balance);
      } else if (balance >= 60000 && balance <= 99999) {
        creditScore = calculateScore(60000, 99999, 60, 79, balance);
      } else if (balance >= 100000) {
        creditScore = 100; 
      }

      user.financialInfo.creditScore = Math.round(creditScore);
    }

    const { firstName, lastName, dateOfBirth, gender } = user.personalInfo;
    const { email, phone } = user.contactInfo;

    if (firstName && lastName && dateOfBirth && gender && email && phone) {
      user.profileCompleted = true;
    } else {
      user.profileCompleted = false;
    }

    await user.save();
    res.json(user);
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};




const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = req.user;

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Change Password Error:", err);
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

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
};
