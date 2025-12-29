const ExcelJS = require("exceljs");

const setHeaders = (res, filename) => {
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${filename}`
  );
};

exports.exportExcel = async (data, res) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Energy Report");

  worksheet.columns = [
    { header: "Date", key: "date", width: 20 },
    { header: "Units Generated", key: "unitsGenerated", width: 20 },
  ];

  data.forEach((item) => worksheet.addRow(item));

  setHeaders(res, "energy_report.xlsx");
  await workbook.xlsx.write(res);
  res.end();
};

exports.exportMonthlyEnergyExcel = async (payload, res) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Monthly Energy");

  worksheet.columns = [
    { header: "Date", key: "date", width: 18 },
    { header: "Units Generated (kWh)", key: "units", width: 24 },
  ];

  payload.daily.forEach((item) => worksheet.addRow({
    date: item.date,
    units: item.units,
  }));

  worksheet.addRow({});
  worksheet.addRow({ date: "Month", units: payload.monthLabel });
  if (payload.note) {
    worksheet.addRow({ date: "Note", units: payload.note });
  }

  setHeaders(res, `monthly_energy_${payload.monthLabel.replace(/\s+/g, "_")}.xlsx`);
  await workbook.xlsx.write(res);
  res.end();
};
