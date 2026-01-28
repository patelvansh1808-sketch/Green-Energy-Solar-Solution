const mongoose = require("mongoose");
const Project = require("../models/Project");
const User = require("../models/User");

/* =====================================================
   GET ALL PROJECTS WITH FILTERING
   GET /api/projects
===================================================== */
exports.getAllProjects = async (req, res) => {
  try {
    const { status, engineerId, projectManagerId, search, customerId, priority } = req.query;
    let query = {};

    if (status) query.status = status;
    if (engineerId) query["engineerAssignment.engineerId"] = new mongoose.Types.ObjectId(engineerId);
    if (projectManagerId) query.projectManager = new mongoose.Types.ObjectId(projectManagerId);
    if (customerId) query.customerId = new mongoose.Types.ObjectId(customerId);
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { projectName: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
        { customerEmail: { $regex: search, $options: "i" } },
        { "location.city": { $regex: search, $options: "i" } },
      ];
    }

    const projects = await Project.find(query)
      .populate("customerId", "name email phone")
      .populate("engineerAssignment.engineerId", "firstName lastName email")
      .populate("projectManager", "firstName lastName email")
      .populate("survey.surveyedBy", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error("GET PROJECTS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch projects", error: error.message });
  }
};

/* =====================================================
   GET PROJECT BY ID
   GET /api/projects/:id
===================================================== */
exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id)
      .populate("customerId")
      .populate("engineerAssignment.engineerId", "firstName lastName email phone")
      .populate("projectManager", "firstName lastName email")
      .populate("survey.surveyedBy", "firstName lastName email")
      .populate("installation.workersAssigned.workerId", "firstName lastName email");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    console.error("GET PROJECT ERROR:", error);
    res.status(500).json({ message: "Failed to fetch project", error: error.message });
  }
};

/* =====================================================
   CREATE NEW PROJECT
   POST /api/projects
===================================================== */
exports.createProject = async (req, res) => {
  try {
    const {
      projectName,
      description,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      location,
      systemCapacity,
      panelCount,
      inverterModel,
      batteryCapacity,
      budget,
      targetCompletionDate,
      projectManager,
      priority,
      tags,
    } = req.body;

    const newProject = new Project({
      projectName,
      description,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      location,
      systemCapacity,
      panelCount,
      inverterModel,
      batteryCapacity,
      budget,
      timeline: {
        targetCompletionDate,
      },
      projectManager,
      priority,
      tags,
      status: "survey",
      survey: {
        status: "pending",
      },
    });

    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    console.error("CREATE PROJECT ERROR:", error);
    res.status(500).json({ message: "Failed to create project", error: error.message });
  }
};

/* =====================================================
   UPDATE SITE SURVEY
   PATCH /api/projects/:id/survey
===================================================== */
exports.updateSiteSurvey = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, surveyDate, roofCondition, sunExposure, obstructions, estimatedROI, estimatedMonthlyGeneration, notes, attachments } = req.body;

    // Get engineer details
    const engineer = await User.findById(req.user.id);
    const engineerName = engineer ? `${engineer.firstName} ${engineer.lastName}` : "Engineer";

    const updateFields = {
      "survey.status": status || "completed",
      "survey.surveyedBy": req.user.id,
      "survey.surveyorName": engineerName,
    };

    if (surveyDate) updateFields["survey.surveyDate"] = surveyDate;
    if (roofCondition) updateFields["survey.roofCondition"] = roofCondition;
    if (sunExposure) updateFields["survey.sunExposure"] = sunExposure;
    if (obstructions) updateFields["survey.obstructions"] = obstructions;
    if (estimatedROI) updateFields["survey.estimatedROI"] = estimatedROI;
    if (estimatedMonthlyGeneration) updateFields["survey.estimatedMonthlyGeneration"] = estimatedMonthlyGeneration;
    if (notes) updateFields["survey.notes"] = notes;
    if (attachments) updateFields["survey.attachments"] = attachments;
    
    // Update project status if survey is completed
    if (status === "completed") {
      updateFields.status = "installation";
    }

    const project = await Project.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    console.error("UPDATE SURVEY ERROR:", error);
    res.status(500).json({ message: "Failed to update survey", error: error.message });
  }
};

/* =====================================================
   ASSIGN ENGINEER
   PATCH /api/projects/:id/assign-engineer
===================================================== */
exports.assignEngineer = async (req, res) => {
  try {
    const { id } = req.params;
    const { engineerId } = req.body;

    const engineer = await User.findById(engineerId);
    if (!engineer || engineer.role !== "engineer") {
      return res.status(400).json({ message: "Invalid engineer selection" });
    }

    const project = await Project.findByIdAndUpdate(
      id,
      {
        $set: {
          "engineerAssignment.engineerId": engineerId,
          "engineerAssignment.engineerName": `${engineer.firstName} ${engineer.lastName}`,
          "engineerAssignment.engineerEmail": engineer.email,
          "engineerAssignment.assignedDate": new Date(),
          "engineerAssignment.status": "assigned",
          status: "engineer_assigned",
        },
      },
      { new: true }
    ).populate("engineerAssignment.engineerId");

    res.json(project);
  } catch (error) {
    console.error("ASSIGN ENGINEER ERROR:", error);
    res.status(500).json({ message: "Failed to assign engineer", error: error.message });
  }
};

