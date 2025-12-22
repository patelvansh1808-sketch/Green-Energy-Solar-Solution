exports.calculateROI = (capacityKW, cost, unitsPerDay) => {
  const annualUnits = unitsPerDay * 365;
  const unitPrice = 6; // ₹ per unit (average India)
  const annualSavings = annualUnits * unitPrice;

  const paybackYears = cost / annualSavings;

  return {
    annualUnits,
    annualSavings,
    paybackYears: paybackYears.toFixed(2),
  };
};
