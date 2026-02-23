const MaintenancePlan = require("../models/MaintenancePlan");
const MaintenanceService = require("../models/MaintenanceService");
const MaintenanceReport = require("../models/MaintenanceReport");
const MaintenanceSetting = require("../models/MaintenanceSetting");
const MaintenancePayment = require("../models/MaintenancePayment");
const Customer = require("../models/Customer");
const User = require("../models/User");
const { generateMaintenanceServiceReportPDF } = require("../utils/pdfGenerator");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const PLAN_DEFAULTS = {
  "1 Month": { durationMonths: 1, servicesTotal: 1 },
  "6 Months": { durationMonths: 6, servicesTotal: 6 },
  "1 Year": { durationMonths: 12, servicesTotal: 12 },
  Lifetime: { durationMonths: 0, servicesTotal: 0 },
};

const PLAN_SETTINGS_KEY_MAP = {
  "1 Month": "oneMonth",
  "6 Months": "sixMonths",
  "1 Year": "oneYear",
  Lifetime: "lifetime",
};

const FREQUENCY_TO_MONTHS = {
  monthly: 1,
  quarterly: 3,
  half_yearly: 6,
  yearly: 12,
};

const SERVICE_TYPE_TO_CHECKLIST_KEY = {
  Cleaning: "cleaning",
  Testing: "testing",
};

const addMonths = (date, months) => {
  if (!months) return null;
  const base = new Date(date);
  const next = new Date(base.getTime());
  next.setMonth(next.getMonth() + months);
  return next;
};

const getDayStart = (dateValue) => {
  const day = new Date(dateValue);
  day.setHours(0, 0, 0, 0);
  return day;
};

const EXECUTION_STATUSES = ["Pending", "In Progress", "Completed"];

const getUserDisplayName = (user) =>
  [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
  user?.name ||
  user?.email ||
  "";

const getOrCreateMaintenanceSettings = async () => {
  let settings = await MaintenanceSetting.findOne({ settingsKey: "default" });
  if (!settings) {
    settings = await MaintenanceSetting.create({ settingsKey: "default" });
  }
  return settings;
};

const toNonNegativeNumber = (value, fallbackValue = 0) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallbackValue;
  }
  return parsed;
};

const sanitizeChecklist = (items = []) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((entry) => ({
      item: String(entry?.item || "").trim(),
      mandatory: Boolean(entry?.mandatory),
      completed: Boolean(entry?.completed),
    }))
    .filter((entry) => entry.item.length > 0);
};

const getChecklistForServiceType = (settings, serviceType) => {
  const checklistKey = SERVICE_TYPE_TO_CHECKLIST_KEY[serviceType] || "cleaning";
  const defaultChecklist =
    settings?.defaultServiceChecklist?.[checklistKey] || [];

  return sanitizeChecklist(defaultChecklist).map((item) => ({
    ...item,
    completed: false,
  }));
};

const getTechnicianNotesTemplate = (settings) =>
  String(settings?.defaultServiceChecklist?.technicianNotesTemplate || "").trim();

const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are not configured");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

const getPlanConfigFromSettings = (settings, planType) => {
  const defaults = PLAN_DEFAULTS[planType] || { durationMonths: 0, servicesTotal: 0 };
  const settingKey = PLAN_SETTINGS_KEY_MAP[planType];

  const pricing = settingKey ? settings?.planPricing?.[settingKey] : null;
  const visits = settingKey
    ? settings?.numberOfVisitsPerPlan?.[settingKey]
    : undefined;

  const planPrice = toNonNegativeNumber(pricing?.price, 0);
  const taxPercent = toNonNegativeNumber(pricing?.taxPercent, 0);
  const discountPercent = toNonNegativeNumber(pricing?.discountPercent, 0);
  const servicesTotal =
    typeof visits === "number"
      ? Math.max(0, Math.floor(visits))
      : defaults.servicesTotal;

  const taxAmount = (planPrice * taxPercent) / 100;
  const discountAmount = (planPrice * discountPercent) / 100;
  const totalAmount = Number(
    Math.max(0, planPrice + taxAmount - discountAmount).toFixed(2)
  );

  return {
    durationMonths: defaults.durationMonths,
    servicesTotal,
    isPlanActive: pricing?.isActive !== false,
    planPrice,
    taxPercent,
    discountPercent,
    totalAmount,
  };
};

const getBlackoutDateSet = (settings) => {
  const dateValues = settings?.serviceFrequencyRules?.blackoutDates || [];
  if (!Array.isArray(dateValues)) {
    return new Set();
  }

  const normalized = dateValues
    .map((value) => {
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) {
        return null;
      }
      return getDayStart(parsed).toISOString().split("T")[0];
    })
    .filter(Boolean);

  return new Set(normalized);
};

const isBlackoutDate = (dateValue, blackoutDateSet) => {
  const dateKey = getDayStart(dateValue).toISOString().split("T")[0];
  return blackoutDateSet.has(dateKey);
};

