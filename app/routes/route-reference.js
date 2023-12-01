const router = require("express").Router();
const { refData } = require("../controllers");
const path = require("path");
const { authentication, authorization } = require("../../config/auth");
const { upload } = require("../helper/upload");

// GET localhost:8080/home => Ambil data semua dari awal
router.get("/provinces", refData.provinces);
router.get("/cities/:id", refData.cities);
router.get("/districts/:id", refData.districts);
router.get("/gla", authentication, refData.glaccount);
router.get("/gltype", authentication, refData.gltype);
router.post("/addgl", authentication, refData.createGlAccount);
router.put("/updategl/:id", authentication, refData.updateGlAccount);
router.delete("/removegl", authentication, refData.deleteGL);

router.get("/masterbank", authentication, refData.masterbank);
router.post("/addbank", authentication, refData.createMasterBank);
router.put("/updatebank/:id", authentication, refData.updateBank);
router.delete("/removebank", authentication, refData.deleteBank);


module.exports = router;
