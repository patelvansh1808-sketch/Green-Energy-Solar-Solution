const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const User = require('../models/User');

/**
 * Create a new lead
 * POST /api/leads
 */
exports.createLead = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      source,
      sourceDetails,
      address,
      projectDetails,
      tags,
      priority
    } = req.body;

    // Log for debugging
    console.log('=== CREATE LEAD REQUEST ===');
    console.log('req.user:', req.user);
    console.log('req.body:', req.body);

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !source) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: firstName, lastName, email, phone, source'
      });
    }

    // Check if lead already exists
    const existingLead = await Lead.findOne({ email });
    if (existingLead) {
      return res.status(409).json({
        success: false,
        message: 'Lead with this email already exists'
      });
    }

    // Create new lead
    const leadData = {
      firstName,
      lastName,
      email,
      phone,
      company,
      source,
      sourceDetails,
      address,
      projectDetails,
      tags,
      priority,
      createdBy: req.user?.id
    };

    const lead = new Lead(leadData);

    // Calculate lead score
    lead.leadScore = Lead.calculateLeadScore(leadData);

    await lead.save();

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: lead
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating lead',
      error: error.message
    });
  }
};

/**
 * Get all leads with filters and pagination
 * GET /api/leads
 */
exports.getAllLeads = async (req, res) => {
  try {
    const { stage, source, priority, assignedSalesEngineer, search, sortBy, page = 1, limit = 10 } = req.query;

    // Build filter object
    const filter = {};

    if (stage) filter.stage = stage;
    if (source) filter.source = source;
    if (priority) filter.priority = priority;
    if (assignedSalesEngineer) filter.assignedSalesEngineer = assignedSalesEngineer;

    // Search by name or email
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Sorting
    const sort = sortBy === 'score' ? { leadScore: -1 } : { createdAt: -1 };

    const leads = await Lead.find(filter)
      .populate('assignedSalesEngineer', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const totalLeads = await Lead.countDocuments(filter);

    res.json({
      success: true,
      data: leads,
      pagination: {
        total: totalLeads,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalLeads / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leads',
      error: error.message
    });
  }
};

/**
 * Get lead by ID
 * GET /api/leads/:id
 */
exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedSalesEngineer', 'firstName lastName email phone')
      .populate('createdBy', 'firstName lastName email')
      .populate('conversion.customerId', 'firstName lastName email phone');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.json({
      success: true,
      data: lead
    });
  } catch (error) {
    console.error('Error fetching lead:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lead',
      error: error.message
    });
  }
};

/**
 * Update lead
 * PUT /api/leads/:id
 */
exports.updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const lead = await Lead.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('assignedSalesEngineer', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Recalculate lead score
    lead.leadScore = Lead.calculateLeadScore(lead.toObject());
    await lead.save();

    res.json({
      success: true,
      message: 'Lead updated successfully',
      data: lead
    });
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating lead',
      error: error.message
    });
  }
};

/**
 * Update lead stage
 * PUT /api/leads/:id/stage
 */
exports.updateLeadStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage, reason } = req.body;

    if (!stage) {
      return res.status(400).json({
        success: false,
        message: 'Stage is required'
      });
    }

    const validStages = ['New', 'Contacted', 'Quoted', 'Converted', 'Lost'];
    if (!validStages.includes(stage)) {
      return res.status(400).json({
        success: false,
        message: `Invalid stage. Must be one of: ${validStages.join(', ')}`
      });
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    await lead.updateStage(stage, reason);

    res.json({
      success: true,
      message: `Lead stage updated to ${stage}`,
      data: lead
    });
  } catch (error) {
    console.error('Error updating lead stage:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating lead stage',
      error: error.message
    });
  }
};

/**
 * Assign lead to sales engineer
 * PUT /api/leads/:id/assign
 */