/* =====================================================
   UPDATE INSTALLATION
   PATCH /api/projects/:id/installation
===================================================== */
exports.updateInstallation = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, startDate, plannedCompletionDate, actualCompletionDate, progress, activities, challenges, safetyIncidents, workersAssigned, notes } = req.body;

    const updateFields = {
      "installation.status": status || "in_progress",
    };

    if (startDate) updateFields["installation.startDate"] = startDate;
    if (plannedCompletionDate) updateFields["installation.plannedCompletionDate"] = plannedCompletionDate;
    if (actualCompletionDate) updateFields["installation.actualCompletionDate"] = actualCompletionDate;
    if (progress !== undefined) updateFields["installation.progress"] = progress;
    if (activities) updateFields["installation.activities"] = activities;
    if (challenges) updateFields["installation.challenges"] = challenges;
    if (safetyIncidents) updateFields["installation.safetyIncidents"] = safetyIncidents;
    if (workersAssigned) updateFields["installation.workersAssigned"] = workersAssigned;
    if (notes) updateFields["installation.notes"] = notes;
    
    // Update project status based on installation status
    if (status === "completed") {
      updateFields.status = "testing";
    } else if (status === "in_progress") {
      updateFields.status = "installation";
    } else if (status === "on_hold") {
      updateFields.status = "on_hold";
    }

    const project = await Project.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.json(project);
  } catch (error) {
    console.error("UPDATE INSTALLATION ERROR:", error);
    res.status(500).json({ message: "Failed to update installation", error: error.message });
  }
};

/* =====================================================
   UPDATE TESTING & COMMISSIONING
   PATCH /api/projects/:id/testing
===================================================== */
exports.updateTesting = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, testStartDate, testResults, issues, certifications, testPassed, notes } = req.body;

    const updateFields = {
      "testing.status": status || (testPassed ? "passed" : "in_progress"),
    };

    if (testStartDate) updateFields["testing.testStartDate"] = testStartDate;
    if (testResults) updateFields["testing.testResults"] = testResults;
    if (issues) updateFields["testing.issues"] = issues;
    if (certifications) updateFields["testing.certifications"] = certifications;
    if (notes) updateFields["testing.notes"] = notes;
    
    // Update project status based on testing status
    if (status === "passed" || testPassed) {
      updateFields.status = "go_live";
    } else if (status === "in_progress") {
      updateFields.status = "testing";
    } else if (status === "failed") {
      updateFields.status = "on_hold";
    }

    const project = await Project.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.json(project);
  } catch (error) {
    console.error("UPDATE TESTING ERROR:", error);
    res.status(500).json({ message: "Failed to update testing", error: error.message });
  }
};

/* =====================================================
   GO-LIVE CONFIRMATION
   PATCH /api/projects/:id/go-live
===================================================== */
exports.goLiveConfirmation = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledDate, meterReading, gridConnectionRef, netMeteringStatus, documentationComplete, customerTrainingDate, trainingTopics } = req.body;

    const project = await Project.findByIdAndUpdate(
      id,
      {
        $set: {
          "goLive.status": "live",
          "goLive.scheduledDate": scheduledDate,
          "goLive.actualGoLiveDate": new Date(),
          "goLive.meterReading": meterReading,
          "goLive.gridConnectionRef": gridConnectionRef,
          "goLive.netMeteringStatus": netMeteringStatus,
          "goLive.documentationComplete": documentationComplete,
          "goLive.customerTrainingDate": customerTrainingDate,
          "goLive.trainingTopics": trainingTopics,
          status: "go_live",
          "timeline.actualCompletionDate": new Date(),
        },
      },
      { new: true, runValidators: true }
    );

    res.json(project);
  } catch (error) {
    console.error("GO-LIVE ERROR:", error);
    res.status(500).json({ message: "Failed to confirm go-live", error: error.message });
  }
};

/* =====================================================
   MARK PROJECT AS COMPLETED
   PATCH /api/projects/:id/complete
===================================================== */
exports.completeProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const project = await Project.findByIdAndUpdate(
      id,
      {
        $set: {
          status: "completed",
          "timeline.actualCompletionDate": new Date(),
        },
        $push: {
          notes: {
            author: `${req.user.firstName} ${req.user.lastName}`,
            content: notes || "Project completed",
          },
        },
      },
      { new: true }
    );

    res.json(project);
  } catch (error) {
    console.error("COMPLETE PROJECT ERROR:", error);
    res.status(500).json({ message: "Failed to complete project", error: error.message });
  }
};

/* =====================================================
   UPDATE PROJECT STATUS
   PATCH /api/projects/:id/status
===================================================== */
exports.updateProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["survey", "engineer_assigned", "installation", "testing", "go_live", "completed", "on_hold", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const project = await Project.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );

    res.json(project);
  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);
    res.status(500).json({ message: "Failed to update status", error: error.message });
  }
};

