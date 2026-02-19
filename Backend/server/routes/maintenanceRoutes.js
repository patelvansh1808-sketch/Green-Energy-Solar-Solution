const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();

const REPORT_UPLOAD_DIR = path.resolve(
  __dirname,
  "..",
  "..",
  "uploads",
  "maintenance-reports"
);
const SERVICE_PHOTO_UPLOAD_DIR = path.resolve(
  __dirname,
  "..",
  "..",
  "uploads",
  "maintenance-service-photos"
);

fs.mkdirSync(REPORT_UPLOAD_DIR, { recursive: true });
fs.mkdirSync(SERVICE_PHOTO_UPLOAD_DIR, { recursive: true });

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const maintenanceController = require("../controllers/maintenanceController");
const maintenanceReportController = require("../controllers/maintenanceReportController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, REPORT_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".pdf"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

const executionPhotoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, SERVICE_PHOTO_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const executionPhotoUpload = multer({
  storage: executionPhotoStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".jpg", ".jpeg", ".png", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid image type"));
    }
  },
  limits: { fileSize: 8 * 1024 * 1024 },
});

/* ===============================
   MAINTENANCE SUMMARY
================================ */
router.get("/summary", authMiddleware, maintenanceController.getSummary);
router.get(
  "/settings/pricing",
  authMiddleware,
  maintenanceController.getUserPricingSettings
);
router.get(
  "/admin/overview",
  authMiddleware,
  roleMiddleware("admin"),
  maintenanceController.getAdminOverview
);
router.get(
  "/admin/drilldown",
  authMiddleware,
  roleMiddleware("admin"),
  maintenanceController.getAdminDrilldown
);
router.get(
  "/admin/subscriptions",
  authMiddleware,
  roleMiddleware("admin"),
  maintenanceController.getAdminSubscriptions
);
router.get(
  "/admin/subscriptions/:id",
  authMiddleware,
  roleMiddleware("admin"),
  maintenanceController.getAdminSubscriptionById
);
router.patch(
  "/admin/subscriptions/:id/pause",
  authMiddleware,
  roleMiddleware("admin"),
  maintenanceController.pauseAdminSubscription
);
router.patch(
  "/admin/subscriptions/:id/resume",
  authMiddleware,
  roleMiddleware("admin"),
  maintenanceController.resumeAdminSubscription
);
router.patch(
  "/admin/subscriptions/:id/renew",
  authMiddleware,
  roleMiddleware("admin"),
  maintenanceController.renewAdminSubscription
);
router.patch(
  "/admin/subscriptions/:id/cancel",
  authMiddleware,
  roleMiddleware("admin"),
  maintenanceController.cancelAdminSubscription
);
router.get(
  "/admin/services/schedule",
  authMiddleware,
  roleMiddleware("admin"),
  maintenanceController.getAdminServiceSchedule
);
router.get(
  "/admin/services/history",
  authMiddleware,
  roleMiddleware("admin"),
  maintenanceController.getAdminServiceHistoryReports
);
router.patch(
  "/admin/services/:id/schedule",
  authMiddleware,
  roleMiddleware("admin"),
  maintenanceController.updateAdminServiceSchedule
);
router.get(
  "/admin/services/:id/report-pdf",
  authMiddleware,
  roleMiddleware("admin"),
  maintenanceController.downloadAdminServiceReportPdf
);
router.get(
  "/admin/settings",
  authMiddleware,
  roleMiddleware("admin"),
  maintenanceController.getAdminSettings
);
router.patch(
  "/admin/settings",
  authMiddleware,
  roleMiddleware("admin"),
  maintenanceController.updateAdminSettings
);

/* ===============================
   PLANS
================================ */
router.post("/plans", authMiddleware, maintenanceController.createPlan);
router.get("/plans", authMiddleware, maintenanceController.getPlans);
router.patch("/plans/:id", authMiddleware, maintenanceController.updatePlan);
router.delete("/plans/:id", authMiddleware, maintenanceController.cancelPlan);

/* ===============================
   SERVICES
================================ */
router.post("/services", authMiddleware, maintenanceController.createService);
router.get(
  "/services/upcoming",
  authMiddleware,
  maintenanceController.getUpcomingServices
);
router.get(
  "/services/history",
  authMiddleware,
  maintenanceController.getServiceHistory
);
router.get(
  "/services/assigned-to-me",
  authMiddleware,
  roleMiddleware(["engineer", "technician", "support"]),
  maintenanceController.getAssignedServicesForStaff
);
router.patch(
  "/services/:id",
  authMiddleware,
  maintenanceController.updateService
);
router.patch(
  "/services/:id/execution",
  authMiddleware,
  roleMiddleware(["admin", "engineer", "technician", "support"]),
  maintenanceController.updateAssignedServiceExecution
);
router.post(
  "/services/:id/execution-photos",
  authMiddleware,
  roleMiddleware(["admin", "engineer", "technician", "support"]),
  executionPhotoUpload.fields([
    { name: "beforePhotos", maxCount: 6 },
    { name: "afterPhotos", maxCount: 6 },
  ]),
  maintenanceController.uploadServiceExecutionPhotos
);

/* ===============================
   REPORTS
================================ */
router.post(
  "/reports",
  authMiddleware,
  maintenanceReportController.createReport
);
router.get(
  "/reports",
  authMiddleware,
  maintenanceReportController.getReports
);
router.post(
  "/reports/upload",
  authMiddleware,
  upload.single("report"),
  maintenanceReportController.uploadReport
);
router.get(
  "/reports/:id",
  authMiddleware,
  maintenanceReportController.getReportById
);

module.exports = router;
