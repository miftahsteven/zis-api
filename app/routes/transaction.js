const router = require("express").Router();

const { donate } = require("../controllers/transaction");
const { authentication } = require("../../config/auth");
const { upload } = require("../helper/upload");
const { validateTransaction } = require("../middleware/transaction");

router.post("/donate", authentication, upload.single("evidence"), validateTransaction, donate);

module.exports = router;