/* =====================================================
   ADD NOTE TO PROJECT
   POST /api/projects/:id/notes
===================================================== */
exports.addNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const project = await Project.findByIdAndUpdate(
      id,
      {
        $push: {
          notes: {
            author: `${req.user.firstName} ${req.user.lastName}`,
            content,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    res.json(project);
  } catch (error) {
    console.error("ADD NOTE ERROR:", error);
    res.status(500).json({ message: "Failed to add note", error: error.message });
  }
};

/* =====================================================
   GET PROJECT STATISTICS
   GET /api/projects/stats/overview
===================================================== */
exports.getProjectStats = async (req, res) => {
  try {
    const total = await Project.countDocuments();
    const byStatus = await Project.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const byPriority = await Project.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    res.json({
      total,
      byStatus,
      byPriority,
    });
  } catch (error) {
    console.error("GET STATS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch statistics", error: error.message });
  }
};

/* =====================================================
   DELETE PROJECT
   DELETE /api/projects/:id
===================================================== */
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findByIdAndDelete(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("DELETE PROJECT ERROR:", error);
    res.status(500).json({ message: "Failed to delete project", error: error.message });
  }
};

/* =====================================================
   GET AVAILABLE BOOKINGS FOR PROJECT CREATION
   GET /api/projects/bookings/available
===================================================== */
exports.getAvailableBookings = async (req, res) => {
  try {
    const Booking = require("../models/Booking");
    
    // Build filter query
    const filter = {};
    
    // Date filtering
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        const endDate = new Date(req.query.endDate);
        endDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDate;
      }
    }
    
    // Get bookings that don't have a project yet and populate customer data
    const bookings = await Booking.find(filter)
      .populate('customer', 'name email phone')
      .populate('user', 'name email')
      .select("_id capacity installationAddress paymentStatus customer user createdAt")
      .sort({ createdAt: -1 })
      .limit(50);

    // Transform data to match frontend expectations
    const transformedBookings = bookings.map(booking => ({
      _id: booking._id,
      customerName: booking.customer?.name || booking.user?.name || "Unknown",
      customerEmail: booking.customer?.email || booking.user?.email || "N/A",
      customerPhone: booking.customer?.phone || "N/A",
      systemCapacity: booking.capacity,
      location: booking.installationAddress,
      paymentStatus: booking.paymentStatus,
      createdAt: booking.createdAt
    }));

    res.json(transformedBookings);
  } catch (error) {
    console.error("GET BOOKINGS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch bookings", error: error.message });
  }
};

/* =====================================================
   CREATE PROJECT FROM BOOKING
   POST /api/projects/from-booking/:bookingId
===================================================== */
exports.createProjectFromBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { projectName, priority, notes } = req.body;
    
    const Booking = require("../models/Booking");
    const booking = await Booking.findById(bookingId)
      .populate('customer', 'name email phone')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Extract data from booking (with fallbacks)
    const customerName = booking.customer?.name || booking.user?.name || "Customer";
    const customerEmail = booking.customer?.email || booking.user?.email || "no-email@example.com";
    const customerPhone = booking.customer?.phone || booking.user?.phone || booking.phone || "";
    const customerId = booking.customer?._id || booking.user?._id || null;
    const systemCapacity = booking.capacity || 0;
    const location = booking.installationAddress || {};

    // Generate project name if not provided
    const generatedProjectName = projectName || `${customerName} - ${systemCapacity}kW Solar`;

    // Create project with booking data
    const newProject = new Project({
      bookingId,
      projectName: generatedProjectName,
      description: `Created from Booking ${bookingId}${notes ? ". " + notes : ""}`,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      location,
      systemCapacity,
      priority: priority || "normal",
      status: "survey",
      survey: {
        status: "pending",
      },
    });

    await newProject.save();

    // Optionally update booking to mark project created
    await Booking.findByIdAndUpdate(bookingId, { projectCreated: true });

    res.status(201).json({
      message: "Project created from booking successfully!",
      project: newProject,
    });
  } catch (error) {
    console.error("CREATE FROM BOOKING ERROR:", error);
    res.status(500).json({ message: "Failed to create project from booking", error: error.message });
  }
};

/* =====================================================
   GET BOOKING DETAILS
   GET /api/projects/booking/:bookingId
===================================================== */
exports.getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const Booking = require("../models/Booking");

    const booking = await Booking.findById(bookingId)
      .populate('customer', 'name email phone')
      .populate('user', 'name email');
      
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Transform to match frontend expectations
    const transformedBooking = {
      _id: booking._id,
      customerName: booking.customer?.name || booking.user?.name || "Unknown",
      customerEmail: booking.customer?.email || booking.user?.email || "N/A",
      customerPhone: booking.customer?.phone || "N/A",
      systemCapacity: booking.capacity,
      location: booking.installationAddress,
      paymentStatus: booking.paymentStatus
    };

    res.json(transformedBooking);
  } catch (error) {
    console.error("GET BOOKING ERROR:", error);
    res.status(500).json({ message: "Failed to fetch booking", error: error.message });
  }
};
