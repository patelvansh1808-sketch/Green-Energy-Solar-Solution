const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const connectDB = require("./server/config/db");
const Booking = require("./server/models/Booking");
const Project = require("./server/models/Project");

const run = async () => {
  try {
    await connectDB();

    const bookingIds = await Booking.find().distinct("_id");

    const result = await Project.deleteMany({
      bookingId: { $exists: true, $ne: null, $nin: bookingIds },
    });

    console.log(
      `Deleted ${result.deletedCount} projects linked to deleted bookings.`
    );

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Cleanup failed:", err);
    try {
      await mongoose.connection.close();
    } catch (e) {
      // ignore
    }
    process.exit(1);
  }
};

run();
