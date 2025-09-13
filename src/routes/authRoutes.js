const express = require('express');
const router = express.Router()
const protect = require('../middlewares/authMiddleware');

const { changePassword, requestPasswordReset, verifyOTP, resetPassword, registerUser, loginUser, logoutUser } = require('../controllers/authController');

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

router.put("/change-password", protect, changePassword);

router.post("/request-reset", requestPasswordReset);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);


module.exports = router;
