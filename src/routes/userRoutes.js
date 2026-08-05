const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");
const {
  getProfile,
  updateProfile,
  updateProfilePicture,
  deleteAccount,
  applyLoan,
} = require("../controllers/userController");

router.get("/profile", protect, getProfile);
router.put("/update-profile-picture", protect, upload.single("image"), updateProfilePicture);
router.put("/update-profile", protect, updateProfile);
router.delete("/account-delete", protect, deleteAccount);
router.post("/loans/apply", protect, applyLoan);

module.exports = router;
