const router = require("express").Router();
const { refData } = require("../controllers");
const path = require("path");
const { authentication, authorization } = require("../../config/auth");
const { upload } = require("../helper/upload");

// GET localhost:8080/home => Ambil data semua dari awal
router.get("/provinces", refData.provinces);
router.get("/cities/:id", refData.cities);
router.get("/districts/:id", refData.districts);

module.exports = router;
