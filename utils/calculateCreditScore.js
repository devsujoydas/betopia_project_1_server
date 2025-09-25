function calculateCreditScore({ annualIncome = 0, landValue = 0, mobileMoneyBalance = 0, electricityBill = 0 }) {
  const balance = Number(annualIncome) + Number(landValue) - Number(mobileMoneyBalance) - Number(electricityBill);

  const calc = (minBal, maxBal, minScore, maxScore, value) => {
    if (value <= minBal) return minScore;
    if (value >= maxBal) return maxScore;
    return minScore + ((value - minBal) / (maxBal - minBal)) * (maxScore - minScore);
  };

  let score = 0;

  if (balance >= 0 && balance <= 39999) score = calc(0, 39999, 0, 39, balance);
  else if (balance >= 40000 && balance <= 59999) score = calc(40000, 59999, 40, 59, balance);
  else if (balance >= 60000 && balance <= 99999) score = calc(60000, 99999, 60, 79, balance);
  else if (balance >= 100000) score = 100;

  return Math.round(score); 
}

module.exports = calculateCreditScore;
