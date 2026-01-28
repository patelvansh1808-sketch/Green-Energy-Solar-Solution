const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    // Link to Booking (if created from booking)
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },

    // Project Details
    projectName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      trim: true,
    },
    customerPhone: {
      type: String,
      trim: true,
    },

    // Location Details
    location: {
      address: String,
      city: String,
      state: String,
      postalCode: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },

    // Installation Details
    systemCapacity: {
      type: Number, // in kW
      required: true,
    },
    panelCount: Number,
    inverterModel: String,
    batteryCapacity: Number, // in kWh

    // Status & Stages
    status: {
      type: String,
      enum: ["survey", "engineer_assigned", "installation", "testing", "go_live", "completed", "on_hold", "cancelled"],
      default: "survey",
      required: true,
    },

    // Stage Details - Site Survey
    survey: {
      status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending",
      },
      surveyDate: Date,
      surveyedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      surveyorName: String,
      roofCondition: String,
      sunExposure: String,
      obstructions: String,
      estimatedROI: Number,
      estimatedMonthlyGeneration: Number, // in kWh
      notes: String,
      attachments: [String], // URLs to survey images/documents
    },

    // Stage Details - Engineer Assignment
    engineerAssignment: {
      engineerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      engineerName: String,
      engineerEmail: String,
      assignedDate: Date,
      status: {
        type: String,
        enum: ["pending", "assigned", "accepted", "rejected"],
        default: "pending",
      },
    },

    // Stage Details - Installation
    installation: {
      status: {
        type: String,
        enum: ["not_started", "in_progress", "on_hold", "completed"],
        default: "not_started",
      },
      startDate: Date,
      plannedCompletionDate: Date,
      actualCompletionDate: Date,
      progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      activities: [
        {
          activity: String,
          startDate: Date,
          endDate: Date,
          status: {
            type: String,
            enum: ["pending", "in_progress", "completed"],
          },
          notes: String,
        },
      ],
      challenges: [String],
      safetyIncidents: [String],
      workersAssigned: [
        {
          workerId: mongoose.Schema.Types.ObjectId,
          workerName: String,
          role: String, // electrician, installer, etc.
        },
      ],
      notes: String,
    },

    // Stage Details - Testing & Commissioning
    testing: {
      status: {
        type: String,
        enum: ["not_started", "in_progress", "passed", "failed"],
        default: "not_started",
      },
      testStartDate: Date,
      testEndDate: Date,
      testResults: {
        systemOutput: Number, // kW
        gridConnection: Boolean,
        inverterStatus: String,
        batteryHealth: Number, // percentage
        safetyTests: [
          {
            testName: String,
            result: String, // pass/fail
            date: Date,
          },
        ],
      },
      issues: [
        {
          issue: String,
          severity: {
            type: String,
            enum: ["low", "medium", "high"],
          },
          status: {
            type: String,
            enum: ["open", "resolved"],
          },
          resolution: String,
        },
      ],
      certifications: [String], // URLs to certification documents
      notes: String,
    },

    // Stage Details - Go-Live
    goLive: {
      status: {
        type: String,
        enum: ["not_started", "scheduled", "live"],
        default: "not_started",
      },
      scheduledDate: Date,
      actualGoLiveDate: Date,
      meterReading: Number,
      gridConnectionRef: String,
      netMeteringStatus: String,
      documentationComplete: Boolean,
      customerTrainingDate: Date,
      trainingTopics: [String],
    },

    // Financial Details
    budget: {
      totalCost: Number,
      advancePayment: Number,
      remainingPayment: Number,
      paymentStatus: {
        type: String,
        enum: ["pending", "partial", "completed"],
        default: "pending",
      },
    },

    // Timeline
    timeline: {
      createdDate: {
        type: Date,
        default: Date.now,
      },
      targetCompletionDate: Date,
      actualCompletionDate: Date,
      daysToCompletion: Number,
    },

    // Documents & Attachments
    documents: [
      {
        docName: String,
        docType: String, // quote, contract, permit, inspection_report, etc.
        url: String,
        uploadDate: Date,
      },
    ],

    // Communication & Milestones
    milestones: [
      {
        milestoneName: String,
        targetDate: Date,
        completedDate: Date,
        status: {
          type: String,
          enum: ["pending", "completed"],
        },
      },
    ],

    // Project Manager
    projectManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    projectManagerName: String,

    // Notes & History
    notes: [
      {
        author: String,
        content: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Tracking
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },
    tags: [String],
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for faster queries
projectSchema.index({ customerId: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ "engineerAssignment.engineerId": 1 });
projectSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Project", projectSchema);
