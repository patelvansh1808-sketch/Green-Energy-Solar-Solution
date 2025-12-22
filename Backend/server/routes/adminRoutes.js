const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const {
  getAllUsers,
  getAllBookings,
} = require("../controllers/adminController");

router.get("/users", auth, role("admin"), getAllUsers);
router.get("/bookings", auth, role("admin"), getAllBookings);

module.exports = router;
