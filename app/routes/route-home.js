const router = require('express').Router();
const { home } = require('../controllers');
const multer  = require('multer')
//const upload = multer({ dest: './uploads/reports/' })
const { authentication, authorization } = require("../../config/auth");


// GET localhost:8080/home => Ambil data semua dari awal
router.get('/program', home.getAllProgram);
router.get('/program/:id', home.getProgramById);
router.post('/createprogram', authentication, home.registerProgram);


module.exports = router;
