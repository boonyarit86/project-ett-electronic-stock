const multer = require("multer");
const path = require("path");
const AppError = require("../utils/appError");

// Multer config
module.exports = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname);  
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png" && ext !== ".jfif") {
      cb(new AppError("ไม่รองรับไฟล์นี้", 400), false);
      return;
    }
    cb(null, true);
  },
});