exports.assignSalesEngineer = async (req, res) => {
  try {
    const { id } = req.params;
    const { salesEngineerId } = req.body;

    if (!salesEngineerId) {
      return res.status(400).json({
        success: false,
        message: 'Sales Engineer ID is required'
      });
    }

    // Verify sales engineer exists
    const salesEngineer = await User.findById(salesEngineerId);
    if (!salesEngineer) {
      return res.status(404).json({
        success: false,
        message: 'Sales Engineer not found'
      });
    }

    const lead = await Lead.findByIdAndUpdate(
      id,
      {
        assignedSalesEngineer: salesEngineerId,
        assignmentDate: new Date()
      },
      { new: true }
    ).populate('assignedSalesEngineer', 'firstName lastName email');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.json({
      success: true,
      message: `Lead assigned to ${salesEngineer.firstName} ${salesEngineer.lastName}`,
      data: lead
    });
  } catch (error) {
    console.error('Error assigning sales engineer:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning sales engineer',
      error: error.message
    });
  }
};

/**
 * Add communication to lead
 * POST /api/leads/:id/communications
 */
exports.addCommunication = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, notes } = req.body;

    if (!type || !notes) {
      return res.status(400).json({
        success: false,
        message: 'Communication type and notes are required'
      });
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    await lead.addCommunication(type, notes, req.user?.id);

    res.json({
      success: true,
      message: 'Communication added successfully',
      data: lead
    });
  } catch (error) {
    console.error('Error adding communication:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding communication',
      error: error.message
    });
  }
};

/**
 * Schedule follow-up
 * POST /api/leads/:id/follow-up
 */
exports.scheduleFollowUp = async (req, res) => {
  try {
    const { id } = req.params;
    const { followUpDate, followUpType, notes } = req.body;

    if (!followUpDate || !followUpType) {
      return res.status(400).json({
        success: false,
        message: 'Follow-up date and type are required'
      });
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    await lead.scheduleFollowUp(followUpDate, followUpType, notes);

    res.json({
      success: true,
      message: 'Follow-up scheduled successfully',
      data: lead
    });
  } catch (error) {
    console.error('Error scheduling follow-up:', error);
    res.status(500).json({
      success: false,
      message: 'Error scheduling follow-up',
      error: error.message
    });
  }
};

/**
 * Create and send quote
 * POST /api/leads/:id/quote
 */
exports.createQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      quoteNumber,
      quotedAmount,
      systemSize,
      estimatedSavings,
      roi,
      validUntil
    } = req.body;

    if (!quoteNumber || !quotedAmount) {
      return res.status(400).json({
        success: false,
        message: 'Quote number and amount are required'
      });
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    lead.quote = {
      quoteNumber,
      quotedAmount,
      quotedDate: new Date(),
      validUntil: validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
      systemSize,
      estimatedSavings,
      roi,
      status: 'Sent'
    };

    lead.stage = 'Quoted';
    lead.status.currentStage = 'Quoted';
    lead.status.lastUpdated = new Date();
    lead.lastActivityDate = new Date();
    lead.activityCount += 1;

    // Recalculate lead score
    lead.leadScore = Lead.calculateLeadScore(lead.toObject());

    await lead.save();

    res.json({
      success: true,
      message: 'Quote created and sent successfully',
      data: lead
    });
  } catch (error) {
    console.error('Error creating quote:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating quote',
      error: error.message
    });
  }
};

/**
 * Convert lead to customer
 * POST /api/leads/:id/convert
 */
exports.convertToCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerId, conversionNotes } = req.body;

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // If customerId not provided, create a new customer
    let customer;
    if (customerId) {
      customer = await Customer.findById(customerId);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }
    }

    await lead.convertToCustomer(customerId);

    if (conversionNotes) {
      lead.conversion.conversionNotes = conversionNotes;
      await lead.save();
    }

    res.json({
      success: true,
      message: 'Lead converted to customer successfully',
      data: lead
    });
  } catch (error) {
    console.error('Error converting lead:', error);
    res.status(500).json({
      success: false,
      message: 'Error converting lead',
      error: error.message
    });
  }
};

/**
 * Mark lead as lost
 * PUT /api/leads/:id/lost
 */
