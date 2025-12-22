const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  addEnergy,
  getEnergy,
} = require("../controllers/energyController");

router.post("/add", auth, addEnergy);
router.get("/my", auth, getEnergy);

module.exports = router;
