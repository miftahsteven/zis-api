const router = require('express').Router();
const { bank } = require('../controllers');
const path = require("path");
const multer  = require('multer')
const dest = path.resolve(__dirname, "../../uploads/");
const upload = multer({ dest: dest })
//const { upload } = require("../helper/upload");
const { authentication, authorization } = require("../../config/auth");
const fs = require("fs/promises");


// GET localhost:8080/home => Ambil data semua dari awal
router.get('/mt940', bank.getDataMt940);
router.get('/alldata', authentication, bank.dataMt940);
router.get('/list', authentication, bank.listbank);
router.post("/upload", authentication, upload.single("statement"), bank.statementCreate);


module.exports = router;
