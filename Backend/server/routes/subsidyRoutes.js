const express = require("express");
const router = express.Router();
const { checkSubsidy } = require("../controllers/subsidyController");

router.post("/check", checkSubsidy);

module.exports = router;