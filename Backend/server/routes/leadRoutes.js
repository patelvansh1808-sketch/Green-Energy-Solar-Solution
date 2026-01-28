const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Lead CRUD Operations
router.post('/', leadController.createLead);
router.get('/', leadController.getAllLeads);
router.get('/analytics/dashboard', leadController.getLeadAnalytics);
router.get('/follow-up/pending', leadController.getFollowUpPending);
router.get('/my-assigned-leads', leadController.getMyAssignedLeads);
router.get('/:id', leadController.getLeadById);
router.put('/:id', leadController.updateLead);
router.delete('/:id', leadController.deleteLead);

// Lead Stage Management
router.put('/:id/stage', leadController.updateLeadStage);

// Sales Engineer Assignment
router.put('/:id/assign', leadController.assignSalesEngineer);

// Communication & Follow-up
router.post('/:id/communications', leadController.addCommunication);
router.post('/:id/follow-up', leadController.scheduleFollowUp);

// Quote Management
router.post('/:id/quote', leadController.createQuote);

// Lead Conversion
router.post('/:id/convert', leadController.convertToCustomer);

// Mark as Lost
router.put('/:id/lost', leadController.markAsLost);

module.exports = router;