const resolveDateByFrequencyRules = (settings, baseDate, minGapBaseDate = null) => {
  const rules = settings?.serviceFrequencyRules || {};
  const monthsToAdd =
    FREQUENCY_TO_MONTHS[rules.autoScheduleFrequency] || FREQUENCY_TO_MONTHS.monthly;
  const minimumGapDays = Math.max(0, Math.floor(rules.minimumGapDays || 0));

  let candidateDate = addMonths(baseDate, monthsToAdd) || new Date(baseDate);
  if (minGapBaseDate && minimumGapDays > 0) {
    const minAllowedDate = new Date(minGapBaseDate);
    minAllowedDate.setDate(minAllowedDate.getDate() + minimumGapDays);
    if (candidateDate < minAllowedDate) {
      candidateDate = minAllowedDate;
    }
  }

  const blackoutDateSet = getBlackoutDateSet(settings);
  if (!isBlackoutDate(candidateDate, blackoutDateSet)) {
    return {
      scheduledDate: candidateDate,
      requiresManualApproval: false,
    };
  }

  if (rules.holidayBlackoutHandling === "manual_approval") {
    return {
      scheduledDate: candidateDate,
      requiresManualApproval: true,
    };
  }

  const adjustedDate = new Date(candidateDate);
  for (let attempts = 0; attempts < 366; attempts += 1) {
    if (!isBlackoutDate(adjustedDate, blackoutDateSet)) {
      return {
        scheduledDate: adjustedDate,
        requiresManualApproval: false,
      };
    }
    adjustedDate.setDate(adjustedDate.getDate() + 1);
  }

  return {
    scheduledDate: candidateDate,
    requiresManualApproval: true,
  };
};

/* ===============================
   ADMIN MAINTENANCE SETTINGS
   GET /api/maintenance/admin/settings
================================ */
exports.getAdminSettings = async (req, res) => {
  try {
    const settings = await getOrCreateMaintenanceSettings();
    return res.json(settings);
  } catch (error) {
    console.error("ADMIN MAINTENANCE SETTINGS GET ERROR:", error);
    return res.status(500).json({
      message: "Failed to load maintenance settings",
      error: error.message,
    });
  }
};

/* ===============================
   ADMIN MAINTENANCE SETTINGS
   PATCH /api/maintenance/admin/settings
================================ */
exports.updateAdminSettings = async (req, res) => {
  try {
    const settings = await getOrCreateMaintenanceSettings();

    const {
      planPricing,
      numberOfVisitsPerPlan,
      defaultServiceChecklist,
      serviceFrequencyRules,
    } = req.body || {};

    if (planPricing && typeof planPricing === "object") {
      ["oneMonth", "sixMonths", "oneYear", "lifetime"].forEach((key) => {
        if (planPricing[key]) {
          settings.planPricing[key] = {
            ...settings.planPricing[key],
            ...planPricing[key],
          };
        }
      });
    }

    if (numberOfVisitsPerPlan && typeof numberOfVisitsPerPlan === "object") {
      settings.numberOfVisitsPerPlan = {
        ...settings.numberOfVisitsPerPlan,
        ...numberOfVisitsPerPlan,
      };
    }

    if (defaultServiceChecklist && typeof defaultServiceChecklist === "object") {
      settings.defaultServiceChecklist = {
        ...settings.defaultServiceChecklist,
        ...defaultServiceChecklist,
      };
    }

    if (serviceFrequencyRules && typeof serviceFrequencyRules === "object") {
      settings.serviceFrequencyRules = {
        ...settings.serviceFrequencyRules,
        ...serviceFrequencyRules,
      };
    }

    await settings.save();
    return res.json({ message: "Maintenance settings updated", settings });
  } catch (error) {
    console.error("ADMIN MAINTENANCE SETTINGS UPDATE ERROR:", error);
    return res.status(500).json({
      message: "Failed to update maintenance settings",
      error: error.message,
    });
  }
};

/* ===============================
   USER MAINTENANCE PRICING SETTINGS
   GET /api/maintenance/settings/pricing
================================ */
exports.getUserPricingSettings = async (req, res) => {
  try {
    const settings = await getOrCreateMaintenanceSettings();

    return res.json({
      planPricing: settings.planPricing,
      numberOfVisitsPerPlan: settings.numberOfVisitsPerPlan,
    });
  } catch (error) {
    console.error("USER MAINTENANCE PRICING SETTINGS ERROR:", error);
    return res.status(500).json({
      message: "Failed to load maintenance pricing settings",
      error: error.message,
    });
  }
};

/* ===============================
   ADMIN OVERVIEW
   GET /api/maintenance/admin/overview
================================ */
exports.getAdminOverview = async (req, res) => {
  try {
    const todayStart = getDayStart(new Date());
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const nextThirtyDays = new Date(todayStart);
    nextThirtyDays.setDate(nextThirtyDays.getDate() + 30);

    const [
      totalSubscriptions,
      activePlans,
      todaysServices,
      upcomingServices,
      expiringSoon,
    ] = await Promise.all([
      MaintenancePlan.countDocuments(),
      MaintenancePlan.countDocuments({ status: "Active" }),
      MaintenanceService.countDocuments({
        date: { $gte: todayStart, $lt: tomorrowStart },
      }),
      MaintenanceService.countDocuments({
        date: { $gt: tomorrowStart },
        status: { $in: ["Scheduled", "Due Soon"] },
      }),
      MaintenancePlan.countDocuments({
        status: "Active",
        endDate: { $gte: todayStart, $lte: nextThirtyDays },
      }),
    ]);

    return res.json({
      totalSubscriptions,
      activePlans,
      todaysServices,
      upcomingServices,
      expiringSoon,
    });
  } catch (error) {
    console.error("ADMIN MAINTENANCE OVERVIEW ERROR:", error);
    return res.status(500).json({
      message: "Failed to load maintenance overview",
      error: error.message,
    });
  }
};

