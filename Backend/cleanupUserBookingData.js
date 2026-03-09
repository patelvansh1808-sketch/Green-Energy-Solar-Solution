const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./server/models/User");
const Booking = require("./server/models/Booking");
const Customer = require("./server/models/Customer");
const Notification = require("./server/models/Notification");

const cleanupUserData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB");

    const userEmail = "patel200618@gmail.com";
    console.log(`\n🔍 Searching for user with email: ${userEmail}`);

    // Find user by email
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      console.log(`❌ User with email ${userEmail} not found`);
      await mongoose.connection.close();
      return;
    }

    console.log(`✅ Found user: ${user.name} (ID: ${user._id})`);

    // Find all bookings for this user
    const bookings = await Booking.find({ user: user._id });
    console.log(`\n📋 Found ${bookings.length} booking(s) for this user`);

    if (bookings.length > 0) {
      console.log("\nBookings to be deleted:");
      bookings.forEach((b, idx) => {
        console.log(`  ${idx + 1}. ${b.bookingId} - Status: ${b.status}`);
      });
    }

    // Find customer record associated with this user
    const customer = await Customer.findOne({ userId: user._id });
    console.log(`\n👤 Customer record: ${customer ? customer._id : "Not found"}`);

    // Confirm deletion
    console.log("\n⚠️  About to delete:");
    console.log(`  • ${bookings.length} booking(s)`);
    if (customer) console.log(`  • 1 customer record`);
    console.log(`  • All notifications related to this user`);
    console.log(`  • All booking-related notifications`);

    // Perform deletions
    console.log("\n🗑️  Deleting...");

    // Delete all bookings
    const deleteBookingsResult = await Booking.deleteMany({ user: user._id });
    console.log(`✅ Deleted ${deleteBookingsResult.deletedCount} booking(s)`);

    // Delete customer record
    if (customer) {
      await Customer.deleteOne({ _id: customer._id });
      console.log(`✅ Deleted customer record`);
    }

    // Delete all notifications for this user
    const deleteNotificationsResult = await Notification.deleteMany({
      userId: user._id,
    });
    console.log(`✅ Deleted ${deleteNotificationsResult.deletedCount} notification(s)`);

    // Delete booking-related notifications
    const deleteBookingNotificationsResult = await Notification.deleteMany({
      relatedId: { $in: bookings.map((b) => b._id) },
    });
    console.log(
      `✅ Deleted ${deleteBookingNotificationsResult.deletedCount} booking-related notification(s)`
    );

    console.log("\n✅ ✅ ✅ All booking data deleted successfully!");
    console.log(`\nUser ${userEmail} bookings and related data have been completely removed.`);

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error during cleanup:", error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

cleanupUserData();
