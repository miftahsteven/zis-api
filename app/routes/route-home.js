const router = require("express").Router();
const { home } = require("../controllers");
const path = require("path");
const dest = path.resolve(__dirname, "../../uploads/banners/");
const multer = require("multer");
const { authentication, authorization } = require("../../config/auth");

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
    console.log({ file });
    const ext = path.extname(file.originalname);
    if (!ext.match(/\.(jpg|jpeg|png)\b/)) {
      return cb(new Error("File harus berupa gambar"));
    }
    cb(null, true);
  },
});

// GET localhost:8080/home => Ambil data semua dari awal
router.get("/program", home.getAllProgram);
router.get("/program/:id", home.getProgramById);
router.post("/createprogram", authentication, upload.single("banner"), home.registerProgram);

module.exports = router;
