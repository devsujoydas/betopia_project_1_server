const express = require("express");
const router = express.Router()

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
 

router.use("/api/auth", authRoutes);
router.use("/api/users", userRoutes);
router.use("/api/dashboard", dashboardRoutes);



module.exports = router;
