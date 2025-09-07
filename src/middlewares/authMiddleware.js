const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

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

module.exports = protect;
