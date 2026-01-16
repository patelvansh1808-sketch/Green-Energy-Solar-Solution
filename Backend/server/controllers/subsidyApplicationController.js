const SubsidyApplication = require("../models/SubsidyApplication");
const Customer = require("../models/Customer");

// Get customer's subsidy application
exports.getMyApplication = async (req, res) => {
  try {
    const customer = await Customer.findOne({ userId: req.user.id });
    if (!customer) {
      return res.status(404).json({ message: "Customer profile not found" });
    }

    const application = await SubsidyApplication.findOne({ customerId: customer._id });
    if (!application) {
      return res.status(404).json({ message: "No subsidy application found" });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create subsidy application
exports.createApplication = async (req, res) => {
  try {
    // Debug log
    console.log("📝 Subsidy Application Request:");
    console.log("Body:", req.body);
    console.log("Files:", req.files ? req.files.length : "No files");

    const customer = await Customer.findOne({ userId: req.user.id });
    if (!customer) {
      return res.status(404).json({ message: "Customer profile not found" });
    }

    // Check if already applied
    const existing = await SubsidyApplication.findOne({ customerId: customer._id });
    if (existing) {
      return res.status(400).json({ message: "Application already exists" });
    }

    // Extract bank details robustly (supports JSON string, nested object, or bracket fields)
    let bankDetails = req.body.bankDetails;

    // If string, attempt JSON parse
    if (typeof bankDetails === "string") {
      try {
        bankDetails = JSON.parse(bankDetails);
      } catch (e) {
        console.log("❌ Failed to parse bankDetails string:", e.message);
      }
    }

    // If object with null prototype, normalize
    if (bankDetails && typeof bankDetails === "object" && !Array.isArray(bankDetails)) {
      bankDetails = {
        accountHolder: bankDetails.accountHolder,
        accountNumber: bankDetails.accountNumber,
        ifscCode: bankDetails.ifscCode,
        bankName: bankDetails.bankName,
      };
    }

    // Fallback: bracket-style fields
    if (!bankDetails || !bankDetails.accountHolder) {
      bankDetails = {
        accountHolder: req.body["bankDetails[accountHolder]"],
        accountNumber: req.body["bankDetails[accountNumber]"],
        ifscCode: req.body["bankDetails[ifscCode]"],
        bankName: req.body["bankDetails[bankName]"],
      };
    }

    console.log("💳 Bank Details Received:", bankDetails);

    const remarks = req.body.remarks || "";

    // Validate bank details
    if (!bankDetails || !bankDetails.accountHolder || !bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.bankName) {
      console.log("❌ Missing bank details. Received:", bankDetails);
      return res.status(400).json({ message: "All bank details fields are required" });
    }

    // Handle document uploads
    const documents = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        documents.push({
          filename: file.filename,
          path: file.path.replace(/\\/g, "/"), // Normalize path to use forward slashes
          mimetype: file.mimetype,
        });
      });
    }

    // Validate at least some documents were uploaded
    if (documents.length === 0) {
      return res.status(400).json({ message: "Please upload all required documents" });
    }

    const application = new SubsidyApplication({
      customerId: customer._id,
      status: "Applied",
      appliedDate: new Date(),
      bankDetails: bankDetails,
      documents,
      remarks: remarks,
    });

    await application.save();
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get all applications
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await SubsidyApplication.find()
      .populate("customerId", "fullName email phone state district")
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Update application status and details
exports.updateApplication = async (req, res) => {
  try {
    const { status, approvedAmount, creditDate, remarks, bankDetails } = req.body;

    const application = await SubsidyApplication.findByIdAndUpdate(
      req.params.id,
      {
        status,
        approvedAmount,
        creditDate,
        remarks,
        bankDetails,
        reviewedDate: status === "Under Review" ? new Date() : undefined,
        approvalDate: status === "Approved" ? new Date() : undefined,
      },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get application by ID (admin)
exports.getApplicationById = async (req, res) => {
  try {
    const application = await SubsidyApplication.findById(req.params.id).populate(
      "customerId",
      "fullName email phone address city state district systemCapacityKW"
    );

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
