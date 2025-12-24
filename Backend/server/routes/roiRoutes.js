const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  getROIAnalysis,
  downloadROIReport,
} = require("../controllers/roiController");

router.post("/calculate", auth, getROIAnalysis);
router.post("/report", auth, downloadROIReport);

module.exports = router;
