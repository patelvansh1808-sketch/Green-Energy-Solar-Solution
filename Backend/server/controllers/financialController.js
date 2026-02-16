const Booking = require("../models/Booking");
const Project = require("../models/Project");
const Customer = require("../models/Customer");

/**
 * GET /api/financial/overview
 * Returns financial overview including revenue, costs, profit margins
 */
exports.getFinancialOverview = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Get all bookings with confirmed/completed status
     const bookings = await Booking.find({
       ...dateFilter,
       status: { $in: ["Approved", "Scheduled", "In Progress", "Completed"] },
     });

    // Calculate total revenue from bookings
    const totalRevenue = bookings.reduce((sum, booking) => {
      return sum + (booking.quotation?.totalCost || booking.finalCost || 0);
    }, 0);

    // Calculate total costs (equipment + installation)
    const totalEquipmentCost = bookings.reduce((sum, booking) => {
      return sum + (booking.quotation?.equipmentCost || booking.baseCost * 0.7 || 0);
    }, 0);

    const totalInstallationCost = bookings.reduce((sum, booking) => {
      return sum + (booking.quotation?.installationCost || booking.baseCost * 0.3 || 0);
    }, 0);

    const totalCosts = totalEquipmentCost + totalInstallationCost;

    // Calculate profit and margin
    const totalProfit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) : 0;

    // Calculate ROI
    const roi = totalCosts > 0 ? ((totalProfit / totalCosts) * 100).toFixed(2) : 0;

    // Get subsidy data
    const totalSubsidyAmount = bookings.reduce((sum, booking) => {
      return sum + (booking.quotation?.subsidyAmount || booking.subsidyAmount || 0);
    }, 0);

    // Get total customers
    const totalCustomers = await Customer.countDocuments();
    const activeCustomers = await Customer.countDocuments({ status: "Active" });

    res.json({
      success: true,
      data: {
        revenue: {
          total: totalRevenue,
          byPeriod: "Custom",
        },
        costs: {
          equipment: totalEquipmentCost,
          installation: totalInstallationCost,
          total: totalCosts,
        },
        profit: {
          total: totalProfit,
          margin: parseFloat(profitMargin),
        },
        roi: parseFloat(roi),
        subsidies: {
          total: totalSubsidyAmount,
        },
        customers: {
          total: totalCustomers,
          active: activeCustomers,
        },
        bookings: {
          total: bookings.length,
        },
      },
    });
  } catch (error) {
    console.error("Financial Overview Error:", error);
    res.status(500).json({ success: false, message: "Error fetching financial overview", error: error.message });
  }
};

/**
 * GET /api/financial/revenue-breakdown
 * Returns revenue breakdown by month, system type, etc.
 */
exports.getRevenueBreakdown = async (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    // Get bookings for the year
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

     const bookings = await Booking.find({
       createdAt: { $gte: startOfYear, $lte: endOfYear },
       status: { $in: ["Approved", "Scheduled", "In Progress", "Completed"] },
     });

    // Revenue by month
    const monthlyRevenue = Array(12).fill(0);
    const monthlyCosts = Array(12).fill(0);
    const monthlyProfit = Array(12).fill(0);

    // Revenue by system type
    const revenueByType = {
      Residential: 0,
      Commercial: 0,
      Industrial: 0,
    };

    bookings.forEach((booking) => {
      const month = new Date(booking.createdAt).getMonth();
      const revenue = booking.quotation?.totalCost || booking.finalCost || 0;
      const cost = (booking.quotation?.equipmentCost || 0) + (booking.quotation?.installationCost || 0);
      const profit = revenue - cost;

      monthlyRevenue[month] += revenue;
      monthlyCosts[month] += cost;
      monthlyProfit[month] += profit;

      if (revenueByType[booking.systemType] !== undefined) {
        revenueByType[booking.systemType] += revenue;
      }
    });

    res.json({
      success: true,
      data: {
        year: currentYear,
        monthly: monthlyRevenue.map((revenue, index) => ({
          month: index + 1,
          revenue,
          cost: monthlyCosts[index],
          profit: monthlyProfit[index],
        })),
        bySystemType: revenueByType,
      },
    });
  } catch (error) {
    console.error("Revenue Breakdown Error:", error);
    res.status(500).json({ success: false, message: "Error fetching revenue breakdown", error: error.message });
  }
};

/**
 * GET /api/financial/installation-costs
 * Returns detailed installation cost analysis
 */
