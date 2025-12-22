const ExcelJS = require("exceljs");

exports.exportExcel = async (data, res) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Energy Report");

  worksheet.columns = [
    { header: "Date", key: "date", width: 20 },
    { header: "Units Generated", key: "unitsGenerated", width: 20 },
  ];

  data.forEach((item) => worksheet.addRow(item));

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=energy_report.xlsx"
  );

  await workbook.xlsx.write(res);
  res.end();
};
