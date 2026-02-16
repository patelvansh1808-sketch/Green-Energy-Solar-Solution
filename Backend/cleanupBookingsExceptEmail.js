const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const connectDB = require("./server/config/db");
const User = require("./server/models/User");
const Booking = require("./server/models/Booking");

const EMAIL_TO_KEEP = "patel200618@gmail.com";

const run = async () => {
  try {
    await connectDB();

    const user = await User.findOne({ email: EMAIL_TO_KEEP }).select("_id email");
    if (!user) {
      console.error(`User not found for email: ${EMAIL_TO_KEEP}`);
      process.exit(1);
    }

    const result = await Booking.deleteMany({ user: { $ne: user._id } });
    console.log(
      `Deleted ${result.deletedCount} bookings. Kept bookings for ${user.email}.`
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
