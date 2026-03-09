const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const activityController = require("../controllers/activityController");

router.get("/my-history", authMiddleware, activityController.getMyHistory);

module.exports = router;
