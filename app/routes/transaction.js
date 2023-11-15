const router = require("express").Router();

const { donate, recurring } = require("../controllers/transaction");
const { authentication } = require("../../config/auth");
const { upload } = require("../helper/upload");
const { validateTransaction } = require("../middleware/transaction");

router.post("/donate", authentication, upload.single("evidence"), validateTransaction, donate);
router.post("/recurring", authentication, recurring);

module.exports = router;
