const Booking = require("../models/Booking");

const getRevenueFromBooking = (booking) => {
  return (
    booking?.quotation?.netCost ||
    booking?.finalCost ||
    booking?.quotation?.totalCost ||
    booking?.baseCost ||
    booking?.estimatedCost ||
    0
  );
};

const getCostFromBooking = (booking) => {
  const breakdown = booking?.costBreakdown || {};
  if (typeof breakdown.totalCost === "number" && breakdown.totalCost > 0) {
    return breakdown.totalCost;
  }

  const costFields = [
    breakdown.equipment || 0,
    breakdown.labor || 0,
    breakdown.logistics || 0,
    breakdown.permits || 0,
    breakdown.overhead || 0,
    breakdown.other || 0,
  ];

  return costFields.reduce((sum, v) => sum + v, 0);
};

const buildDateFilter = (startDate, endDate) => {
  if (!startDate && !endDate) return {};
  const createdAt = {};
  if (startDate) createdAt.$gte = new Date(startDate);
  if (endDate) createdAt.$lte = new Date(endDate);
  return { createdAt };
};

/**
 * ================================
 * FINANCIAL OVERVIEW
 * GET /api/finance/overview
 * ================================
 */
exports.getFinancialOverview = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = buildDateFilter(startDate, endDate);

    const allBookings = await Booking.find(dateFilter);
    const completedBookings = allBookings.filter(
      (b) => b.status === "Completed"
    );
    const pipelineBookings = allBookings.filter((b) =>
      ["Approved", "Scheduled", "In Progress"].includes(b.status)
    );

    const totalRevenue = completedBookings.reduce(
      (sum, b) => sum + getRevenueFromBooking(b),
      0
    );
    const totalCost = completedBookings.reduce(
      (sum, b) => sum + getCostFromBooking(b),
      0
    );

    const grossProfit = totalRevenue - totalCost;
    const marginPercent =
      totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    const pipelineRevenue = pipelineBookings.reduce(
      (sum, b) => sum + getRevenueFromBooking(b),
      0
    );

    const avgMarginPercent = completedBookings.length
      ? completedBookings.reduce((sum, b) => {
          const revenue = getRevenueFromBooking(b);
          const cost = getCostFromBooking(b);
          const profit = revenue - cost;
          const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
          return sum + margin;
        }, 0) / completedBookings.length
      : 0;

    res.json({
      totals: {
        bookings: allBookings.length,
        completed: completedBookings.length,
        pipeline: pipelineBookings.length,
      },
      revenue: {
        totalRevenue,
        pipelineRevenue,
      },
      costs: {
        totalCost,
      },
      profit: {
        grossProfit,
        marginPercent: Number(marginPercent.toFixed(2)),
        avgMarginPercent: Number(avgMarginPercent.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("FINANCIAL OVERVIEW ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch financial overview",
      error: error.message,
    });
  }
};

/**
 * ================================
 * REVENUE REPORT
 * GET /api/finance/reports/revenue
 * ================================
 */
exports.getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = buildDateFilter(startDate, endDate);

    const completedBookings = await Booking.find({
      ...dateFilter,
      status: "Completed",
    });

    const report = {};

    completedBookings.forEach((b) => {
      const date = new Date(b.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`;

      if (!report[key]) {
        report[key] = {
          revenue: 0,
          cost: 0,
          profit: 0,
          count: 0,
        };
      }

      const revenue = getRevenueFromBooking(b);
      const cost = getCostFromBooking(b);
      report[key].revenue += revenue;
      report[key].cost += cost;
      report[key].profit += revenue - cost;
      report[key].count += 1;
    });

    const series = Object.keys(report)
      .sort()
      .map((key) => ({
        period: key,
        ...report[key],
        marginPercent:
          report[key].revenue > 0
            ? Number(
                (((report[key].revenue - report[key].cost) /
                  report[key].revenue) *
                  100
                ).toFixed(2)
              )
            : 0,
      }));

    res.json({
      series,
    });
  } catch (error) {
    console.error("REVENUE REPORT ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch revenue report",
      error: error.message,
    });
  }
};

/**
 * ================================
 * PROJECT PROFITABILITY
 * GET /api/finance/bookings/profit
 * ================================
 */
exports.getProjectProfitability = async (req, res) => {
  try {
    const { status = "Completed", limit = 50, skip = 0 } = req.query;

    const bookings = await Booking.find({ status })
      .populate("customer", "fullName phone")
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const data = bookings.map((b) => {
      const revenue = getRevenueFromBooking(b);
      const cost = getCostFromBooking(b);
      const profit = revenue - cost;
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

      return {
        id: b._id,
        bookingId: b.bookingId,
        customer: b.contactPerson || b.customer?.fullName || b.user?.name,
        systemType: b.systemType,
        capacity: b.capacity,
        status: b.status,
        revenue,
        cost,
        profit,
        marginPercent: Number(margin.toFixed(2)),
        createdAt: b.createdAt,
      };
    });

    res.json({ data });
  } catch (error) {
    console.error("PROFITABILITY ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch profitability data",
      error: error.message,
    });
  }
};

/**
 * ================================
 * COMPANY ROI
 * GET /api/finance/roi/company
 * ================================
 */
exports.getCompanyRoi = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = buildDateFilter(startDate, endDate);

    const completedBookings = await Booking.find({
      ...dateFilter,
      status: "Completed",
    });

    const totalRevenue = completedBookings.reduce(
      (sum, b) => sum + getRevenueFromBooking(b),
      0
    );
    const totalCost = completedBookings.reduce(
      (sum, b) => sum + getCostFromBooking(b),
      0
    );
    const profit = totalRevenue - totalCost;

    const roiPercent = totalCost > 0 ? (profit / totalCost) * 100 : 0;

    res.json({
      totals: {
        completedBookings: completedBookings.length,
        totalRevenue,
        totalCost,
        profit,
      },
      roi: {
        percent: Number(roiPercent.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("COMPANY ROI ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch company ROI",
      error: error.message,
    });
  }
};

/**
 * ================================
 * INSTALLATION COST ANALYSIS
 * GET /api/finance/costs/installation
 * ================================
 */
exports.getInstallationCostAnalysis = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = buildDateFilter(startDate, endDate);

    const completedBookings = await Booking.find({
      ...dateFilter,
      status: "Completed",
    });

    const totals = {
      equipment: 0,
      labor: 0,
      logistics: 0,
      permits: 0,
      overhead: 0,
      other: 0,
      totalCost: 0,
    };

    completedBookings.forEach((b) => {
      const breakdown = b.costBreakdown || {};
      totals.equipment += breakdown.equipment || 0;
      totals.labor += breakdown.labor || 0;
      totals.logistics += breakdown.logistics || 0;
      totals.permits += breakdown.permits || 0;
      totals.overhead += breakdown.overhead || 0;
      totals.other += breakdown.other || 0;
      totals.totalCost += getCostFromBooking(b);
    });

    const count = completedBookings.length;
    const average = {
      equipment: count ? totals.equipment / count : 0,
      labor: count ? totals.labor / count : 0,
      logistics: count ? totals.logistics / count : 0,
      permits: count ? totals.permits / count : 0,
      overhead: count ? totals.overhead / count : 0,
      other: count ? totals.other / count : 0,
      totalCost: count ? totals.totalCost / count : 0,
    };

    res.json({
      totals,
      average,
      completedBookings: count,
    });
  } catch (error) {
    console.error("INSTALLATION COST ANALYSIS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch installation cost analysis",
      error: error.message,
    });
  }
};

/**
 * ================================
 * UPDATE COST BREAKDOWN
 * PATCH /api/finance/bookings/:id/costs
 * ================================
 */
exports.updateBookingCosts = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      equipment = 0,
      labor = 0,
      logistics = 0,
      permits = 0,
      overhead = 0,
      other = 0,
    } = req.body || {};

    const totalCost =
      Number(equipment) +
      Number(labor) +
      Number(logistics) +
      Number(permits) +
      Number(overhead) +
      Number(other);

    const booking = await Booking.findByIdAndUpdate(
      id,
      {
        costBreakdown: {
          equipment: Number(equipment),
          labor: Number(labor),
          logistics: Number(logistics),
          permits: Number(permits),
          overhead: Number(overhead),
          other: Number(other),
          totalCost,
        },
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({
      message: "Cost breakdown updated",
      booking,
    });
  } catch (error) {
    console.error("UPDATE COST BREAKDOWN ERROR:", error);
    res.status(500).json({
      message: "Failed to update cost breakdown",
      error: error.message,
    });
  }
};