/* ===============================
   ADMIN DRILLDOWN
   GET /api/maintenance/admin/drilldown?type=
================================ */
exports.getAdminDrilldown = async (req, res) => {
  try {
    const { type } = req.query;

    const todayStart = getDayStart(new Date());
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const nextThirtyDays = new Date(todayStart);
    nextThirtyDays.setDate(nextThirtyDays.getDate() + 30);

    if (!type) {
      return res.status(400).json({ message: "type query parameter is required" });
    }

    if (type === "totalSubscriptions") {
      const items = await MaintenancePlan.find({})
        .sort({ createdAt: -1 })
        .limit(100)
        .populate("userId", "name firstName lastName email")
        .lean();
      return res.json({ type, entity: "plan", items });
    }

    if (type === "activePlans") {
      const items = await MaintenancePlan.find({ status: "Active" })
        .sort({ createdAt: -1 })
        .limit(100)
        .populate("userId", "name firstName lastName email")
        .lean();
      return res.json({ type, entity: "plan", items });
    }

    if (type === "todaysServices") {
      const items = await MaintenanceService.find({
        date: { $gte: todayStart, $lt: tomorrowStart },
      })
        .sort({ date: 1 })
        .limit(100)
        .populate("userId", "name firstName lastName email")
        .lean();
      return res.json({ type, entity: "service", items });
    }

    if (type === "upcomingServices") {
      const items = await MaintenanceService.find({
        date: { $gt: tomorrowStart },
        status: { $in: ["Scheduled", "Due Soon"] },
      })
        .sort({ date: 1 })
        .limit(100)
        .populate("userId", "name firstName lastName email")
        .lean();
      return res.json({ type, entity: "service", items });
    }

    if (type === "expiringSoon") {
      const items = await MaintenancePlan.find({
        status: "Active",
        endDate: { $gte: todayStart, $lte: nextThirtyDays },
      })
        .sort({ endDate: 1 })
        .limit(100)
        .populate("userId", "name firstName lastName email")
        .lean();
      return res.json({ type, entity: "plan", items });
    }

    return res.status(400).json({ message: "Invalid type value" });
  } catch (error) {
    console.error("ADMIN MAINTENANCE DRILLDOWN ERROR:", error);
    return res.status(500).json({
      message: "Failed to load maintenance drilldown",
      error: error.message,
    });
  }
};

/* ===============================
   ADMIN SUBSCRIPTIONS LIST
   GET /api/maintenance/admin/subscriptions
================================ */
exports.getAdminSubscriptions = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const filter = {};
    if (status && status !== "All") {
      filter.status = status;
    }

    const [total, items] = await Promise.all([
      MaintenancePlan.countDocuments(filter),
      MaintenancePlan.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name firstName lastName email")
        .lean(),
    ]);

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return res.json({
      page,
      limit,
      total,
      totalPages,
      items,
    });
  } catch (error) {
    console.error("ADMIN SUBSCRIPTIONS LIST ERROR:", error);
    return res.status(500).json({
      message: "Failed to load subscriptions",
      error: error.message,
    });
  }
};

/* ===============================
   ADMIN SUBSCRIPTION DETAILS
   GET /api/maintenance/admin/subscriptions/:id
================================ */
exports.getAdminSubscriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await MaintenancePlan.findById(id)
      .populate("userId", "name firstName lastName email")
      .lean();

    if (!plan) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    return res.json(plan);
  } catch (error) {
    console.error("ADMIN SUBSCRIPTION DETAILS ERROR:", error);
    return res.status(500).json({
      message: "Failed to load subscription details",
      error: error.message,
    });
  }
};

const updateAdminSubscriptionStatus = async (id, status, res, message) => {
  const plan = await MaintenancePlan.findById(id);
  if (!plan) {
    return res.status(404).json({ message: "Subscription not found" });
  }
  plan.status = status;
  await plan.save();
  return res.json({ message, plan });
};

/* ===============================
   ADMIN PAUSE SUBSCRIPTION
   PATCH /api/maintenance/admin/subscriptions/:id/pause
================================ */
exports.pauseAdminSubscription = async (req, res) => {
  try {
    return await updateAdminSubscriptionStatus(
      req.params.id,
      "Inactive",
      res,
      "Subscription paused"
    );
  } catch (error) {
    console.error("ADMIN PAUSE SUBSCRIPTION ERROR:", error);
    return res.status(500).json({
      message: "Failed to pause subscription",
      error: error.message,
    });
  }
};

/* ===============================
   ADMIN RESUME SUBSCRIPTION
   PATCH /api/maintenance/admin/subscriptions/:id/resume
================================ */
exports.resumeAdminSubscription = async (req, res) => {
  try {
    return await updateAdminSubscriptionStatus(
      req.params.id,
      "Active",
      res,
      "Subscription resumed"
    );
  } catch (error) {
    console.error("ADMIN RESUME SUBSCRIPTION ERROR:", error);
    return res.status(500).json({
      message: "Failed to resume subscription",
      error: error.message,
    });
  }
};

/* ===============================
   ADMIN RENEW SUBSCRIPTION
   PATCH /api/maintenance/admin/subscriptions/:id/renew
================================ */
exports.renewAdminSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await MaintenancePlan.findById(id);

    if (!plan) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    const defaults = PLAN_DEFAULTS[plan.planType] || { durationMonths: 0 };
    if (!defaults.durationMonths) {
      plan.status = "Active";
      await plan.save();
      return res.json({ message: "Lifetime subscription renewed", plan });
    }

    const baseline = plan.endDate && plan.endDate > new Date() ? plan.endDate : new Date();
    plan.endDate = addMonths(baseline, defaults.durationMonths);
    plan.status = "Active";
    await plan.save();

    return res.json({ message: "Subscription renewed", plan });
  } catch (error) {
    console.error("ADMIN RENEW SUBSCRIPTION ERROR:", error);
    return res.status(500).json({
      message: "Failed to renew subscription",
      error: error.message,
    });
  }
};

/* ===============================
   ADMIN CANCEL SUBSCRIPTION
   PATCH /api/maintenance/admin/subscriptions/:id/cancel
================================ */
exports.cancelAdminSubscription = async (req, res) => {
  try {
    return await updateAdminSubscriptionStatus(
      req.params.id,
      "Cancelled",
      res,
      "Subscription cancelled"
    );
  } catch (error) {
    console.error("ADMIN CANCEL SUBSCRIPTION ERROR:", error);
    return res.status(500).json({
      message: "Failed to cancel subscription",
      error: error.message,
    });
  }
};

