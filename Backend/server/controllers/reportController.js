const {
  generateEnergyReportPDF,
  generateCostSavingsReportPDF,
  generateBookingInvoicePDF,
  generateROIReport,
} = require("../utils/pdfGenerator");
const { exportMonthlyEnergyExcel } = require("../utils/excelExporter");
const Energy = require("../models/Energy");
const Booking = require("../models/Booking");
const User = require("../models/User");

const monthLabel = (month, year) => {
  const names = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${names[month - 1]} ${year}`;
};

const parseMonthYear = (query) => {
  const now = new Date();
  const month = Number(query.month) || now.getMonth() + 1;
  const year = Number(query.year) || now.getFullYear();
  return { month, year };
};

const fetchMonthlyEnergy = async (userId, month, year) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  // Primary: data for the requested month
  let records = await Energy.find({
    userId,
    date: { $gte: start, $lt: end },
  }).sort({ date: 1 });

  let fallbackUsed = false;

  // Fallback: latest 30 records if month is empty
  if (!records.length) {
    fallbackUsed = true;
    records = await Energy.find({ userId })
      .sort({ date: -1 })
      .limit(30);
    records = records.reverse(); // keep chronological
  }

  const daily = {};
  records.forEach((item) => {
    const key = item.date.toISOString().slice(0, 10);
    daily[key] = (daily[key] || 0) + item.unitsGenerated;
  });

  const dailyArray = Object.entries(daily).map(([date, units]) => ({
    date,
    units,
  }));

  const totalUnits = dailyArray.reduce((sum, d) => sum + d.units, 0);
  const avgUnitsPerDay = dailyArray.length
    ? Number((totalUnits / dailyArray.length).toFixed(2))
    : 0;

  return { dailyArray, totalUnits, avgUnitsPerDay, fallbackUsed };
};

exports.generateReport = async (req, res) => {
  try {
    const { month, year } = parseMonthYear(req.query);
    const { dailyArray, totalUnits, avgUnitsPerDay, fallbackUsed } =
      await fetchMonthlyEnergy(req.user.id, month, year);

    if (!dailyArray.length) {
      return res.status(404).json({ message: "No energy data available" });
    }

    generateEnergyReportPDF(res, {
      title: "Monthly Energy Report",
      monthLabel: monthLabel(month, year),
      daily: dailyArray,
      totalUnits,
      avgUnitsPerDay,
      note: fallbackUsed
        ? "No data for the selected month; showing latest available records."
        : undefined,
    });
  } catch (error) {
    console.error("REPORT PDF ERROR", error.message);
    res.status(500).json({ message: "Report generation failed" });
  }
};

exports.generateMonthlyEnergyPDF = async (req, res) => {
  try {
    const { month, year } = parseMonthYear(req.query);
    const { dailyArray, totalUnits, avgUnitsPerDay, fallbackUsed } =
      await fetchMonthlyEnergy(req.user.id, month, year);

    if (!dailyArray.length) {
      return res.status(404).json({ message: "No energy data available" });
    }

    generateEnergyReportPDF(res, {
      title: "Monthly Energy Report",
      monthLabel: monthLabel(month, year),
      daily: dailyArray,
      totalUnits,
      avgUnitsPerDay,
      note: fallbackUsed
        ? "No data for the selected month; showing latest available records."
        : undefined,
    });
  } catch (error) {
    console.error("ENERGY PDF ERROR", error.message);
    res.status(500).json({ message: "Monthly energy PDF failed" });
  }
};

exports.generateMonthlyEnergyExcel = async (req, res) => {
  try {
    const { month, year } = parseMonthYear(req.query);
    const { dailyArray, fallbackUsed } = await fetchMonthlyEnergy(
      req.user.id,
      month,
      year
    );

    if (!dailyArray.length) {
      return res.status(404).json({ message: "No energy data available" });
    }

    await exportMonthlyEnergyExcel(
      {
        daily: dailyArray,
        monthLabel: monthLabel(month, year),
        note: fallbackUsed
          ? "No data for the selected month; showing latest available records."
          : undefined,
      },
      res
    );
  } catch (error) {
    console.error("ENERGY EXCEL ERROR", error.message);
    res.status(500).json({ message: "Monthly energy Excel failed" });
  }
};

exports.generateCostSavingsPDF = async (req, res) => {
  try {
    const { month, year } = parseMonthYear(req.query);
    const rate = Number(req.query.rate) || 8; // ₹ per kWh
    const { dailyArray, totalUnits, avgUnitsPerDay, fallbackUsed } =
      await fetchMonthlyEnergy(req.user.id, month, year);

    if (!dailyArray.length) {
      return res.status(404).json({ message: "No energy data available" });
    }

    const estimatedSavings = Number((totalUnits * rate).toFixed(2));

    generateCostSavingsReportPDF(res, {
      monthLabel: monthLabel(month, year),
      totalUnits,
      avgUnitsPerDay,
      rate,
      estimatedSavings,
      daily: dailyArray,
      note: fallbackUsed
        ? "No data for the selected month; showing latest available records."
        : undefined,
    });
  } catch (error) {
    console.error("COST PDF ERROR", error.message);
    res.status(500).json({ message: "Cost & savings PDF failed" });
  }
};

exports.generateBookingInvoicePDF = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findOne({ _id: bookingId, user: req.user.id });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const user = await User.findById(req.user.id).lean();

    generateBookingInvoicePDF(res, {
      booking,
      user,
    });
  } catch (error) {
    console.error("INVOICE PDF ERROR", error.message);
    res.status(500).json({ message: "Invoice generation failed" });
  }
};
