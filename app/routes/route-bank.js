const router = require('express').Router();
const { bank } = require('../controllers');
const multer  = require('multer')
//const upload = multer({ dest: './uploads/reports/' })
const { authentication, authorization } = require("../../config/auth");


// GET localhost:8080/home => Ambil data semua dari awal
router.get('/mt940', bank.getDataMt940);
router.get('/alldata', authentication, bank.dataMt940);
router.get('/list', authentication, bank.listbank);


module.exports = router;
