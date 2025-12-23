const express = require("express");
const router = express.Router();
const { generateReport } = require("../controllers/reportController");
const auth = require("../middleware/authMiddleware");

router.get("/", auth, generateReport);

module.exports = router;