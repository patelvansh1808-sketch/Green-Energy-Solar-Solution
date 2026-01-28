const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const {
  getAllProjects,
  getProjectById,
  createProject,
  updateSiteSurvey,
  assignEngineer,
  updateInstallation,
  updateTesting,
  goLiveConfirmation,
  completeProject,
  updateProjectStatus,
  addNote,
  getProjectStats,
  deleteProject,
  getAvailableBookings,
  createProjectFromBooking,
  getBookingDetails,
} = require("../controllers/projectController");

// All routes require authentication
router.use(auth);

// Get available bookings for project creation
router.get("/bookings/available", getAvailableBookings);

// Get booking details
router.get("/booking/:bookingId", getBookingDetails);

// Get all projects (admin, sales, engineer, project manager can view)
router.get("/", getAllProjects);

// Get project statistics
router.get("/stats/overview", getProjectStats);

// Get single project
router.get("/:id", getProjectById);

// Create project from booking (admin, sales only)
router.post("/from-booking/:bookingId", role(["admin", "sales"]), createProjectFromBooking);

// Create project (admin, sales only)
router.post("/", role(["admin", "sales"]), createProject);

// Site survey (admin, engineer, project manager)
router.patch("/:id/survey", role(["admin", "engineer"]), updateSiteSurvey);

// Assign engineer (admin, project manager only)
router.patch("/:id/assign-engineer", role(["admin", "sales"]), assignEngineer);

// Update installation (admin, engineer only)
router.patch("/:id/installation", role(["admin", "engineer"]), updateInstallation);

// Testing & commissioning (admin, engineer only)
router.patch("/:id/testing", role(["admin", "engineer"]), updateTesting);

// Go-live confirmation (admin, engineer only)
router.patch("/:id/go-live", role(["admin", "engineer"]), goLiveConfirmation);

// Complete project (admin, project manager only)
router.patch("/:id/complete", role(["admin", "sales"]), completeProject);

// Update project status (admin only)
router.patch("/:id/status", role("admin"), updateProjectStatus);

// Add note to project
router.post("/:id/notes", addNote);

// Delete project (admin only)
router.delete("/:id", role("admin"), deleteProject);

module.exports = router;
