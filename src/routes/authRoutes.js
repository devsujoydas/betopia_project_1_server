const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const {
  registerUser,
  loginUser,
  logoutUser,
  changePassword,
  requestPasswordReset,
  verifyOTP,
  resetPassword,
} = require("../controllers/authController");

router.post("/signup", registerUser);
router.post("/signin", loginUser);
router.post("/signout", logoutUser);

router.put("/change-password", protect, changePassword);

router.post("/request-reset", requestPasswordReset);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

module.exports = router;
