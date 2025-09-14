const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["user", "lender"], default: "user" },
    profileCompleted: { type: Boolean, default: false },

    passwordReset: {
      otp: { type: String },
      otpExpires: { type: Date },
      token: { type: String },
      tokenExpires: { type: Date },
    },

    personalInfo: {
      firstName: { type: String, trim: true, default: "" },
      lastName: { type: String, trim: true, default: "" },
      dateOfBirth: { type: String, default: "" },
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
    },

    loanInfo: {
      existingLoans: { type: Boolean, default: false },
      amountRequested: { type: Number, default: 0 },
      loanStatus: { type: String, enum: ["none", "pending", "approved", "rejected"], default: "none" },
      approvedDetails: {
        loanAmount: { type: Number, default: 0 },
        interestRate: { type: Number, default: 0 },
        terms: { type: Number, default: 0 },
        note: { type: String, default: "" },
      },
      rejectionDetails: {
        note: { type: String, default: "" },
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
