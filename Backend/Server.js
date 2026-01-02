const express = require("express");
const cors = require("cors");

// Load environment variables
require("./server/config/env");

// Connect Database
const connectDB = require("./server/config/db");

// Initialize app
const app = express();

// Connect MongoDB Atlas
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// -------------------- ROUTES --------------------

// Auth
app.use("/api/auth", require("./server/routes/authRoutes"));

// User
app.use("/api/users", require("./server/routes/userRoutes"));

// Energy
app.use("/api/energy", require("./server/routes/energyRoutes"));

// Booking
app.use("/api/bookings", require("./server/routes/bookingRoutes"));

// Subsidy
app.use("/api/subsidy", require("./server/routes/subsidyRoutes"));

// Smart Recommendations (AI-assisted)
app.use("/api/recommendations", require("./server/routes/recommendationRoutes"));

// Admin
app.use("/api/admin", require("./server/routes/adminRoutes"));
app.use("/api/customers", require("./server/routes/customerRoutes"));


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
