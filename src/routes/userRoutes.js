const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  requestPasswordReset,
  verifyOTP,
  resetPassword,
} = require("../controllers/userController");

const protect = require("../middlewares/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

router.get("/profile", protect, getProfile);
router.put("/updateProfile", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.delete("/delete", protect, deleteAccount);

router.post("/request-reset", requestPasswordReset);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

module.exports = router;
