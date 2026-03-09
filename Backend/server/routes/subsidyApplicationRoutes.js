const express = require("express");
const multer = require("multer");
const path = require("path");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const subsidyApplicationController = require("../controllers/subsidyApplicationController");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/subsidy-documents/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Customer routes
router.get("/my-application", authMiddleware, subsidyApplicationController.getMyApplication);
router.post("/", authMiddleware, upload.array("documents", 10), subsidyApplicationController.createApplication);

// Admin routes
router.get("/", authMiddleware, roleMiddleware("admin"), subsidyApplicationController.getAllApplications);
router.get("/download/*", authMiddleware, roleMiddleware("admin"), subsidyApplicationController.downloadDocument);
router.get("/:id", authMiddleware, roleMiddleware("admin"), subsidyApplicationController.getApplicationById);
router.patch("/:id", authMiddleware, roleMiddleware("admin"), subsidyApplicationController.updateApplication);

module.exports = router;
