const express = require("express");
const cors = require("cors");

// Load environment variables
require("./config/env");

// Connect Database
const connectDB = require("./config/db");

// Initialize app
const app = express();

// Connect MongoDB Atlas
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// -------------------- ROUTES --------------------

// Auth
app.use("/api/auth", require("./routes/authRoutes"));

// User
app.use("/api/users", require("./routes/userRoutes"));

// Energy
app.use("/api/energy", require("./routes/energyRoutes"));

// Analytics
app.use("/api/analytics", require("./routes/analyticsRoutes"));

// Booking
app.use("/api/bookings", require("./routes/bookingRoutes"));

// Subsidy
app.use("/api/subsidy", require("./routes/subsidyRoutes"));

// AI Prediction
app.use("/api/predict", require("./routes/predictionRoutes"));

// Reports (PDF / Excel)
app.use("/api/reports", require("./routes/reportRoutes"));

// Admin
app.use("/api/admin", require("./routes/adminRoutes"));

// -------------------- DEFAULT ROUTE --------------------

app.get("/", (req, res) => {
  res.send("🚀 Smart Solar Energy Management Backend is running");
});

// -------------------- ERROR HANDLER --------------------

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// -------------------- SERVER START --------------------

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
