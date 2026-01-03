const Energy = require("../models/Energy");
const Alert = require("../models/Alert");
const Booking = require("../models/Booking");
const Subsidy = require("../models/Subsidy");
const Customer = require("../models/Customer");
const User = require("../models/User");

/**
 * ================================
 * GET DASHBOARD DATA
 * GET /api/dashboard
 * ================================
 */
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user and customer data
    const user = await User.findById(userId);
    const customer = await Customer.findOne({ userId });

    if (!customer) {
      return res.status(404).json({ message: "Customer profile not found" });
    }

    // Get energy data for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const energyData = await Energy.find({
      userId,
      date: { $gte: thirtyDaysAgo },
    }).sort({ date: -1 });

    // Get booking information
    const booking = await Booking.findOne({ user: userId }).sort({
      createdAt: -1,
    });

    // Get subsidy information
    const subsidy = await Subsidy.findOne({ userId }).sort({ createdAt: -1 });

    // Get recent alerts
    const alerts = await Alert.find({ userId }).sort({ createdAt: -1 }).limit(5);

    // Calculate metrics
    const totalEnergyGenerated = energyData.reduce(
      (sum, d) => sum + d.unitsGenerated,
      0
    );
    const averageDailyGeneration =
      energyData.length > 0 ? totalEnergyGenerated / energyData.length : 0;
    const maxDailyGeneration =
      energyData.length > 0
        ? Math.max(...energyData.map((d) => d.unitsGenerated))
        : 0;

    // Calculate savings (assuming ₹6 per unit)
    const costPerUnit = 6;
    const totalSavings = totalEnergyGenerated * costPerUnit;
    const monthlySavingsAverage = averageDailyGeneration * costPerUnit * 30;

    // Calculate ROI
    const systemCost = booking ? booking.finalCost : 0;
    const roi = systemCost > 0 ? ((totalSavings / systemCost) * 100).toFixed(2) : 0;
    const roiYears = systemCost > 0 ? (systemCost / (monthlySavingsAverage * 12)).toFixed(2) : 0;

    // Get unresolved alerts count
    const unresolvedAlertsCount = await Alert.countDocuments({
      userId,
      isResolved: false,
    });

    // Get system status
    const systemOnlineCount = energyData.filter(
      (d) => d.inverterStatus === "online"
    ).length;
    const systemStatus =
      systemOnlineCount === energyData.length
        ? "Online"
        : systemOnlineCount > energyData.length / 2
        ? "Partial"
        : "Offline";

    return res.json({
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
      customer: {
        systemCapacity: customer.systemCapacityKW,
        location: customer.location,
        installationDate: customer.installationDate,
        status: customer.status,
      },
      energy: {
        totalGenerated: totalEnergyGenerated.toFixed(2),
        averageDaily: averageDailyGeneration.toFixed(2),
        maxDaily: maxDailyGeneration.toFixed(2),
        unitCount: energyData.length,
        data: energyData,
      },
      savings: {
        total: totalSavings.toFixed(2),
        monthlyAverage: monthlySavingsAverage.toFixed(2),
        costPerUnit,
      },
      roi: {
        percentage: roi,
        paybackYears: roiYears,
        systemCost,
      },
      subsidy: subsidy
        ? {
            state: subsidy.state,
            eligibilityPercentage: subsidy.eligibilityPercentage,
            appliedAmount: subsidy.appliedAmount,
            approvedAmount: subsidy.approvedAmount,
            status: subsidy.status,
          }
        : null,
      alerts: {
        recent: alerts,
        unresolvedCount: unresolvedAlertsCount,
      },
      system: {
        status: systemStatus,
        onlinePercentage:
          energyData.length > 0
            ? ((systemOnlineCount / energyData.length) * 100).toFixed(0)
            : 0,
      },
    });
  } catch (error) {
    console.error("GET DASHBOARD ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
};

/**
 * ================================
 * GET ENERGY CHART DATA
 * GET /api/dashboard/energy
 * ================================
 */
exports.getEnergyChart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const energyData = await Energy.find({
      userId,
      date: { $gte: startDate },
    }).sort({ date: 1 });

    const chartData = energyData.map((d) => ({
      date: d.date.toLocaleDateString(),
      energy: d.unitsGenerated,
      efficiency: d.efficiency,
    }));

    res.json({
      days,
      data: chartData,
      total: energyData.reduce((sum, d) => sum + d.unitsGenerated, 0),
    });
  } catch (error) {
    console.error("GET ENERGY CHART ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch energy chart data",
      error: error.message,
    });
  }
};

