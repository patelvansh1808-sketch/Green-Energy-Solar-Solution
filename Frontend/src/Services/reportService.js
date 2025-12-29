import api from "./api";

const buildMonthParams = (monthValue) => {
  if (!monthValue) {
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
  }
  const selected = new Date(monthValue);
  return {
    month: selected.getMonth() + 1,
    year: selected.getFullYear(),
  };
};

const downloadBlob = async (url, filename) => {
  const res = await api.get(url, { responseType: "blob" });
  const blob = new Blob([res.data]);
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const downloadMonthlyEnergyPDF = async (monthValue) => {
  const { month, year } = buildMonthParams(monthValue);
  await downloadBlob(
    `/reports/energy/monthly/pdf?month=${month}&year=${year}`,
    `Monthly_Energy_${year}-${month}.pdf`
  );
};

export const downloadMonthlyEnergyExcel = async (monthValue) => {
  const { month, year } = buildMonthParams(monthValue);
  await downloadBlob(
    `/reports/energy/monthly/excel?month=${month}&year=${year}`,
    `Monthly_Energy_${year}-${month}.xlsx`
  );
};

export const downloadCostSavingsPDF = async (monthValue, rate) => {
  const { month, year } = buildMonthParams(monthValue);
  const tariff = Number(rate) || 8;
  await downloadBlob(
    `/reports/cost-savings/pdf?month=${month}&year=${year}&rate=${tariff}`,
    `Cost_Savings_${year}-${month}.pdf`
  );
};

export const downloadBookingInvoice = async (bookingId) => {
  if (!bookingId) throw new Error("Booking ID is required");
  await downloadBlob(
    `/reports/booking/invoice/${bookingId}`,
    `Booking_Invoice_${bookingId}.pdf`
  );
};
