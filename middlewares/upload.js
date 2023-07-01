const multer = require("multer");
const path = require("path");
const { HttpError } = require("../utils");

const uploadDir = path.join(__dirname, "../", "tmp");

const multerConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

// const multerConfig = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(HttpError(400, "Please, upload image"), false);
}

const upload = multer({
    storage: multerConfig,
    fileFilter: multerFilter,
});

module.exports = upload;