/* ===============================
   ADMIN SERVICE SCHEDULING LIST
   GET /api/maintenance/admin/services/schedule
================================ */
exports.getAdminServiceSchedule = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      MaintenanceService.countDocuments(),
      MaintenanceService.find({})
        .sort({ date: 1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name firstName lastName email")
        .populate("technicianId", "name firstName lastName email role")
        .lean(),
    ]);

    const userIds = items.map((item) => item.userId?._id || item.userId).filter(Boolean);
    const customers = await Customer.find({ userId: { $in: userIds } })
      .select("userId address city state")
      .lean();

    const customerByUserId = new Map(
      customers.map((customer) => [String(customer.userId), customer])
    );

    const enriched = items.map((item) => {
      const userId = String(item.userId?._id || item.userId || "");
      const customer = customerByUserId.get(userId);
      const location = customer
        ? [customer.address, customer.city, customer.state].filter(Boolean).join(", ")
        : "-";

      return {
        ...item,
        location,
        technicianDisplay:
          [item.technicianId?.firstName, item.technicianId?.lastName]
            .filter(Boolean)
            .join(" ") ||
          item.technicianId?.name ||
          item.technician ||
          "",
      };
    });

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return res.json({
      page,
      limit,
      total,
      totalPages,
      items: enriched,
    });
  } catch (error) {
    console.error("ADMIN SERVICE SCHEDULE LIST ERROR:", error);
    return res.status(500).json({
      message: "Failed to load service schedule",
      error: error.message,
    });
  }
};

/* ===============================
   ADMIN SERVICE HISTORY & REPORTS
   GET /api/maintenance/admin/services/history
================================ */
exports.getAdminServiceHistoryReports = async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 100, 1), 300);

    const services = await MaintenanceService.find({})
      .sort({ date: -1 })
      .limit(limit)
      .populate("userId", "name firstName lastName email")
      .populate("technicianId", "name firstName lastName email")
      .lean();

    const serviceIds = services.map((service) => service._id);
    const reports = await MaintenanceReport.find({ serviceId: { $in: serviceIds } })
      .sort({ createdAt: -1 })
      .lean();

    const reportByServiceId = new Map();
    reports.forEach((report) => {
      const key = String(report.serviceId || "");
      if (key && !reportByServiceId.has(key)) {
        reportByServiceId.set(key, report);
      }
    });

    const items = services.map((service) => {
      const report = reportByServiceId.get(String(service._id));
      const reportUrl = report?.fileUrl || service.reportUrl || "";

      const customerName =
        [service.userId?.firstName, service.userId?.lastName]
          .filter(Boolean)
          .join(" ") ||
        service.userId?.name ||
        service.userId?.email ||
        "-";

      const technicianName =
        [service.technicianId?.firstName, service.technicianId?.lastName]
          .filter(Boolean)
          .join(" ") ||
        service.technicianId?.name ||
        service.technician ||
        "-";

      return {
        _id: service._id,
        customer: customerName,
        serviceDate: service.date,
        workDone: service.workDone || service.technicianNotes || "-",
        technician: technicianName,
        status: service.executionStatus || service.status || "-",
        reportUrl,
        reportTitle: report?.title || "Service Report",
      };
    });

    return res.json({ items });
  } catch (error) {
    console.error("ADMIN SERVICE HISTORY REPORTS ERROR:", error);
    return res.status(500).json({
      message: "Failed to load service history reports",
      error: error.message,
    });
  }
};

/* ===============================
   ADMIN DOWNLOAD SERVICE PDF
   GET /api/maintenance/admin/services/:id/report-pdf
================================ */
exports.downloadAdminServiceReportPdf = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await MaintenanceService.findById(id)
      .populate("userId", "name firstName lastName email")
      .populate("technicianId", "name firstName lastName email")
      .lean();

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const report = await MaintenanceReport.findOne({ serviceId: service._id })
      .sort({ createdAt: -1 })
      .lean();

    const payload = {
      serviceId: String(service._id),
      customerName:
        [service.userId?.firstName, service.userId?.lastName]
          .filter(Boolean)
          .join(" ") ||
        service.userId?.name ||
        "-",
      customerEmail: service.userId?.email || "-",
      serviceDate: service.date
        ? new Date(service.date).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "-",
      serviceType: service.type || "-",
      technicianName:
        [service.technicianId?.firstName, service.technicianId?.lastName]
          .filter(Boolean)
          .join(" ") ||
        service.technicianId?.name ||
        service.technician ||
        "-",
      status: service.executionStatus || service.status || "-",
      completionTime: service.completionTime
        ? new Date(service.completionTime).toLocaleString("en-IN")
        : "-",
      workDone: service.workDone || "-",
      technicianNotes: service.technicianNotes || "-",
      beforePhotoCount: Array.isArray(service.beforePhotos)
        ? service.beforePhotos.length
        : 0,
      afterPhotoCount: Array.isArray(service.afterPhotos)
        ? service.afterPhotos.length
        : 0,
      beforePhotos: Array.isArray(service.beforePhotos) ? service.beforePhotos : [],
      afterPhotos: Array.isArray(service.afterPhotos) ? service.afterPhotos : [],
      uploadedReportUrl: report?.fileUrl || service.reportUrl || "",
    };

    return generateMaintenanceServiceReportPDF(res, payload);
  } catch (error) {
    console.error("ADMIN DOWNLOAD SERVICE PDF ERROR:", error);
    return res.status(500).json({
      message: "Failed to generate service report PDF",
      error: error.message,
    });
  }
};

