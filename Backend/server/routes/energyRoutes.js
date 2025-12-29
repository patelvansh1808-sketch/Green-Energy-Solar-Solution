const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  addEnergy,
  getEnergy,
  generateSampleData,
} = require("../controllers/energyController");

router.post("/add", auth, addEnergy);
router.get("/my", auth, getEnergy);
router.post("/generate-sample", auth, generateSampleData);

module.exports = router;
