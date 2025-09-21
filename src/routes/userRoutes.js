const express = require("express");
const router = express.Router();

const protect = require("../middlewares/authMiddleware");
const { getProfile, updateProfile, deleteAccount, applyLoan, updateProfilePicture,} = require("../controllers/userController"); 

router.get("/profile", protect, getProfile);
router.put("/update-profilePicture", protect, updateProfilePicture);
router.put("/update-profile", protect, updateProfile);
router.delete("/delete", protect, deleteAccount);
router.post("/loans/apply", protect, applyLoan);

module.exports = router;
