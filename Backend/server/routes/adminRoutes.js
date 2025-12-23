const express = require("express");
const router = express.Router();
const { getAllUsers, getAllBookings } = require("../controllers/adminController");

router.get("/users", getAllUsers);
router.get("/bookings", getAllBookings);

module.exports = router;