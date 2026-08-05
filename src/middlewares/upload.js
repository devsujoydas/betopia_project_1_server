const multer = require("multer");
const AppError = require("../utils/AppError");

const storage = multer.memoryStorage();

const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new AppError("Only JPG, PNG, WEBP and GIF images are allowed.", 400));
    }
    cb(null, true);
  },
});

module.exports = upload;
