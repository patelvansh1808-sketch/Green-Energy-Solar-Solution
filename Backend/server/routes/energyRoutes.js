const express = require("express");
const router = express.Router();
const { addEnergy, getEnergy } = require("../controllers/energyController");
const auth = require("../middleware/authMiddleware");

router.post("/", auth, addEnergy);
router.get("/", auth, getEnergy);

module.exports = router;