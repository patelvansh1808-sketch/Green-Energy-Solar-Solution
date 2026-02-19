const MaintenanceReport = require("../models/MaintenanceReport");
const MaintenanceService = require("../models/MaintenanceService");

/* ===============================
   CREATE REPORT
   POST /api/maintenance/reports
================================ */
exports.createReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { serviceId, title, fileUrl, notes } = req.body;

    if (!title || !fileUrl) {
      return res.status(400).json({ message: "Title and fileUrl are required" });
    }

    const report = await MaintenanceReport.create({
      userId,
      serviceId: serviceId || null,
      title,
      fileUrl,
      notes: notes || "",
    });

    return res.status(201).json(report);
  } catch (error) {
    console.error("CREATE MAINTENANCE REPORT ERROR:", error);
    return res.status(500).json({
      message: "Failed to create maintenance report",
      error: error.message,
    });
  }
};

/* ===============================
   UPLOAD REPORT
   POST /api/maintenance/reports/upload
================================ */
exports.uploadReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { serviceId, title, notes } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Report file is required" });
    }

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const fileUrl = `/uploads/maintenance-reports/${req.file.filename}`;

    const report = await MaintenanceReport.create({
      userId,
      serviceId: serviceId || null,
      title,
      fileUrl,
      notes: notes || "",
    });

    return res.status(201).json(report);
  } catch (error) {
    console.error("UPLOAD MAINTENANCE REPORT ERROR:", error);
    return res.status(500).json({
      message: "Failed to upload maintenance report",
      error: error.message,
    });
  }
};

/* ===============================
   LIST REPORTS
   GET /api/maintenance/reports
================================ */
exports.getReports = async (req, res) => {
  try {
    const userId = req.user.id;

    const userServices = await MaintenanceService.find({ userId })
      .select("_id")
      .lean();
    const serviceIds = userServices.map((service) => service._id);

    const reports = await MaintenanceReport.find({
      $or: [
        { userId },
        ...(serviceIds.length ? [{ serviceId: { $in: serviceIds } }] : []),
      ],
    }).sort({ createdAt: -1 });

    return res.json(reports);
  } catch (error) {
    console.error("GET MAINTENANCE REPORTS ERROR:", error);
    return res.status(500).json({
      message: "Failed to load maintenance reports",
      error: error.message,
    });
  }
};

/* ===============================
   GET REPORT BY ID
   GET /api/maintenance/reports/:id
================================ */
exports.getReportById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const report = await MaintenanceReport.findOne({ _id: id, userId });
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    return res.json(report);
  } catch (error) {
    console.error("GET MAINTENANCE REPORT ERROR:", error);
    return res.status(500).json({
      message: "Failed to load maintenance report",
      error: error.message,
    });
  }
};
