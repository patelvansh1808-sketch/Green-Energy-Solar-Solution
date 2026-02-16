const mongoose = require("mongoose");

const subsidyApplicationSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    status: {
      type: String,
      enum: ["Applied", "Under Review", "Approved", "Rejected"],
      default: "Applied",
    },
    appliedAmount: {
      type: Number,
      default: 0,
    },
    approvedAmount: {
      type: Number,
      default: null,
    },
    creditDate: {
      type: Date,
      default: null,
    },
    documents: [
      {
        filename: String,
        path: String,
        mimetype: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    bankDetails: {
      accountHolder: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      branchName: String,
      accountType: String,
    },
    remarks: String,
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    reviewedDate: Date,
    approvalDate: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("SubsidyApplication", subsidyApplicationSchema);
