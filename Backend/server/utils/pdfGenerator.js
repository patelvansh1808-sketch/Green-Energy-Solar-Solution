const PDFDocument = require("pdfkit");

const formatCurrency = (value) => `₹${Number(value).toLocaleString("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`;

const setHeaders = (res, filename) => {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${filename}`
  );
};

const addSummaryLines = (doc, lines) => {
  doc.fontSize(12);
  lines.forEach((line) => doc.text(line));
  doc.moveDown();
};

exports.generateEnergyReportPDF = (res, payload) => {
  const doc = new PDFDocument({ margin: 40 });

  setHeaders(res, "Monthly_Energy_Report.pdf");
  doc.pipe(res);

  doc.fontSize(20).text(payload.title || "Monthly Energy Report", {
    align: "center",
  });
  doc.moveDown(1.5);

  addSummaryLines(doc, [
    `Month: ${payload.monthLabel}`,
    `Total Energy: ${payload.totalUnits} kWh`,
    `Average per Day: ${payload.avgUnitsPerDay} kWh`,
  ]);

  if (payload.note) {
    doc.fontSize(10).fillColor("#666").text(payload.note).fillColor("#000");
    doc.moveDown(0.5);
  }

  doc.fontSize(14).text("Daily Generation", { underline: true });
  doc.moveDown(0.5);

  payload.daily.forEach((day) => {
    doc.fontSize(11).text(`${day.date}: ${day.units} kWh`);
  });

  doc.end();
};

exports.generateCostSavingsReportPDF = (res, payload) => {
  const doc = new PDFDocument({ margin: 40 });

  setHeaders(res, "Cost_Savings_Report.pdf");
  doc.pipe(res);

  doc.fontSize(20).text("Cost & Savings Report", { align: "center" });
  doc.moveDown(1.5);

  addSummaryLines(doc, [
    `Month: ${payload.monthLabel}`,
    `Total Energy: ${payload.totalUnits} kWh`,
    `Average per Day: ${payload.avgUnitsPerDay} kWh`,
    `Tariff Applied: ${formatCurrency(payload.rate)} per kWh`,
    `Estimated Savings: ${formatCurrency(payload.estimatedSavings)}`,
  ]);

  if (payload.note) {
    doc.fontSize(10).fillColor("#666").text(payload.note).fillColor("#000");
    doc.moveDown(0.5);
  }

  doc.fontSize(14).text("Daily Breakdown", { underline: true });
  doc.moveDown(0.5);

  payload.daily.forEach((day) => {
    const savings = formatCurrency(day.units * payload.rate);
    doc.fontSize(11).text(`${day.date}: ${day.units} kWh | Savings: ${savings}`);
  });

  doc.end();
};

exports.generateBookingInvoicePDF = (res, payload) => {
  const doc = new PDFDocument({ margin: 40 });

  setHeaders(res, "Booking_Invoice.pdf");
  doc.pipe(res);

  doc.fontSize(20).text("Solar System Booking Invoice", { align: "center" });
  doc.moveDown(1.5);

  doc.fontSize(12).text(`Customer: ${payload.user?.name || ""}`);
  doc.text(`Email: ${payload.user?.email || ""}`);
  doc.text(`Connection Type: ${payload.user?.connectionType || ""}`);
  doc.moveDown();

  doc.fontSize(13).text("Booking Details", { underline: true });
  doc.moveDown(0.5);

  const b = payload.booking;
  addSummaryLines(doc, [
    `System Type: ${b.systemType}`,
    `Capacity: ${b.capacity} kW`,
    `Base Cost: ${formatCurrency(b.baseCost)}`,
    `Subsidy Applied: ${b.subsidyApplied ? "Yes" : "No"}`,
    `Subsidy Amount: ${formatCurrency(b.subsidyAmount || 0)}`,
    `Final Cost: ${formatCurrency(b.finalCost)}`,
    b.emiEnabled ? `EMI: ${b.emiYears} years @ ${formatCurrency(b.monthlyEmi || 0)} / month` : "EMI: Not selected",
  ]);

  doc.text("Thank you for choosing our solar solution.");
  doc.end();
};

exports.generateROIReport = (res, data) => {
  const doc = new PDFDocument({ margin: 40 });

  setHeaders(res, "ROI_Report.pdf");
  doc.pipe(res);

  doc
    .fontSize(20)
    .text("ROI & Break-Even Analysis Report", { align: "center" })
    .moveDown(2);

  doc.fontSize(12);
  doc.text(`Net Investment: ${formatCurrency(data.netInvestment)}`);
  doc.text(`Annual Savings: ${formatCurrency(data.annualSavings)}`);
  doc.text(`Break-Even Year: ${data.breakEvenYear}`);
  doc.text(
    `Profit After ${data.yearlySavings.length} Years: ${formatCurrency(data.profitAfterYears)}`
  );

  doc.moveDown();

  doc.fontSize(14).text("Year-wise Savings", { underline: true });
  doc.moveDown(0.5);

  data.yearlySavings.forEach((y) => {
    doc.fontSize(11).text(`Year ${y.year}: ${formatCurrency(y.savings)}`);
  });

  doc.end();
};
