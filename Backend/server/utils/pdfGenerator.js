const PDFDocument = require("pdfkit");

exports.generatePDF = (reportData, res) => {
  const doc = new PDFDocument();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=solar_report.pdf");

  doc.pipe(res);

  doc.fontSize(18).text("Smart Solar Energy Report", { align: "center" });
  doc.moveDown();

  reportData.forEach((item) => {
    doc
      .fontSize(12)
      .text(`Date: ${item.date}`)
      .text(`Units Generated: ${item.unitsGenerated}`)
      .moveDown();
  });

  doc.end();
};
