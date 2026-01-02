const User = require("../models/User");
const Customer = require("../models/Customer");

/**
 * ADMIN: Create customer account (User + Customer)
 * POST /api/admin/create-customer
 */
exports.createCustomerAccount = async (req, res) => {
  try {
    const {
      email,
      password,
      fullName,
      phone,
      address,
      city,
      state,
      pincode,
      systemCapacityKW,
    } = req.body;

    // Validation
    if (!email || !password || !fullName || !phone || !address || !systemCapacityKW) {
      return res.status(400).json({
        message: "Required fields missing",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email",
      });
    }

    // 1️⃣ Create User
    const user = await User.create({
      email,
      password,
      role: "user",
    });

    // 2️⃣ Create Customer
    const customer = await Customer.create({
      userId: user._id,
      fullName,
      phone,
      address,
      city,
      state,
      pincode,
      systemCapacityKW,
      status: "Active",
    });

    res.status(201).json({
      message: "Customer account created successfully",
      user: {
        id: user._id,
        email: user.email,
      },
      customer,
    });
  } catch (error) {
    console.error("ADMIN CREATE CUSTOMER ERROR:", error);
    res.status(500).json({
      message: "Failed to create customer account",
    });
  }
};
