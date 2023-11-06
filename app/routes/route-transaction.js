const router = require('express').Router();
const { transaction } = require('../controllers');
const multer  = require('multer')
//const upload = multer({ dest: './uploads/reports/' })
const { authentication, authorization } = require("../../config/auth");


// GET localhost:8080/home => Ambil data semua dari awal
router.get('/mt940', transaction.getDataMt940);


module.exports = router;
