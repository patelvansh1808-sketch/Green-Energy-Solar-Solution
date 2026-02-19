const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

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

exports.generateMaintenanceServiceReportPDF = (res, payload) => {
  const doc = new PDFDocument({ margin: 40 });

  const pageContentWidth =
    doc.page.width - doc.page.margins.left - doc.page.margins.right;

  const statusColors = {
    Completed: { bg: "#DCFCE7", text: "#166534" },
    "In Progress": { bg: "#FEF3C7", text: "#92400E" },
    Pending: { bg: "#E2E8F0", text: "#334155" },
  };

  const ensureSpace = (height = 80) => {
    if (doc.y + height > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
    }
  };

  const sectionTitle = (title) => {
    ensureSpace(36);
    doc.moveDown(0.6);
    const markerX = doc.page.margins.left;
    const markerY = doc.y + 2;
    doc
      .roundedRect(markerX, markerY, 4, 16, 2)
      .fillColor("#2563EB")
      .fill();

    doc
      .fontSize(14)
      .fillColor("#0F172A")
      .text(title, doc.page.margins.left + 10, doc.y)
      .moveDown(0.3)
      .fillColor("#000000");

    const y = doc.y;
    doc
      .moveTo(doc.page.margins.left, y)
      .lineTo(doc.page.width - doc.page.margins.right, y)
      .lineWidth(1)
      .strokeColor("#CBD5E1")
      .stroke()
      .strokeColor("#000000");
    doc.moveDown(0.5);
  };

  const drawKeyValueCard = (rows) => {
    const cardWidth = pageContentWidth;
    const rowHeight = 20;
    const cardHeight = rows.length * rowHeight + 16;
    ensureSpace(cardHeight + 20);

    const startX = doc.page.margins.left;
    const startY = doc.y;

    doc
      .roundedRect(startX, startY, cardWidth, cardHeight, 8)
      .lineWidth(1)
      .strokeColor("#E2E8F0")
      .stroke();

    doc
      .roundedRect(startX, startY, cardWidth, cardHeight, 8)
      .fillOpacity(0.08)
      .fill("#DBEAFE")
      .fillOpacity(1);

    doc
      .roundedRect(startX, startY, cardWidth, cardHeight, 8)
      .lineWidth(1)
      .strokeColor("#BFDBFE")
      .stroke();

    let y = startY + 10;
    rows.forEach(({ label, value }, index) => {
      if (index % 2 === 1) {
        doc
          .rect(startX + 8, y - 3, cardWidth - 16, rowHeight - 2)
          .fillOpacity(0.08)
          .fill("#FFFFFF")
          .fillOpacity(1);
      }

      doc
        .fontSize(10)
        .fillColor("#64748B")
        .text(label, startX + 12, y, { width: 130 });
      doc
        .fontSize(11)
        .fillColor("#0F172A")
        .text(value || "-", startX + 145, y, { width: cardWidth - 160 });
      y += rowHeight;
    });

    doc.fillColor("#000000");
    doc.y = startY + cardHeight + 8;
  };

  const resolveUploadImagePath = (imageUrl) => {
    if (!imageUrl || typeof imageUrl !== "string") return null;

    let candidate = imageUrl.trim();

    if (/^https?:\/\//i.test(candidate)) {
      try {
        const parsed = new URL(candidate);
        candidate = parsed.pathname;
      } catch (error) {
        return null;
      }
    }

    try {
      candidate = decodeURIComponent(candidate);
    } catch (error) {
      // Keep raw candidate if decode fails
    }

    candidate = candidate.replace(/\\/g, "/");

    const normalized = candidate.startsWith("/") ? candidate.slice(1) : candidate;

    const possiblePaths = [
      path.resolve(__dirname, "..", "..", normalized),
      path.resolve(__dirname, "..", "..", "uploads", path.basename(normalized)),
    ];

    for (const absolutePath of possiblePaths) {
      if (fs.existsSync(absolutePath)) {
        return absolutePath;
      }
    }

    return null;
  };

  const resolveCompanyLogoPath = () => {
    const candidatePaths = [
      path.resolve(__dirname, "..", "..", "..", "Frontend", "public", "favicon.png"),
      path.resolve(__dirname, "..", "..", "..", "frontend", "public", "favicon.png"),
      path.resolve(__dirname, "..", "..", "..", "Frontend", "public", "logo512.png"),
      path.resolve(__dirname, "..", "..", "..", "frontend", "public", "logo512.png"),
      path.resolve(__dirname, "..", "..", "..", "Frontend", "public", "logo192.png"),
      path.resolve(__dirname, "..", "..", "..", "frontend", "public", "logo192.png"),
    ];

    for (const logoPath of candidatePaths) {
      if (fs.existsSync(logoPath)) {
        return logoPath;
      }
    }

    return null;
  };

  const drawPhotoGrid = (title, photos = []) => {
    sectionTitle(`${title} (${photos.length})`);

    if (!photos.length) {
      doc.fontSize(11).fillColor("#64748B").text("No photos uploaded.").fillColor("#000000");
      return;
    }

    const boxGap = 16;
    const boxWidth = (doc.page.width - doc.page.margins.left - doc.page.margins.right - boxGap) / 2;
    const boxHeight = 220;
    let x = doc.page.margins.left;
    let y = doc.y;

    photos.forEach((photoUrl, index) => {
      if (index % 2 === 0 && index !== 0) {
        x = doc.page.margins.left;
        y += boxHeight + 16;
      } else if (index % 2 === 1) {
        x = doc.page.margins.left + boxWidth + boxGap;
      }

      if (y + boxHeight > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
        x = doc.page.margins.left;
        y = doc.page.margins.top;
      }

      doc
        .roundedRect(x, y, boxWidth, boxHeight, 8)
        .lineWidth(1)
        .strokeColor("#BFDBFE")
        .stroke();

      doc
        .roundedRect(x, y, boxWidth, boxHeight, 8)
        .fillOpacity(0.06)
        .fill("#EFF6FF")
        .fillOpacity(1);

      doc
        .roundedRect(x, y, boxWidth, boxHeight, 8)
        .lineWidth(1)
        .strokeColor("#BFDBFE")
        .stroke();

      doc
        .fontSize(10)
        .fillColor("#334155")
        .text(`${title} #${index + 1}`, x + 10, y + 8, { width: boxWidth - 20 });

      const imagePath = resolveUploadImagePath(photoUrl);

      if (imagePath) {
        try {
          doc.image(imagePath, x + 10, y + 28, {
            fit: [boxWidth - 20, boxHeight - 38],
            align: "center",
            valign: "center",
          });
        } catch (error) {
          doc
            .fontSize(9)
            .fillColor("#991B1B")
            .text("Unable to render image.", x + 10, y + 34, { width: boxWidth - 20 });
        }
      } else {
        doc
          .fontSize(9)
          .fillColor("#991B1B")
          .text("Image file not found on server.", x + 10, y + 34, { width: boxWidth - 20 });
        doc
          .fontSize(8)
          .fillColor("#64748B")
          .text(String(photoUrl || ""), x + 10, y + 52, { width: boxWidth - 20 });
      }

      doc.fillColor("#000000");
    });

    doc.y = y + boxHeight + 8;
  };

  setHeaders(res, `Maintenance_Service_Report_${payload.serviceId}.pdf`);
  doc.pipe(res);

  const headerY = doc.page.margins.top;
  doc
    .roundedRect(doc.page.margins.left, headerY, pageContentWidth, 88, 10)
    .fillColor("#1D4ED8")
    .fill();

  const logoPath = resolveCompanyLogoPath();
  const logoHolderSize = 56;
  const logoHolderX = doc.page.margins.left + 16;
  const logoHolderY = headerY + 16;

  doc
    .roundedRect(logoHolderX, logoHolderY, logoHolderSize, logoHolderSize, 12)
    .fillColor("#FFFFFF")
    .fill();

  if (logoPath) {
    try {
      doc.image(logoPath, logoHolderX + 4, logoHolderY + 4, {
        fit: [logoHolderSize - 8, logoHolderSize - 8],
        align: "center",
        valign: "center",
      });
    } catch (error) {
      doc
        .fontSize(8)
        .fillColor("#1D4ED8")
        .text("GES", logoHolderX, logoHolderY + 24, {
          width: logoHolderSize,
          align: "center",
        });
    }
  } else {
    doc
      .fontSize(8)
      .fillColor("#1D4ED8")
      .text("GES", logoHolderX, logoHolderY + 24, {
        width: logoHolderSize,
        align: "center",
      });
  }

  doc
    .fontSize(24)
    .fillColor("#FFFFFF")
    .text("Maintenance Service Report", logoHolderX + logoHolderSize + 14, headerY + 18, {
      width: pageContentWidth - (logoHolderSize + 38),
      align: "left",
    });

  doc
    .fontSize(10)
    .fillColor("#DBEAFE")
    .text(`Generated on: ${new Date().toLocaleString("en-IN")}`, logoHolderX + logoHolderSize + 16, headerY + 56);

  const statusMeta = statusColors[payload.status] || statusColors.Pending;
  const badgeWidth = 108;
  const badgeX = doc.page.margins.left + pageContentWidth - badgeWidth - 16;
  const badgeY = headerY + 22;
  doc
    .roundedRect(badgeX, badgeY, badgeWidth, 30, 16)
    .fillColor(statusMeta.bg)
    .fill();
  doc
    .fontSize(11)
    .fillColor(statusMeta.text)
    .text(payload.status || "Pending", badgeX, badgeY + 9, {
      width: badgeWidth,
      align: "center",
    });

  doc.y = headerY + 102;
  doc
    .fontSize(9)
    .fillColor("#64748B")
    .text("Generated by Green Energy Solar Solution", {
      align: "right",
    })
    .moveDown(0.2)
    .fillColor("#000000");

  sectionTitle("Service Details");
  drawKeyValueCard([
    { label: "Service ID", value: payload.serviceId },
    { label: "Customer", value: payload.customerName || "-" },
    { label: "Customer Email", value: payload.customerEmail || "-" },
    { label: "Service Date", value: payload.serviceDate || "-" },
    { label: "Service Type", value: payload.serviceType || "-" },
    { label: "Technician", value: payload.technicianName || "-" },
    { label: "Status", value: payload.status || "-" },
    { label: "Completion Time", value: payload.completionTime || "-" },
  ]);

  sectionTitle("Work Done");
  const textCard = (content) => {
    const cardX = doc.page.margins.left;
    const cardY = doc.y;
    const cardWidth = pageContentWidth;
    const cardHeight = 70;
    ensureSpace(cardHeight + 12);

    doc
      .roundedRect(cardX, cardY, cardWidth, cardHeight, 8)
      .fillOpacity(0.04)
      .fill("#F1F5F9")
      .fillOpacity(1);
    doc
      .roundedRect(cardX, cardY, cardWidth, cardHeight, 8)
      .lineWidth(1)
      .strokeColor("#CBD5E1")
      .stroke();

    doc
      .fontSize(11)
      .fillColor("#0F172A")
      .text(content || "-", cardX + 12, cardY + 12, {
        width: cardWidth - 24,
      })
      .fillColor("#000000");

    doc.y = cardY + cardHeight + 6;
  };

  textCard(payload.workDone);

  sectionTitle("Technician Notes");
  textCard(payload.technicianNotes);

  drawPhotoGrid("Before Photos", payload.beforePhotos || []);
  drawPhotoGrid("After Photos", payload.afterPhotos || []);

  if (payload.uploadedReportUrl) {
    doc.moveDown(1);
    doc
      .fontSize(10)
      .fillColor("#475569")
      .text(`Uploaded Report URL: ${payload.uploadedReportUrl}`);
    doc.fillColor("#000");
  }

  doc
    .fontSize(9)
    .fillColor("#94A3B8")
    .text("This document is system-generated and intended for internal maintenance records.", {
      align: "center",
    });

  doc.end();
};