/* ===============================
   ADMIN UPDATE SERVICE SCHEDULE
   PATCH /api/maintenance/admin/services/:id/schedule
================================ */
exports.updateAdminServiceSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, technician, technicianId, type, status } = req.body;

    const service = await MaintenanceService.findById(id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (date !== undefined) {
      const parsedDate = new Date(date);
      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: "Invalid date" });
      }
      service.date = parsedDate;
    }

    if (technicianId !== undefined) {
      if (!technicianId) {
        service.technicianId = null;
        service.technician = "";
      } else {
        const assignedUser = await User.findById(technicianId).select(
          "name firstName lastName email role"
        );
        if (
          !assignedUser ||
          !["engineer", "technician", "support"].includes(assignedUser.role)
        ) {
          return res.status(400).json({ message: "Invalid technician selected" });
        }

        service.technicianId = assignedUser._id;
        service.technician =
          [assignedUser.firstName, assignedUser.lastName]
            .filter(Boolean)
            .join(" ") || assignedUser.name || assignedUser.email || "";
      }
    } else if (technician !== undefined) {
      service.technician = technician;
    }

    if (type !== undefined) {
      service.type = type;
    }

    if (status !== undefined) {
      service.status = status;
    }

    await service.save();

    return res.json({ message: "Service schedule updated", service });
  } catch (error) {
    console.error("ADMIN UPDATE SERVICE SCHEDULE ERROR:", error);
    return res.status(500).json({
      message: "Failed to update service schedule",
      error: error.message,
    });
  }
};

/* ===============================
   ASSIGNED SERVICES FOR STAFF
   GET /api/maintenance/services/assigned-to-me
================================ */
exports.getAssignedServicesForStaff = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id)
      .select("name firstName lastName email role")
      .lean();

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const fullName = [currentUser.firstName, currentUser.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    const technicianAliases = [
      fullName,
      currentUser.name,
      currentUser.email,
    ].filter(Boolean);

    const services = await MaintenanceService.find({
      status: { $ne: "Cancelled" },
      $or: [
        { technicianId: req.user.id },
        { technician: { $in: technicianAliases } },
      ],
    })
      .sort({ date: 1 })
      .populate("userId", "name firstName lastName email")
      .populate("technicianId", "name firstName lastName email role")
      .lean();

    return res.json(services);
  } catch (error) {
    console.error("GET ASSIGNED SERVICES FOR STAFF ERROR:", error);
    return res.status(500).json({
      message: "Failed to load assigned services",
      error: error.message,
    });
  }
};