exports.getInstallationCosts = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

     const bookings = await Booking.find({
       ...dateFilter,
       status: { $in: ["Approved", "Scheduled", "In Progress", "Completed"] },
     }).select("systemType capacity quotation baseCost createdAt");

    const costAnalysis = bookings.map((booking) => ({
      bookingId: booking._id,
      systemType: booking.systemType,
      capacity: booking.capacity,
      equipmentCost: booking.quotation?.equipmentCost || 0,
      installationCost: booking.quotation?.installationCost || 0,
      totalCost: booking.quotation?.totalCost || booking.baseCost || 0,
      date: booking.createdAt,
    }));

    // Calculate averages
    const avgEquipmentCost = costAnalysis.reduce((sum, b) => sum + b.equipmentCost, 0) / (costAnalysis.length || 1);
    const avgInstallationCost = costAnalysis.reduce((sum, b) => sum + b.installationCost, 0) / (costAnalysis.length || 1);
    const avgTotalCost = costAnalysis.reduce((sum, b) => sum + b.totalCost, 0) / (costAnalysis.length || 1);

    res.json({
      success: true,
      data: {
        installations: costAnalysis,
        averages: {
          equipment: avgEquipmentCost.toFixed(2),
          installation: avgInstallationCost.toFixed(2),
          total: avgTotalCost.toFixed(2),
        },
        totalInstallations: costAnalysis.length,
      },
    });
  } catch (error) {
    console.error("Installation Costs Error:", error);
    res.status(500).json({ success: false, message: "Error fetching installation costs", error: error.message });
  }
};

/**
 * GET /api/financial/profit-margins
 * Returns profit margin analysis per booking and overall
 */
exports.getProfitMargins = async (req, res) => {
  try {
     const bookings = await Booking.find({
       status: { $in: ["Approved", "Scheduled", "In Progress", "Completed"] },
     }).select("bookingId systemType capacity quotation finalCost baseCost createdAt");

    const profitAnalysis = bookings.map((booking) => {
      const revenue = booking.quotation?.totalCost || booking.finalCost || 0;
      const cost = (booking.quotation?.equipmentCost || 0) + (booking.quotation?.installationCost || 0);
      const profit = revenue - cost;
      const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(2) : 0;

      return {
        bookingId: booking.bookingId || booking._id,
        systemType: booking.systemType,
        capacity: booking.capacity,
        revenue,
        cost,
        profit,
        margin: parseFloat(margin),
        date: booking.createdAt,
      };
    });

    // Overall stats
    const totalRevenue = profitAnalysis.reduce((sum, b) => sum + b.revenue, 0);
    const totalCost = profitAnalysis.reduce((sum, b) => sum + b.cost, 0);
    const totalProfit = totalRevenue - totalCost;
    const overallMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        profitAnalysis,
        overall: {
          totalRevenue,
          totalCost,
          totalProfit,
          margin: parseFloat(overallMargin),
        },
      },
    });
  } catch (error) {
    console.error("Profit Margins Error:", error);
    res.status(500).json({ success: false, message: "Error fetching profit margins", error: error.message });
  }
};

/**
 * GET /api/financial/roi-report
 * Returns company ROI report
 */
exports.getROIReport = async (req, res) => {
  try {
     const bookings = await Booking.find({
       status: { $in: ["Approved", "Scheduled", "In Progress", "Completed"] },
     });

    const totalRevenue = bookings.reduce((sum, b) => sum + (b.quotation?.totalCost || b.finalCost || 0), 0);
    const totalInvestment = bookings.reduce(
      (sum, b) => sum + (b.quotation?.equipmentCost || 0) + (b.quotation?.installationCost || 0),
      0
    );
    const totalProfit = totalRevenue - totalInvestment;

    const roi = totalInvestment > 0 ? ((totalProfit / totalInvestment) * 100).toFixed(2) : 0;

    // Calculate customer ROI averages
    const customerROIs = bookings
      .filter((b) => b.quotation?.roiYears)
      .map((b) => b.quotation.roiYears);
    
    const avgCustomerROI = customerROIs.length > 0
      ? (customerROIs.reduce((sum, roi) => sum + roi, 0) / customerROIs.length).toFixed(2)
      : 0;

    res.json({
      success: true,
      data: {
        company: {
          totalRevenue,
          totalInvestment,
          totalProfit,
          roi: parseFloat(roi),
        },
        customers: {
          avgROIYears: parseFloat(avgCustomerROI),
          totalWithROI: customerROIs.length,
        },
      },
    });
  } catch (error) {
    console.error("ROI Report Error:", error);
    res.status(500).json({ success: false, message: "Error fetching ROI report", error: error.message });
  }
};
