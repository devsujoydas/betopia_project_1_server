function checkFields(obj, fields) {
  return fields.every((field) => Boolean(obj[field]));
}

function validateProfile(personalInfo = {}, contactInfo = {}, financialInfo = {}) {
  const required = {
    personalInfo: ["firstName", "lastName", "dateOfBirth", "gender"],
    contactInfo: ["address", "city", "state", "zipCode"],
    financialInfo: ["annualIncome", "landValue", "electricityBill", "mobileMoneyBalance"],
  };

  return (
    checkFields(personalInfo, required.personalInfo) &&
    checkFields(contactInfo, required.contactInfo) &&
    checkFields(financialInfo, required.financialInfo)
  );
}

module.exports = validateProfile;