/* ===============================
   UPDATE ASSIGNED SERVICE EXECUTION
   PATCH /api/maintenance/services/:id/execution
================================ */
exports.updateAssignedServiceExecution = async (req, res) => {
  try {
    const { id } = req.params;
    const { executionStatus, technicianNotes, completionTime } = req.body;

    const service = await MaintenanceService.findById(id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const currentUser = await User.findById(req.user.id)
      .select("name firstName lastName email role")
      .lean();

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isAdmin = currentUser.role === "admin";
    const assignedById =
      service.technicianId &&
      String(service.technicianId) === String(currentUser._id);

    const aliases = [
      getUserDisplayName(currentUser),
      currentUser.name,
      currentUser.email,
    ]
      .filter(Boolean)
      .map((value) => String(value).trim().toLowerCase());

    const assignedByName = aliases.includes(
      String(service.technician || "").trim().toLowerCase()
    );

    if (!isAdmin && !assignedById && !assignedByName) {
      return res.status(403).json({ message: "Not authorized for this service" });
    }

    const wasServiceCompleted = service.status === "Completed";
    const wasExecutionCompleted = service.executionStatus === "Completed";
    const requestedExecutionStatus = executionStatus;

    if (executionStatus !== undefined) {
      if (!EXECUTION_STATUSES.includes(executionStatus)) {
        return res.status(400).json({ message: "Invalid execution status" });
      }
      service.executionStatus = executionStatus;
      if (executionStatus === "Completed") {
        if (completionTime) {
          const parsedCompletion = new Date(completionTime);
          if (Number.isNaN(parsedCompletion.getTime())) {
            return res.status(400).json({ message: "Invalid completion time" });
          }
          service.completionTime = parsedCompletion;
        } else {
          service.completionTime = new Date();
        }
      } else if (executionStatus === "Pending") {
        service.completionTime = null;
      }
    }

    if (technicianNotes !== undefined) {
      service.technicianNotes = technicianNotes;
    }

    if (completionTime !== undefined && completionTime && service.executionStatus === "Completed") {
      const parsedCompletion = new Date(completionTime);
      if (Number.isNaN(parsedCompletion.getTime())) {
        return res.status(400).json({ message: "Invalid completion time" });
      }
      service.completionTime = parsedCompletion;
    }

    if (requestedExecutionStatus === "Completed") {
      service.status = "Completed";
    }

    await service.save();

    const isNowCompleted =
      service.status === "Completed" || service.executionStatus === "Completed";

    if (service.planId && isNowCompleted && (!wasServiceCompleted || !wasExecutionCompleted)) {
      const [plan, settings] = await Promise.all([
        MaintenancePlan.findById(service.planId),
        getOrCreateMaintenanceSettings(),
      ]);

      if (plan) {
        const maxServices =
          typeof plan.servicesTotal === "number" && plan.servicesTotal > 0
            ? plan.servicesTotal
            : null;

        if (!wasServiceCompleted) {
          const nextUsed = (plan.servicesUsed || 0) + 1;
          plan.servicesUsed = maxServices ? Math.min(nextUsed, maxServices) : nextUsed;
        }

        const remainingServices = maxServices
          ? Math.max(0, maxServices - (plan.servicesUsed || 0))
          : Infinity;

        if (remainingServices <= 0) {
          plan.nextServiceDate = null;
          if (plan.status === "Active") {
            plan.status = "Expired";
          }
        } else {
          const completionReference = service.completionTime || new Date();
          const nextServiceResolution = resolveDateByFrequencyRules(
            settings,
            completionReference,
            completionReference
          );

          let resolvedNextServiceDate = nextServiceResolution.scheduledDate;
          if (
            plan.endDate &&
            resolvedNextServiceDate &&
            resolvedNextServiceDate > new Date(plan.endDate)
          ) {
            resolvedNextServiceDate = null;
          }

          plan.nextServiceDate = resolvedNextServiceDate;

          if (resolvedNextServiceDate && !nextServiceResolution.requiresManualApproval) {
            const existingScheduled = await MaintenanceService.findOne({
              planId: plan._id,
              status: { $in: ["Scheduled", "Due Soon"] },
              date: {
                $gte: getDayStart(resolvedNextServiceDate),
                $lt: new Date(getDayStart(resolvedNextServiceDate).getTime() + 24 * 60 * 60 * 1000),
              },
            }).lean();

            if (!existingScheduled) {
              await MaintenanceService.create({
                userId: service.userId,
                planId: plan._id,
                date: resolvedNextServiceDate,
                type: service.type || "Cleaning",
                status: "Scheduled",
                executionStatus: "Pending",
                technicianNotes: getTechnicianNotesTemplate(settings),
                serviceChecklist: getChecklistForServiceType(
                  settings,
                  service.type || "Cleaning"
                ),
              });
            }
          }
        }

        await plan.save();
      }
    }

    return res.json({ message: "Service execution updated", service });
  } catch (error) {
    console.error("UPDATE ASSIGNED SERVICE EXECUTION ERROR:", error);
    return res.status(500).json({
      message: "Failed to update service execution",
      error: error.message,
    });
  }
};

/* ===============================
   UPLOAD SERVICE EXECUTION PHOTOS
   POST /api/maintenance/services/:id/execution-photos
================================ */
exports.uploadServiceExecutionPhotos = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await MaintenanceService.findById(id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const currentUser = await User.findById(req.user.id)
      .select("name firstName lastName email role")
      .lean();

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isAdmin = currentUser.role === "admin";
    const assignedById =
      service.technicianId &&
      String(service.technicianId) === String(currentUser._id);

    const aliases = [
      getUserDisplayName(currentUser),
      currentUser.name,
      currentUser.email,
    ]
      .filter(Boolean)
      .map((value) => String(value).trim().toLowerCase());

    const assignedByName = aliases.includes(
      String(service.technician || "").trim().toLowerCase()
    );

    if (!isAdmin && !assignedById && !assignedByName) {
      return res.status(403).json({ message: "Not authorized for this service" });
    }

    const beforeFiles = Array.isArray(req.files?.beforePhotos)
      ? req.files.beforePhotos
      : [];
    const afterFiles = Array.isArray(req.files?.afterPhotos)
      ? req.files.afterPhotos
      : [];

    const beforePhotos = beforeFiles.map(
      (file) => `/uploads/maintenance-service-photos/${file.filename}`
    );
    const afterPhotos = afterFiles.map(
      (file) => `/uploads/maintenance-service-photos/${file.filename}`
    );

    service.beforePhotos = [...(service.beforePhotos || []), ...beforePhotos];
    service.afterPhotos = [...(service.afterPhotos || []), ...afterPhotos];

    await service.save();

    return res.json({
      message: "Service photos uploaded",
      service,
    });
  } catch (error) {
    console.error("UPLOAD SERVICE EXECUTION PHOTOS ERROR:", error);
    return res.status(500).json({
      message: "Failed to upload service photos",
      error: error.message,
    });
  }
};

/* ===============================
   SUMMARY
   GET /api/maintenance/summary
================================ */
exports.getSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const activePlan = await MaintenancePlan.findOne({
      userId,
      status: "Active",
    }).lean();

    const upcoming = await MaintenanceService.find({
      userId,
      status: { $in: ["Scheduled", "Due Soon"] },
    })
      .sort({ date: 1 })
      .limit(10)
      .lean();

    const history = await MaintenanceService.find({
      userId,
      status: "Completed",
    })
      .sort({ date: -1 })
      .limit(20)
      .lean();

    return res.json({ activePlan, upcoming, history });
  } catch (error) {
    console.error("MAINTENANCE SUMMARY ERROR:", error);
    return res.status(500).json({
      message: "Failed to load maintenance summary",
      error: error.message,
    });
  }
};

