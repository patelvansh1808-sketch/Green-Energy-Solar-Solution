require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./server/models/User");

async function createTestStaff() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MongoDB URI not found in environment variables");
    }
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Check if test admin already exists
    let testAdmin = await User.findOne({ email: "admin@test.com" });
    if (!testAdmin) {
      const hashedPassword = await bcrypt.hash("Admin123@", 10);
      testAdmin = await User.create({
        firstName: "Test",
        lastName: "Admin",
        name: "Test Admin",
        email: "admin@test.com",
        password: hashedPassword,
        role: "admin",
        department: "Admin",
        connectionType: "Commercial",
        isActive: true,
      });
      console.log("✅ Created test admin:", testAdmin.email);
    } else {
      console.log("Admin already exists:", testAdmin.email);
    }

    // Create test sales staff
    let testSales = await User.findOne({ email: "sales@test.com" });
    if (!testSales) {
      const hashedPassword = await bcrypt.hash("Sales123@", 10);
      testSales = await User.create({
        firstName: "John",
        lastName: "Sales",
        name: "John Sales",
        email: "sales@test.com",
        password: hashedPassword,
        role: "sales",
        department: "Sales",
        connectionType: "Commercial",
        isActive: true,
      });
      console.log("✅ Created test sales:", testSales.email);
    } else {
      console.log("Sales staff already exists:", testSales.email);
    }

    // Create test engineer staff
    let testEngineer = await User.findOne({ email: "engineer@test.com" });
    if (!testEngineer) {
      const hashedPassword = await bcrypt.hash("Engineer123@", 10);
      testEngineer = await User.create({
        firstName: "Jane",
        lastName: "Engineer",
        name: "Jane Engineer",
        email: "engineer@test.com",
        password: hashedPassword,
        role: "engineer",
        department: "Engineering",
        connectionType: "Commercial",
        isActive: true,
      });
      console.log("✅ Created test engineer:", testEngineer.email);
    } else {
      console.log("Engineer staff already exists:", testEngineer.email);
    }

    // Get all staff users
    const allStaff = await User.find({ role: { $in: ["admin", "sales", "engineer", "support"] } }).select("firstName lastName email role");
    console.log("\n📊 Total staff users:", allStaff.length);
    console.log(allStaff);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

createTestStaff();
