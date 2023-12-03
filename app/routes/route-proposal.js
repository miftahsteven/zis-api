const router = require("express").Router();
const { proposal } = require("../controllers");
const path = require("path");
const { authentication, authorization } = require("../../config/auth");
const { upload } = require("../helper/upload");

// GET localhost:8080/home => Ambil data semua dari awal
router.post("/create", authentication, proposal.createProposal);
router.get("/details/:id", authentication, proposal.detailProposal);
router.get("/all", authentication, proposal.getAllProposal);
router.post("/approved", authentication, proposal.approvalProposal);
router.post("/update/:id", authentication, proposal.updateProposal);

module.exports = router;
