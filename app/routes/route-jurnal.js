const router = require("express").Router();
const { jurnal } = require("../controllers");
const path = require("path");
const { authentication, authorization } = require("../../config/auth");
const { upload } = require("../helper/upload");

// GET localhost:8080/home => Ambil data semua dari awal
router.get("/perintahbayar", authentication, jurnal.jurnalPerintahBayar);
router.get("/category", authentication, jurnal.jurnalCategory);
router.post("/create", authentication, jurnal.createJurnal);

module.exports = router;
