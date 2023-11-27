const router = require("express").Router();
const { usererp } = require("../controllers");
const multer = require("multer");
//const upload = multer({ dest: './uploads/reports/' })
const { authentication, authorization } = require("../../config/auth");

// GET localhost:8080/home => Ambil data semua dari awal
router.post("/login", usererp.loginUser);
router.post("/register", authentication, usererp.registerUser);
router.get("/detail/:id", authentication, usererp.detailUser);
router.put("/update/:id", authentication, usererp.updateUser);
router.get("/users", authentication, usererp.AllUser);
router.put("/verifed/:id", authentication, usererp.verifiedUser);
router.put("/updaterole/:id", authentication, usererp.updateRoles);
router.get("/types", authentication, usererp.getDataType);

module.exports = router;
