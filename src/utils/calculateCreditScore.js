function calculateCreditScore({
  annualIncome = 0,
  landValue = 0,
  mobileMoneyBalance = 0,
  electricityBill = 0,
}) {
  const balance =
    Number(annualIncome) + Number(landValue) - Number(mobileMoneyBalance) - Number(electricityBill);

  const scaleToRange = (minBal, maxBal, minScore, maxScore, value) => {
    if (value <= minBal) return minScore;
    if (value >= maxBal) return maxScore;
    return minScore + ((value - minBal) / (maxBal - minBal)) * (maxScore - minScore);
  };

  let score = 0;

  if (balance <= 0) score = 0;
  else if (balance <= 39999) score = scaleToRange(0, 39999, 0, 39, balance);
  else if (balance <= 59999) score = scaleToRange(40000, 59999, 40, 59, balance);
  else if (balance <= 99999) score = scaleToRange(60000, 99999, 60, 79, balance);
  else if (balance <= 199999) score = scaleToRange(100000, 199999, 80, 99, balance);
  else score = 100; 

  return Math.round(score);
}

module.exports = calculateCreditScore;