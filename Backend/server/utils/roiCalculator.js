exports.calculateROI = ({
  installationCost,
  subsidy,
  annualEnergy,
  electricityRate,
  years = 25,
}) => {
  const netInvestment = installationCost - subsidy;
  const annualSavings = annualEnergy * electricityRate;

  if (annualSavings <= 0) {
    throw new Error("Annual savings must be greater than zero");
  }

  const breakEvenYear = Math.ceil(netInvestment / annualSavings);

  const yearlySavings = [];
  const cumulativeSavings = [];

  for (let year = 1; year <= years; year++) {
    const savings = annualSavings * year;
    yearlySavings.push({ year, savings });
    cumulativeSavings.push(savings);
  }

  const profitAfterYears = annualSavings * years - netInvestment;

  return {
    netInvestment,
    annualSavings,
    breakEvenYear,
    profitAfterYears,
    yearlySavings,
    cumulativeSavings,
  };
};