const createMaintenancePlanForUser = async ({
  userId,
  planType,
  startDate,
  nextServiceDate,
  servicesTotal,
}) => {
  if (!planType || !PLAN_DEFAULTS[planType]) {
    throw new Error("Invalid plan type");
  }

  const existingPlan = await MaintenancePlan.findOne({
    userId,
    status: "Active",
  });

  if (existingPlan) {
    const conflictError = new Error("Active maintenance plan already exists");
    conflictError.statusCode = 409;
    throw conflictError;
  }

  const settings = await getOrCreateMaintenanceSettings();
  const planConfig = getPlanConfigFromSettings(settings, planType);

  if (!planConfig.isPlanActive) {
    const inactiveError = new Error("Selected maintenance plan is currently unavailable");
    inactiveError.statusCode = 400;
    throw inactiveError;
  }

  const start = startDate ? new Date(startDate) : new Date();
  if (Number.isNaN(start.getTime())) {
    const invalidStartDateError = new Error("Invalid start date");
    invalidStartDateError.statusCode = 400;
    throw invalidStartDateError;
  }

  let resolvedNextServiceDate = null;
  if (nextServiceDate) {
    const manualNextDate = new Date(nextServiceDate);
    if (Number.isNaN(manualNextDate.getTime())) {
      const invalidNextDateError = new Error("Invalid next service date");
      invalidNextDateError.statusCode = 400;
      throw invalidNextDateError;
    }
    resolvedNextServiceDate = manualNextDate;
  } else {
    const defaultNextResolution = resolveDateByFrequencyRules(settings, start, start);
    resolvedNextServiceDate = defaultNextResolution.scheduledDate;
  }

  const effectiveServicesTotal =
    typeof servicesTotal === "number"
      ? Math.max(0, Math.floor(servicesTotal))
      : planConfig.servicesTotal;

  const endDate = addMonths(start, planConfig.durationMonths);

  const plan = await MaintenancePlan.create({
    userId,
    planType,
    durationMonths: planConfig.durationMonths,
    servicesTotal: effectiveServicesTotal,
    servicesUsed: 0,
    status: "Active",
    startDate: start,
    endDate,
    nextServiceDate: resolvedNextServiceDate,
    planPrice: planConfig.planPrice,
    taxPercent: planConfig.taxPercent,
    discountPercent: planConfig.discountPercent,
    totalAmount: planConfig.totalAmount,
  });

  if (resolvedNextServiceDate && effectiveServicesTotal !== 0) {
    await MaintenanceService.create({
      userId,
      planId: plan._id,
      date: resolvedNextServiceDate,
      type: "Cleaning",
      status: "Scheduled",
      executionStatus: "Pending",
      technicianNotes: getTechnicianNotesTemplate(settings),
      serviceChecklist: getChecklistForServiceType(settings, "Cleaning"),
    });
  }

  return { plan, planConfig };
};

/* ===============================
   CREATE PAYMENT ORDER
   POST /api/maintenance/payments/create-order
================================ */
exports.createMaintenancePaymentOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { planType } = req.body || {};

    if (!planType || !PLAN_DEFAULTS[planType]) {
      return res.status(400).json({ message: "Invalid plan type" });
    }

    const existingPlan = await MaintenancePlan.findOne({
      userId,
      status: "Active",
    });

    if (existingPlan) {
      return res.status(409).json({
        message: "Active maintenance plan already exists",
      });
    }

    const settings = await getOrCreateMaintenanceSettings();
    const planConfig = getPlanConfigFromSettings(settings, planType);

    if (!planConfig.isPlanActive) {
      return res.status(400).json({
        message: "Selected maintenance plan is currently unavailable",
      });
    }

    const amountInPaise = Math.round((planConfig.totalAmount || 0) * 100);
    if (amountInPaise <= 0) {
      return res.status(400).json({
        message: "Invalid payment amount for selected plan",
      });
    }

    const razorpay = getRazorpayInstance();
    const receipt = `maint_${Date.now()}_${userId.toString().slice(-6)}`;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        userId: String(userId),
        planType,
      },
    });

    await MaintenancePayment.create({
      userId,
      planType,
      amount: planConfig.totalAmount,
      currency: "INR",
      receipt,
      razorpayOrderId: order.id,
      paymentStatus: "created",
    });

    return res.status(201).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      planType,
      displayAmount: planConfig.totalAmount,
    });
  } catch (error) {
    console.error("CREATE MAINTENANCE PAYMENT ORDER ERROR:", error);
    return res.status(500).json({
      message: "Failed to create payment order",
      error: error.message,
    });
  }
};

/* ===============================
   VERIFY PAYMENT AND CREATE PLAN
   POST /api/maintenance/payments/verify
================================ */
exports.verifyMaintenancePaymentAndCreatePlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      planType,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    } = req.body || {};

    if (!planType || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        message: "Missing required payment verification fields",
      });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        message: "Razorpay credentials are not configured",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      await MaintenancePayment.findOneAndUpdate(
        { razorpayOrderId, userId },
        {
          razorpayPaymentId,
          razorpaySignature,
          paymentStatus: "failed",
        },
        { new: true }
      );

      return res.status(400).json({
        message: "Payment verification failed",
      });
    }

    let paymentRecord = await MaintenancePayment.findOne({
      razorpayOrderId,
      userId,
    });

    if (!paymentRecord) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    if (paymentRecord.paymentStatus === "paid" && paymentRecord.planId) {
      const existingPlan = await MaintenancePlan.findById(paymentRecord.planId);
      if (existingPlan) {
        return res.json({
          message: "Plan already created",
          plan: existingPlan,
        });
      }
    }

    const { plan } = await createMaintenancePlanForUser({
      userId,
      planType,
    });

    paymentRecord.razorpayPaymentId = razorpayPaymentId;
    paymentRecord.razorpaySignature = razorpaySignature;
    paymentRecord.paymentStatus = "paid";
    paymentRecord.planId = plan._id;
    await paymentRecord.save();

    return res.status(201).json({
      message: "Payment verified and maintenance plan created",
      plan,
    });
  } catch (error) {
    console.error("VERIFY MAINTENANCE PAYMENT ERROR:", error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      message:
        error.message ||
        "Failed to verify payment and create maintenance plan",
    });
  }
};

/* ===============================
   PLANS
   POST /api/maintenance/plans
================================ */
exports.createPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { planType, startDate, nextServiceDate, servicesTotal } = req.body;
    const { plan } = await createMaintenancePlanForUser({
      userId,
      planType,
      startDate,
      nextServiceDate,
      servicesTotal,
    });

    return res.status(201).json(plan);
  } catch (error) {
    console.error("CREATE MAINTENANCE PLAN ERROR:", error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      message: error.message || "Failed to create maintenance plan",
      error: error.message,
    });
  }
};

