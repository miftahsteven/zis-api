const router = require('express').Router();
const { mustahiq } = require('../controllers');
const multer  = require('multer')
//const upload = multer({ dest: './uploads/reports/' })
const { authentication, authorization } = require("../../config/auth");


// GET localhost:8080/home => Ambil data semua dari awal
router.get('/getdata', authentication, mustahiq.getMustahiqById);



module.exports = router;
