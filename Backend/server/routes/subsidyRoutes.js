const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  checkSubsidy,
} = require("../controllers/subsidyController");

router.post("/check", auth, checkSubsidy);

module.exports = router;
