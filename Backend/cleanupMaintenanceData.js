const mongoose = require("mongoose");
require("dotenv").config();

const MaintenancePlan = require("./server/models/MaintenancePlan");
const MaintenanceService = require("./server/models/MaintenanceService");
const MaintenanceReport = require("./server/models/MaintenanceReport");
const MaintenancePayment = require("./server/models/MaintenancePayment");

const cleanupMaintenanceData = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const [plansBefore, servicesBefore, reportsBefore, paymentsBefore] =
      await Promise.all([
        MaintenancePlan.countDocuments(),
        MaintenanceService.countDocuments(),
        MaintenanceReport.countDocuments(),
        MaintenancePayment.countDocuments(),
      ]);

    console.log("\n📊 Maintenance data before cleanup:");
    console.log(`   - Plans: ${plansBefore}`);
    console.log(`   - Services: ${servicesBefore}`);
    console.log(`   - Reports: ${reportsBefore}`);
    console.log(`   - Payments: ${paymentsBefore}`);

    const [plansDeleted, servicesDeleted, reportsDeleted, paymentsDeleted] =
      await Promise.all([
        MaintenancePlan.deleteMany({}),
        MaintenanceService.deleteMany({}),
        MaintenanceReport.deleteMany({}),
        MaintenancePayment.deleteMany({}),
      ]);

    console.log("\n🗑️ Deleted maintenance data:");
    console.log(`   - Plans deleted: ${plansDeleted.deletedCount}`);
    console.log(`   - Services deleted: ${servicesDeleted.deletedCount}`);
    console.log(`   - Reports deleted: ${reportsDeleted.deletedCount}`);
    console.log(`   - Payments deleted: ${paymentsDeleted.deletedCount}`);

    console.log("\n✨ Maintenance cleanup completed successfully!");
    console.log("✅ User-side and Admin-side maintenance lists are now clean.");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Maintenance cleanup failed:", error.message);
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      // ignore disconnect errors
    }
    process.exit(1);
  }
};

cleanupMaintenanceData();
