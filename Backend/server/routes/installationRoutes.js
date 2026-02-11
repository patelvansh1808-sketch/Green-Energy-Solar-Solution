const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");
const ctrl = require("../controllers/installationController");

// All routes require auth
router.use(authenticateJWT);

// Admin and Sales can create/list; Engineers can read and update progress; Admin confirms live
router.post("/", requireRole(["admin", "sales"]), ctrl.createProject);
router.get("/", requireRole(["admin", "sales", "engineer", "support"]), ctrl.listProjects);
router.get("/:id", requireRole(["admin", "sales", "engineer", "support"]), ctrl.getProject);
router.patch("/:id/assign-engineer", requireRole(["admin", "sales"]), ctrl.assignEngineer);
router.patch("/:id/progress", requireRole(["admin", "engineer"]), ctrl.updateProgress);
router.patch("/:id/commission", requireRole(["admin", "engineer"]), ctrl.markCommissioned);
router.patch("/:id/live", requireRole(["admin"]), ctrl.markLive);

module.exports = router;
