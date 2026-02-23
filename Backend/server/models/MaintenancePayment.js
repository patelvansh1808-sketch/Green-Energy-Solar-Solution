const mongoose = require("mongoose");

const maintenancePaymentSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		planType: {
			type: String,
			enum: ["1 Month", "6 Months", "1 Year", "Lifetime"],
			required: true,
		},
		amount: {
			type: Number,
			required: true,
		},
		currency: {
			type: String,
			default: "INR",
		},
		receipt: {
			type: String,
			required: true,
			unique: true,
		},
		razorpayOrderId: {
			type: String,
			required: true,
			unique: true,
		},
		razorpayPaymentId: {
			type: String,
			default: "",
		},
		razorpaySignature: {
			type: String,
			default: "",
		},
		paymentStatus: {
			type: String,
			enum: ["created", "paid", "failed"],
			default: "created",
		},
		planId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "MaintenancePlan",
			default: null,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("MaintenancePayment", maintenancePaymentSchema);
