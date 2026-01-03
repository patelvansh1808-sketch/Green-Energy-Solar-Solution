const Customer = require("../models/Customer");

/**
 * ================================
 * CREATE CUSTOMER
 * POST /api/customers
 * Admin creates customer OR user creates own profile
 * ================================
 */
exports.createCustomer = async (req, res) => {
  try {
    const {
      userId, // optional (admin)
      fullName,
      phone,
      address,
      city,
      state,
      pincode,
      systemCapacityKW,
      installationDate,
    } = req.body;

    const finalUserId = userId || req.user.id;

    // 🔴 Validation
    if (!fullName || !phone || !address || !systemCapacityKW) {
      return res.status(400).json({
        message: "Required fields missing",
        required: ["fullName", "phone", "address", "systemCapacityKW"],
      });
    }

    // ❌ Prevent duplicate profile per user
    const existingCustomer = await Customer.findOne({ userId: finalUserId });
    if (existingCustomer) {
      return res.status(400).json({
        message: "Customer profile already exists for this user",
      });
    }

    const customer = await Customer.create({
      userId: finalUserId,
      fullName,
      phone,
      address,
      city,
      state,
      pincode,
      systemCapacityKW: Number(systemCapacityKW),
      installationDate,
      status: "Active",
    });

    return res.status(201).json({
      message: "Customer created successfully",
      customer,
    });
  } catch (error) {
    console.error("CREATE CUSTOMER ERROR:", error);
    res.status(500).json({
      message: "Failed to create customer",
      error: error.message,
    });
  }
};

/**
 * ================================
 * GET LOGGED-IN CUSTOMER PROFILE
 * GET /api/customers/me
 * ================================
 */
exports.getMyCustomerProfile = async (req, res) => {
  try {
    const customer = await Customer.findOne({ userId: req.user.id });

    if (!customer) {
      return res.status(404).json({
        message: "Customer profile not found",
      });
    }

    res.json(customer);
  } catch (error) {
    console.error("FETCH CUSTOMER ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch customer",
    });
  }
};

/**
 * ================================
 * ADMIN: GET ALL CUSTOMERS
 * GET /api/customers
 * ================================
 */
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find()
      .populate("userId", "email role")
      .sort({ createdAt: -1 });

    res.json(customers);
  } catch (error) {
    console.error("FETCH CUSTOMERS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch customers",
    });
  }
};

/**
 * ================================
 * ADMIN: GET SINGLE CUSTOMER
 * GET /api/customers/:id
 * ================================
 */
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate("userId", "email name");

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.json(customer);
  } catch (error) {
    console.error("FETCH CUSTOMER ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch customer",
    });
  }
};

/**
 * ================================
 * ADMIN: UPDATE CUSTOMER DETAILS (EDIT)
 * PUT /api/customers/:id
 * PATCH /api/customers/:id
 * ================================
 */
exports.updateCustomer = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      address,
      city,
      state,
      pincode,
      systemCapacityKW,
      installationDate,
    } = req.body;

    // Validation
    if (!fullName || !phone || !address || !systemCapacityKW) {
      return res.status(400).json({
        message: "Required fields missing",
        required: ["fullName", "phone", "address", "systemCapacityKW"],
      });
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city?.trim() || "",
        state: state?.trim() || "",
        pincode: pincode?.trim() || "",
        systemCapacityKW: Number(systemCapacityKW),
        installationDate,
      },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.json({
      message: "Customer updated successfully",
      customer,
    });
  } catch (error) {
    console.error("UPDATE CUSTOMER ERROR:", error);
    res.status(500).json({
      message: "Failed to update customer",
      error: error.message,
    });
  }
};

/**
 * ================================
 * ADMIN: UPDATE CUSTOMER STATUS
 * PATCH /api/customers/:id/status
 * ================================
 */
exports.updateCustomerStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Active", "Inactive"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.json({
      message: "Customer status updated",
      customer,
    });
  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);
    res.status(500).json({
      message: "Failed to update status",
    });
  }
};
