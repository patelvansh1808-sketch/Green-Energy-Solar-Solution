const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./server/models/User");
const Customer = require("./server/models/Customer");
const Booking = require("./server/models/Booking");
const Energy = require("./server/models/Energy");
const Subsidy = require("./server/models/Subsidy");

const cleanupTestData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Find all test users
    const testUsers = await User.find({ email: { $regex: "test.*@gmail.com" } });
    const testUserIds = testUsers.map(u => u._id);

    console.log(`\n🔍 Found ${testUsers.length} test users to delete`);

    if (testUsers.length === 0) {
      console.log("✅ No test data found. Database is clean.");
      process.exit(0);
      return;
    }

    // Delete related data
    console.log("\n🗑️ Deleting related data...");
    
    const customersDeleted = await Customer.deleteMany({ userId: { $in: testUserIds } });
    console.log(`   - Customers deleted: ${customersDeleted.deletedCount}`);

    const bookingsDeleted = await Booking.deleteMany({ user: { $in: testUserIds } });
    console.log(`   - Bookings deleted: ${bookingsDeleted.deletedCount}`);

    const energyDeleted = await Energy.deleteMany({ userId: { $in: testUserIds } });
    console.log(`   - Energy records deleted: ${energyDeleted.deletedCount}`);

    const subsidiesDeleted = await Subsidy.deleteMany({ userId: { $in: testUserIds } });
    console.log(`   - Subsidies deleted: ${subsidiesDeleted.deletedCount}`);

    // Delete test users
    const usersDeleted = await User.deleteMany({ email: { $regex: "test.*@gmail.com" } });
    console.log(`   - Users deleted: ${usersDeleted.deletedCount}`);

    console.log("\n✨ Cleanup completed successfully!");
    console.log("📊 All test@gmail.com accounts and related data removed.");

    process.exit(0);
  } catch (error) {
    console.error("❌ Cleanup failed:", error.message);
    process.exit(1);
  }
};

// Run cleanup
cleanupTestData();
