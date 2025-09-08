const express = require("express");
const router = express.Router();

const protect = require("../middlewares/authMiddleware");
const { getProfile, updateProfile, deleteAccount,} = require("../controllers/userController");

router.get("/profile", protect, getProfile);
router.put("/updateProfile", protect, updateProfile);
router.delete("/delete", protect, deleteAccount);



module.exports = router;
