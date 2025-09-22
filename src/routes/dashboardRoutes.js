const express = require("express");
const router = express.Router(); 
const { adminProtect} = require("../middlewares/authMiddleware");
const { getDashboard } = require("../controllers/dashboardController");
 
router.get("/", adminProtect, getDashboard);

module.exports = router;
