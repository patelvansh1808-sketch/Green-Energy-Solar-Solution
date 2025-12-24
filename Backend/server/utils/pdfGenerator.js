const PDFDocument = require("pdfkit");

exports.generateROIReport = (res, data) => {
  const doc = new PDFDocument({ margin: 40 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=ROI_Report.pdf"
  );

  doc.pipe(res);

  // TITLE
  doc
    .fontSize(20)
    .text("ROI & Break-Even Analysis Report", { align: "center" })
    .moveDown(2);

  // DETAILS
  doc.fontSize(12);
  doc.text(`Net Investment: ₹${data.netInvestment}`);
  doc.text(`Annual Savings: ₹${data.annualSavings}`);
  doc.text(`Break-Even Year: ${data.breakEvenYear}`);
  doc.text(
    `Profit After ${data.yearlySavings.length} Years: ₹${data.profitAfterYears}`
  );

  doc.moveDown();

  // TABLE HEADER
  doc.fontSize(14).text("Year-wise Savings", { underline: true });
  doc.moveDown(0.5);

  data.yearlySavings.forEach((y) => {
    doc.fontSize(11).text(`Year ${y.year}: ₹${y.savings}`);
  });

  doc.end();
};
