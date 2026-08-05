const REQUIRED_FIELDS = {
  personalInfo: ["firstName", "lastName", "dateOfBirth", "gender"],
  contactInfo: ["address", "city", "state", "zipCode"],
  financialInfo: ["annualIncome", "landValue", "electricityBill", "mobileMoneyBalance"],
};

const isFilled = (value) => value !== undefined && value !== null && value !== "";

const hasAllFields = (obj = {}, fields) => fields.every((field) => isFilled(obj[field]));

function validateProfile(personalInfo, contactInfo, financialInfo) {
  return (
    hasAllFields(personalInfo, REQUIRED_FIELDS.personalInfo) &&
    hasAllFields(contactInfo, REQUIRED_FIELDS.contactInfo) &&
    hasAllFields(financialInfo, REQUIRED_FIELDS.financialInfo)
  );
}

module.exports = validateProfile;