/* ===============================
   GET PLANS
   GET /api/maintenance/plans
================================ */
exports.getPlans = async (req, res) => {
  try {
    const userId = req.user.id;
    const plans = await MaintenancePlan.find({ userId }).sort({ createdAt: -1 });
    return res.json(plans);
  } catch (error) {
    console.error("GET MAINTENANCE PLANS ERROR:", error);
    return res.status(500).json({
      message: "Failed to load maintenance plans",
      error: error.message,
    });
  }
};

/* ===============================
   UPDATE PLAN
   PATCH /api/maintenance/plans/:id
================================ */
exports.updatePlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const plan = await MaintenancePlan.findOne({ _id: id, userId });
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const updatableFields = [
      "status",
      "nextServiceDate",
      "servicesUsed",
      "servicesTotal",
      "notes",
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        plan[field] = req.body[field];
      }
    });

    await plan.save();
    return res.json(plan);
  } catch (error) {
    console.error("UPDATE MAINTENANCE PLAN ERROR:", error);
    return res.status(500).json({
      message: "Failed to update maintenance plan",
      error: error.message,
    });
  }
};

/* ===============================
   CANCEL PLAN
   DELETE /api/maintenance/plans/:id
================================ */
exports.cancelPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const plan = await MaintenancePlan.findOne({ _id: id, userId });
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    plan.status = "Cancelled";
    await plan.save();

    return res.json({ message: "Plan cancelled", plan });
  } catch (error) {
    console.error("CANCEL MAINTENANCE PLAN ERROR:", error);
    return res.status(500).json({
      message: "Failed to cancel maintenance plan",
      error: error.message,
    });
  }
};

/* ===============================
   SERVICES
   POST /api/maintenance/services
================================ */
exports.createService = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      planId,
      date,
      type,
      status,
      workDone,
      technician,
      technicianId,
      reportUrl,
      serviceChecklist,
      technicianNotes,
    } =
      req.body;

    if (!date || !type) {
      return res.status(400).json({ message: "Date and type are required" });
    }

    const settings = await getOrCreateMaintenanceSettings();
    const resolvedChecklist =
      Array.isArray(serviceChecklist) && serviceChecklist.length > 0
        ? sanitizeChecklist(serviceChecklist)
        : getChecklistForServiceType(settings, type);
    const resolvedTechnicianNotes =
      technicianNotes !== undefined
        ? String(technicianNotes || "")
        : getTechnicianNotesTemplate(settings);

    let resolvedTechnicianName = technician || "";
    let resolvedTechnicianId = null;

    if (technicianId) {
      const assignedUser = await User.findById(technicianId).select(
        "name firstName lastName email"
      );
      if (assignedUser) {
        resolvedTechnicianId = assignedUser._id;
        resolvedTechnicianName =
          [assignedUser.firstName, assignedUser.lastName]
            .filter(Boolean)
            .join(" ") || assignedUser.name || assignedUser.email || "";
      }
    }

    const service = await MaintenanceService.create({
      userId,
      planId: planId || null,
      date: new Date(date),
      type,
      status: status || "Scheduled",
      workDone: workDone || "",
      technician: resolvedTechnicianName,
      technicianId: resolvedTechnicianId,
      reportUrl: reportUrl || "",
      serviceChecklist: resolvedChecklist,
      technicianNotes: resolvedTechnicianNotes,
    });

    if (planId && service.status === "Completed") {
      await MaintenancePlan.updateOne(
        { _id: planId, userId },
        { $inc: { servicesUsed: 1 } }
      );
    }

    return res.status(201).json(service);
  } catch (error) {
    console.error("CREATE MAINTENANCE SERVICE ERROR:", error);
    return res.status(500).json({
      message: "Failed to create maintenance service",
      error: error.message,
    });
  }
};

/* ===============================
   GET UPCOMING SERVICES
   GET /api/maintenance/services/upcoming
================================ */
exports.getUpcomingServices = async (req, res) => {
  try {
    const userId = req.user.id;
    const services = await MaintenanceService.find({
      userId,
      status: { $in: ["Scheduled", "Due Soon"] },
    })
      .sort({ date: 1 })
      .limit(20);

    return res.json(services);
  } catch (error) {
    console.error("GET UPCOMING SERVICES ERROR:", error);
    return res.status(500).json({
      message: "Failed to load upcoming services",
      error: error.message,
    });
  }
};

/* ===============================
   GET SERVICE HISTORY
   GET /api/maintenance/services/history
================================ */
exports.getServiceHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const services = await MaintenanceService.find({
      userId,
      status: "Completed",
    })
      .sort({ date: -1 })
      .limit(50);

    return res.json(services);
  } catch (error) {
    console.error("GET SERVICE HISTORY ERROR:", error);
    return res.status(500).json({
      message: "Failed to load service history",
      error: error.message,
    });
  }
};

/* ===============================
   UPDATE SERVICE
   PATCH /api/maintenance/services/:id
================================ */
exports.updateService = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const service = await MaintenanceService.findOne({ _id: id, userId });
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const previousStatus = service.status;
    const updatableFields = [
      "date",
      "type",
      "status",
      "workDone",
      "technician",
      "technicianId",
      "reportUrl",
      "serviceChecklist",
      "technicianNotes",
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        service[field] = req.body[field];
      }
    });

    await service.save();

    if (
      service.planId &&
      previousStatus !== "Completed" &&
      service.status === "Completed"
    ) {
      await MaintenancePlan.updateOne(
        { _id: service.planId, userId },
        { $inc: { servicesUsed: 1 } }
      );
    }

    return res.json(service);
  } catch (error) {
    console.error("UPDATE MAINTENANCE SERVICE ERROR:", error);
    return res.status(500).json({
      message: "Failed to update maintenance service",
      error: error.message,
    });
  }
};
