const Customer = require("../models/Customer");
const User = require("../models/User");

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
      userId,
      fullName,
      phone,
      address,
      city,
      state,
      district,
      discom,
      pincode,
      systemCapacityKW,
      installationDate,
    } = req.body;

    if (!userId || !fullName || !phone || !address || !systemCapacityKW) {
      return res.status(400).json({
        message: "Required fields missing",
        required: ["userId", "fullName", "phone", "address", "systemCapacityKW"],
      });
    }

    const existingCustomer = await Customer.findOne({ userId });
    if (existingCustomer) {
      return res.status(400).json({
        message: "Customer profile already exists for this user",
      });
    }

    const customer = await Customer.create({
      userId,
      fullName: fullName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city?.trim() || "",
      state: state?.trim() || "",
      district: district?.trim() || "",
      discom: discom?.trim() || "",
      pincode: pincode?.trim() || "",
      systemCapacityKW: Number(systemCapacityKW),
      installationDate,
      status: "Active",
      source: "admin",
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
    // Auto-sync online registered users into customer records if missing.
    const existingCustomerUserIds = await Customer.distinct("userId");
    const usersWithoutCustomer = await User.find({
      role: "user",
      _id: { $nin: existingCustomerUserIds },
    }).select("name phone address city state district discom pincode systemCapacityKW");

    const syncOps = usersWithoutCustomer
      .filter(
        (u) => u.name
      )
      .map((u) => ({
        updateOne: {
          filter: { userId: u._id },
          update: {
            $setOnInsert: {
              userId: u._id,
              fullName: String(u.name).trim(),
              phone: String(u.phone || "Not Provided").trim(),
              address: String(u.address || "Not Provided").trim(),
              city: String(u.city || "").trim(),
              state: String(u.state || "").trim(),
              district: String(u.district || "").trim(),
              discom: String(u.discom || "").trim(),
              pincode: String(u.pincode || "").trim(),
              systemCapacityKW: Number(u.systemCapacityKW || 0),
              status: "Active",
              source: "online",
            },
          },
          upsert: true,
        },
      }));

    if (syncOps.length > 0) {
      await Customer.bulkWrite(syncOps, { ordered: false });
    }

    const customers = await Customer.find()
      .populate("userId", "email role name connectionType")
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
      district,
      discom,
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
        district: district?.trim() || "",
        discom: discom?.trim() || "",
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
