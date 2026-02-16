const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { getProfile, getTeamMembers } = require("../controllers/userController");

router.get("/profile", auth, getProfile);
router.get("/team-members", auth, getTeamMembers);

module.exports = router;
