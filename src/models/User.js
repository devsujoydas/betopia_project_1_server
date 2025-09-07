const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["user", "lender"], default: "user" },

    personalInfo: {
      firstName: { type: String, trim: true, default: "" },
      lastName: { type: String, trim: true, default: "" },
      dateOfBirth: { type: Date, default: null },
      gender: { type: String, enum: ["male", "female", "other", ""], default: "" },
    },

    contactInfo: {
      address: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      zipCode: { type: String, default: "" },
    },

    financialInfo: {
      creditScore: { type: Number, default: 0 },
      annualIncome: { type: Number, default: 0 },
      landValue: { type: Number, default: 0 },
      electricityBill: { type: Number, default: 0 },
      mobileMoneyBalance: { type: Number, default: 0 },
      dataSharingConsent: { type: Boolean, default: false },
      existingLoans: { type: Boolean, default: false },
      amountRequested: { type: Number, default: 0 },
      loanStatus: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending", },
    },


    profileCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