exports.markAsLost = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, notes } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Reason is required'
      });
    }

    const validReasons = [
      'Budget Constraints',
      'Not Interested',
      'Competitor Selected',
      'No Response',
      'Unqualified Lead',
      'Other'
    ];

    if (!validReasons.includes(reason)) {
      return res.status(400).json({
        success: false,
        message: `Invalid reason. Must be one of: ${validReasons.join(', ')}`
      });
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    await lead.markAsLost(reason, notes);

    res.json({
      success: true,
      message: 'Lead marked as lost',
      data: lead
    });
  } catch (error) {
    console.error('Error marking lead as lost:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking lead as lost',
      error: error.message
    });
  }
};

/**
 * Get lead analytics
 * GET /api/leads/analytics/dashboard
 */
exports.getLeadAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Filter by date range
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const match = startDate || endDate ? { createdAt: dateFilter } : {};

    // Total leads
    const totalLeads = await Lead.countDocuments(match);

    // Leads by stage
    const leadsByStage = await Lead.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 }
        }
      }
    ]);

    // Leads by source
    const leadsBySource = await Lead.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      }
    ]);

    // Conversion rate
    const convertedLeads = await Lead.countDocuments({ ...match, stage: 'Converted' });
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(2) : 0;

    // Lost rate
    const lostLeads = await Lead.countDocuments({ ...match, stage: 'Lost' });
    const lostRate = totalLeads > 0 ? ((lostLeads / totalLeads) * 100).toFixed(2) : 0;

    // Average lead score
    const avgScoreResult = await Lead.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$leadScore' }
        }
      }
    ]);
    const avgLeadScore = avgScoreResult[0]?.avgScore || 0;

    // Leads by priority
    const leadsByPriority = await Lead.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Lost reasons
    const lostReasons = await Lead.aggregate([
      { $match: { ...match, stage: 'Lost' } },
      {
        $group: {
          _id: '$lostReason',
          count: { $sum: 1 }
        }
      }
    ]);

    // Time in pipeline (average days)
    const pipelineData = await Lead.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          avgDaysInPipeline: {
            $avg: {
              $divide: [
                { $subtract: [new Date(), '$createdAt'] },
                24 * 60 * 60 * 1000
              ]
            }
          }
        }
      }
    ]);
    const avgDaysInPipeline = Math.round(pipelineData[0]?.avgDaysInPipeline || 0);

    res.json({
      success: true,
      data: {
        totalLeads,
        conversionRate: `${conversionRate}%`,
        convertedLeads,
        lostRate: `${lostRate}%`,
        lostLeads,
        avgLeadScore: avgLeadScore.toFixed(2),
        avgDaysInPipeline,
        leadsByStage: Object.fromEntries(leadsByStage.map(item => [item._id, item.count])),
        leadsBySource: Object.fromEntries(leadsBySource.map(item => [item._id, item.count])),
        leadsByPriority: Object.fromEntries(leadsByPriority.map(item => [item._id, item.count])),
        lostReasons: Object.fromEntries(lostReasons.map(item => [item._id, item.count]))
      }
    });
  } catch (error) {
    console.error('Error fetching lead analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lead analytics',
      error: error.message
    });
  }
};

/**
 * Delete lead
 * DELETE /api/leads/:id
 */
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting lead',
      error: error.message
    });
  }
};

/**
 * Get leads needing follow-up
 * GET /api/leads/follow-up/pending
 */
exports.getFollowUpPending = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const leads = await Lead.find({
      'followUp.nextFollowUpDate': { $lte: today },
      stage: { $ne: 'Converted' }
    })
      .populate('assignedSalesEngineer', 'firstName lastName email')
      .sort({ 'followUp.nextFollowUpDate': 1 });

    res.json({
      success: true,
      data: leads,
      count: leads.length
    });
  } catch (error) {
    console.error('Error fetching pending follow-ups:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending follow-ups',
      error: error.message
    });
  }
};

/**
 * Get leads assigned to logged-in team member
 * GET /api/leads/my-assigned-leads
 */
exports.getMyAssignedLeads = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const leads = await Lead.find({ assignedSalesEngineer: userId })
      .populate('createdBy', 'firstName lastName email name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: leads
    });
  } catch (error) {
    console.error('[LEADS API] Error fetching assigned leads:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assigned leads',
      error: error.message
    });
  }
};