/**
 * ================================
 * GET ALERTS
 * GET /api/dashboard/alerts
 * ================================
 */
exports.getAlerts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, skip = 0, resolved = false } = req.query;

    const query = { userId };
    if (resolved !== "all") {
      query.isResolved = resolved === "true";
    }

    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Alert.countDocuments(query);

    res.json({
      alerts,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip),
    });
  } catch (error) {
    console.error("GET ALERTS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch alerts",
      error: error.message,
    });
  }
};

/**
 * ================================
 * RESOLVE ALERT
 * PATCH /api/dashboard/alerts/:id/resolve
 * ================================
 */
exports.resolveAlert = async (req, res) => {
  try {
    const alertId = req.params.id;
    const userId = req.user.id;

    const alert = await Alert.findOne({ _id: alertId, userId });

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    alert.isResolved = true;
    alert.resolvedAt = new Date();
    await alert.save();

    res.json({
      message: "Alert resolved",
      alert,
    });
  } catch (error) {
    console.error("RESOLVE ALERT ERROR:", error);
    res.status(500).json({
      message: "Failed to resolve alert",
      error: error.message,
    });
  }
};

/**
 * ================================
 * GET ROI PROJECTION
 * GET /api/dashboard/roi
 * ================================
 */
exports.getRoiProjection = async (req, res) => {
  try {
    const userId = req.user.id;

    const booking = await Booking.findOne({ user: userId });
    const energyData = await Energy.find({ userId }).sort({ date: -1 });

    if (!booking || energyData.length === 0) {
      return res.status(404).json({ message: "Insufficient data for ROI calculation" });
    }

    const systemCost = booking.finalCost;
    const monthlyGeneration = energyData.length > 0 ? energyData.reduce((sum, d) => sum + d.unitsGenerated, 0) / (energyData.length / 30) : 0;
    const costPerUnit = 6;
    const monthlySavings = monthlyGeneration * costPerUnit;

    const projections = [];
    for (let year = 1; year <= 25; year++) {
      const cumulativeSavings = monthlySavings * 12 * year;
      const roi = ((cumulativeSavings / systemCost) * 100).toFixed(2);
      const paybackAchieved = cumulativeSavings >= systemCost;

      projections.push({
        year,
        cumulativeSavings: cumulativeSavings.toFixed(2),
        roi,
        paybackAchieved,
      });
    }

    const paybackYear = projections.find((p) => p.paybackAchieved)?.year || null;

    res.json({
      systemCost,
      monthlyGeneration: monthlyGeneration.toFixed(2),
      monthlySavings: monthlySavings.toFixed(2),
      paybackYears: paybackYear,
      projections,
    });
  } catch (error) {
    console.error("GET ROI PROJECTION ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch ROI projection",
      error: error.message,
    });
  }
};

/**
 * ================================
 * RECORD ENERGY DATA
 * POST /api/dashboard/energy
 * ================================
 */
exports.recordEnergy = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, unitsGenerated, peakPower, efficiency, temperature, inverterStatus, notes } = req.body;

    if (!date || unitsGenerated === undefined) {
      return res.status(400).json({
        message: "Required fields missing",
        required: ["date", "unitsGenerated"],
      });
    }

    const customer = await Customer.findOne({ userId });

    const energy = await Energy.create({
      userId,
      customerId: customer?._id,
      date: new Date(date),
      unitsGenerated: Number(unitsGenerated),
      peakPower: Number(peakPower || 0),
      efficiency: Number(efficiency || 0),
      temperature: Number(temperature || 0),
      inverterStatus: inverterStatus || "online",
      notes,
    });

    res.status(201).json({
      message: "Energy data recorded successfully",
      energy,
    });
  } catch (error) {
    console.error("RECORD ENERGY ERROR:", error);
    res.status(500).json({
      message: "Failed to record energy data",
      error: error.message,
    });
  }
};
