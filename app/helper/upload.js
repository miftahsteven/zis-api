const multer = require("multer");
const path = require("path");

const dest = path.resolve(__dirname, "../../uploads/");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5000000 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (!ext.match(/\.(jpg|jpeg|png)\b/)) {
      return cb(new Error("File harus berupa gambar"));
    }
    cb(null, true);
  },
});

module.exports = {
  upload,
};
