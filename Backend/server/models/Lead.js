const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    // Basic Information
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    phone: {
      type: String,
      required: true,
      match: /^[0-9]{10,15}$/
    },
    company: {
      type: String,
      trim: true
    },

    // Lead Source
    source: {
      type: String,
      enum: ['Website', 'Phone', 'Walk-in', 'Social Media', 'Referral', 'Trade Show', 'Other'],
      required: true,
      default: 'Website'
    },
    sourceDetails: {
      type: String,
      trim: true
    },

    // Lead Stage
    stage: {
      type: String,
      enum: ['New', 'Contacted', 'Quoted', 'Converted', 'Lost'],
      default: 'New',
      required: true
    },

    // Lead Status Details
    status: {
      currentStage: {
        type: String,
        default: 'New'
      },
      lastUpdated: {
        type: Date,
        default: Date.now
      },
      reason: {
        type: String,
        trim: true
      }
    },

    // Address
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    },

    // Project Details
    projectDetails: {
      propertyType: {
        type: String,
        enum: ['Residential', 'Commercial', 'Industrial', 'Not Specified'],
        default: 'Not Specified'
      },
      roofArea: {
        value: Number,
        unit: {
          type: String,
          enum: ['sqft', 'sqm'],
          default: 'sqft'
        }
      },
      estimatedBudget: Number,
      budgetCurrency: {
        type: String,
        default: 'USD'
      },
      desiredInstallationDate: Date,
      description: String
    },

    // Sales Engineer Assignment
    assignedSalesEngineer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    assignmentDate: Date,

    // Quote Information
    quote: {
      quoteNumber: String,
      quotedAmount: Number,
      quotedDate: Date,
      validUntil: Date,
      systemSize: {
        value: Number,
        unit: {
          type: String,
          enum: ['kW', 'kWh'],
          default: 'kW'
        }
      },
      estimatedSavings: {
        yearlyAmount: Number,
        currency: {
          type: String,
          default: 'USD'
        }
      },
      roi: {
        value: Number,
        paybackPeriod: Number
      },
      status: {
        type: String,
        enum: ['Draft', 'Sent', 'Accepted', 'Rejected'],
        default: 'Draft'
      }
    },

    // Conversion Details
    conversion: {
      convertedDate: Date,
      customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        default: null
      },
      conversionNotes: String
    },

    // Lost Lead Information
    lostReason: {
      type: String,
      enum: [
        'Budget Constraints',
        'Not Interested',
        'Competitor Selected',
        'No Response',
        'Unqualified Lead',
        'Other'
      ]
    },
    lostDate: Date,
    lostNotes: String,

    // Communication History
    communications: [
      {
        date: {
          type: Date,
          default: Date.now
        },
        type: {
          type: String,
          enum: ['Email', 'Phone', 'SMS', 'In-Person', 'Video Call'],
          required: true
        },
        notes: String,
        communicatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }
      }
    ],

    // Follow-up Schedule
    followUp: {
      nextFollowUpDate: Date,
      nextFollowUpType: {
        type: String,
        enum: ['Email', 'Phone', 'SMS', 'In-Person'],
        default: 'Email'
      },
      followUpNotes: String
    },

    // Tags for categorization
    tags: [
      {
        type: String,
        trim: true
      }
    ],

    // Priority
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium'
    },

    // Activity tracking
    activityCount: {
      type: Number,
      default: 0
    },
    lastActivityDate: Date,

    // Scoring
    leadScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    // Created by
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Index for better query performance
leadSchema.index({ email: 1, phone: 1 });
leadSchema.index({ stage: 1 });
leadSchema.index({ source: 1 });
leadSchema.index({ assignedSalesEngineer: 1 });
leadSchema.index({ createdAt: -1 });

// Virtual for full name
leadSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Instance method to update stage
leadSchema.methods.updateStage = function (newStage, reason = '') {
  this.stage = newStage;
  this.status.currentStage = newStage;
  this.status.lastUpdated = Date.now();
  this.status.reason = reason;
  this.lastActivityDate = Date.now();
  this.activityCount += 1;
  return this.save();
};

// Instance method to add communication
leadSchema.methods.addCommunication = function (type, notes, userId) {
  this.communications.push({
    date: new Date(),
    type,
    notes,
    communicatedBy: userId
  });
  this.lastActivityDate = Date.now();
  this.activityCount += 1;
  return this.save();
};

// Instance method to schedule follow-up
leadSchema.methods.scheduleFollowUp = function (followUpDate, followUpType, notes = '') {
  this.followUp = {
    nextFollowUpDate: followUpDate,
    nextFollowUpType: followUpType,
    followUpNotes: notes
  };
  return this.save();
};

// Instance method to convert to customer
leadSchema.methods.convertToCustomer = function (customerId) {
  this.stage = 'Converted';
  this.status.currentStage = 'Converted';
  this.status.lastUpdated = Date.now();
  this.conversion = {
    convertedDate: Date.now(),
    customerId: customerId
  };
  this.lastActivityDate = Date.now();
  this.activityCount += 1;
  return this.save();
};

// Instance method to mark as lost
leadSchema.methods.markAsLost = function (reason, notes = '') {
  this.stage = 'Lost';
  this.status.currentStage = 'Lost';
  this.status.lastUpdated = Date.now();
  this.lostReason = reason;
  this.lostDate = Date.now();
  this.lostNotes = notes;
  this.lastActivityDate = Date.now();
  this.activityCount += 1;
  return this.save();
};

// Static method to calculate lead score
leadSchema.statics.calculateLeadScore = function (leadData) {
  let score = 0;

  // Source scoring (25 points max)
  const sourceScores = {
    'Website': 20,
    'Phone': 25,
    'Walk-in': 25,
    'Social Media': 15,
    'Referral': 25,
    'Trade Show': 20,
    'Other': 10
  };
  score += sourceScores[leadData.source] || 10;

  // Budget scoring (20 points max)
  if (leadData.projectDetails?.estimatedBudget) {
    if (leadData.projectDetails.estimatedBudget >= 50000) score += 20;
    else if (leadData.projectDetails.estimatedBudget >= 20000) score += 15;
    else if (leadData.projectDetails.estimatedBudget >= 10000) score += 10;
    else score += 5;
  }

  // Timeline scoring (15 points max)
  if (leadData.projectDetails?.desiredInstallationDate) {
    const daysUntilInstallation = Math.floor(
      (new Date(leadData.projectDetails.desiredInstallationDate) - new Date()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilInstallation <= 30) score += 15;
    else if (daysUntilInstallation <= 90) score += 12;
    else if (daysUntilInstallation <= 180) score += 8;
    else score += 3;
  }

  // Engagement scoring (15 points max)
  if (leadData.activityCount >= 5) score += 15;
  else if (leadData.activityCount >= 3) score += 10;
  else if (leadData.activityCount >= 1) score += 5;

  // Stage scoring (25 points max)
  const stageScores = {
    'New': 5,
    'Contacted': 10,
    'Quoted': 20,
    'Converted': 25,
    'Lost': 0
  };
  score += stageScores[leadData.stage] || 0;

  return Math.min(score, 100);
};

const Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead;
