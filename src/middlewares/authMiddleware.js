const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    if (!req.user) {
      res.clearCookie("token");
      return res.status(401).json({ message: "Unauthorized" });
    }

    next();
  } catch (err) {
    res.clearCookie("token");
    return res.status(401).json({ message: "Unauthorized" });
  }
};

const adminProtect = async (req, res, next) => {
  await protect(req, res, async () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied, not admin" });
    }
    next();
  });
};

module.exports = { protect, adminProtect };
