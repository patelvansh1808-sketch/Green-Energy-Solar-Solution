export const calculateSubsidy = (capacityKW, cost) => {
  let subsidyPercent = 0;

  if (capacityKW <= 3) subsidyPercent = 40;
  else if (capacityKW <= 10) subsidyPercent = 20;

  const subsidyAmount = (cost * subsidyPercent) / 100;
  const finalCost = cost - subsidyAmount;

  return {
    subsidyPercent,
    subsidyAmount,
    finalCost
  };
};

export const calculateROI = (finalCost, annualSaving) => {
  return (finalCost / annualSaving).toFixed(1);
};
