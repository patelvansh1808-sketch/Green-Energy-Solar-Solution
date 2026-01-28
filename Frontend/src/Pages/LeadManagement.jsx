import React, { useState, useEffect } from 'react';
import leadService from '../services/leadService';
import roleService from '../services/roleService';

const LeadManagement = () => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [salesStaff, setSalesStaff] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    stage: '',
    source: '',
    priority: '',
    search: ''
  });

  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    source: 'Website',
    priority: 'Medium',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    },
    projectDetails: {
      propertyType: 'Not Specified',
      estimatedBudget: '',
      desiredInstallationDate: '',
      description: ''
    }
  });

  // Fetch leads
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await leadService.getAllLeads(filters);
      setLeads(response.data);
      applyFilters(response.data);
    } catch (error) {
      console.error('Error fetching leads:', error);
      alert('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      const response = await leadService.getLeadAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  // Fetch sales staff
  const fetchSalesStaff = async () => {
    try {
      const staff = await roleService.getAllUsers({ role: 'sales', isActive: true });
      setSalesStaff(staff);
    } catch (error) {
      console.error('Error fetching sales staff:', error);
    }
  };

  // Apply local filters
  const applyFilters = (data) => {
    let filtered = data;

    if (filters.stage) {
      filtered = filtered.filter(lead => lead.stage === filters.stage);
    }
    if (filters.source) {
      filtered = filtered.filter(lead => lead.source === filters.source);
    }
    if (filters.priority) {
      filtered = filtered.filter(lead => lead.priority === filters.priority);
    }
    if (filters.search) {
      filtered = filtered.filter(lead =>
        lead.firstName.toLowerCase().includes(filters.search.toLowerCase()) ||
        lead.lastName.toLowerCase().includes(filters.search.toLowerCase()) ||
        lead.email.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredLeads(filtered);
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  // Handle form input
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Create new lead
  const handleCreateLead = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await leadService.createLead(formData);
      alert('Lead created successfully');
      setShowCreateModal(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        source: 'Website',
        priority: 'Medium',
        address: {
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: ''
        },
        projectDetails: {
          propertyType: 'Not Specified',
          estimatedBudget: '',
          desiredInstallationDate: '',
          description: ''
        }
      });
      fetchLeads();
      fetchAnalytics();
    } catch (error) {
      console.error('Error creating lead:', error);
      alert('Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  // Update lead stage
  const handleStageChange = async (leadId, newStage) => {
    try {
      await leadService.updateLeadStage(leadId, newStage);
      alert('Lead stage updated');
      fetchLeads();
      fetchAnalytics();
    } catch (error) {
      console.error('Error updating stage:', error);
      alert('Failed to update stage');
    }
  };

  // Delete lead
  const handleDeleteLead = async (leadId) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await leadService.deleteLead(leadId);
        alert('Lead deleted successfully');
        fetchLeads();
        fetchAnalytics();
      } catch (error) {
        console.error('Error deleting lead:', error);
        alert('Failed to delete lead');
      }
    }
  };

  // Mark as lost
  const handleMarkAsLost = async (leadId) => {
    const reason = prompt('Enter reason for marking as lost:');
    if (reason) {
      try {
        await leadService.markAsLost(leadId, reason);
        alert('Lead marked as lost');
        fetchLeads();
        fetchAnalytics();
      } catch (error) {
        console.error('Error marking as lost:', error);
        alert('Failed to mark as lost');
      }
    }
  };

  // Open assign modal
  const openAssignModal = (lead) => {
    setSelectedLead(lead);
    setShowAssignModal(true);
  };

  // Assign sales engineer
  const handleAssignSales = async (salesPersonId) => {
    try {
      await leadService.assignSalesEngineer(selectedLead._id, salesPersonId);
      alert('Lead assigned successfully!');
      setShowAssignModal(false);
      setSelectedLead(null);
      fetchLeads();
    } catch (error) {
      console.error('Error assigning lead:', error);
      alert('Failed to assign lead');
    }
  };

  // Initialize on mount
  useEffect(() => {
    fetchLeads();
    fetchAnalytics();
    fetchSalesStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply filters when they change
  useEffect(() => {
    applyFilters(leads);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, leads]);

  const stageColors = {
    'New': 'bg-blue-100 text-blue-800',
    'Contacted': 'bg-yellow-100 text-yellow-800',
    'Quoted': 'bg-purple-100 text-purple-800',
    'Converted': 'bg-green-100 text-green-800',
    'Lost': 'bg-red-100 text-red-800'
  };

  const priorityColors = {
    'Low': 'text-gray-600',
    'Medium': 'text-blue-600',
    'High': 'text-orange-600',
    'Urgent': 'text-red-600'
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Lead Management</h1>
        <p className="text-gray-600">Convert enquiries into customers</p>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Total Leads</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{analytics.totalLeads}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Conversion Rate</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{analytics.conversionRate}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Lost Rate</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">{analytics.lostRate}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Avg Lead Score</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{analytics.avgLeadScore}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Avg Days in Pipeline</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">{analytics.avgDaysInPipeline}</p>
          </div>
        </div>
      )}

      {/* Filters and Create Button */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-end">
          <div className="flex gap-4 flex-wrap flex-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Name, email, company..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
              <select
                value={filters.stage}
                onChange={(e) => handleFilterChange('stage', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Stages</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Quoted">Quoted</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <select
                value={filters.source}
                onChange={(e) => handleFilterChange('source', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Sources</option>
                <option value="Website">Website</option>
                <option value="Phone">Phone</option>
                <option value="Walk-in">Walk-in</option>
                <option value="Social Media">Social Media</option>
                <option value="Referral">Referral</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + New Lead
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading leads...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No leads found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Source</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Stage</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Priority</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Score</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => {
                          setSelectedLead(lead);
                          setShowDetailModal(true);
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        {lead.firstName} {lead.lastName}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{lead.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{lead.phone}</td>
                    <td className="px-6 py-4 text-sm">{lead.source}</td>
                    <td className="px-6 py-4 text-sm">
                      <select
                        value={lead.stage}
                        onChange={(e) => handleStageChange(lead._id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${stageColors[lead.stage]} border-none cursor-pointer`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Quoted">Quoted</option>
                        <option value="Converted">Converted</option>
                        <option value="Lost">Lost</option>
                      </select>
                    </td>
                    <td className={`px-6 py-4 text-sm font-medium ${priorityColors[lead.priority]}`}>
                      {lead.priority}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center">
                        <div className="bg-gray-200 rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
                          {Math.round(lead.leadScore)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => openAssignModal(lead)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        Assign
                      </button>
                      <button
                        onClick={() => handleMarkAsLost(lead._id)}
                        className="text-red-600 hover:text-red-800 mr-3"
                      >
                        Lost
                      </button>
                      <button
                        onClick={() => handleDeleteLead(lead._id)}
                        className="text-gray-600 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Lead Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold">Create New Lead</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateLead} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Website">Website</option>
                    <option value="Phone">Phone</option>
                    <option value="Walk-in">Walk-in</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Referral">Referral</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                  <select
                    name="projectDetails.propertyType"
                    value={formData.projectDetails.propertyType}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Industrial">Industrial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Budget</label>
                  <input
                    type="number"
                    name="projectDetails.estimatedBudget"
                    value={formData.projectDetails.estimatedBudget}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                >
                  {loading ? 'Creating...' : 'Create Lead'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lead Detail Modal */}
      {showDetailModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold">{selectedLead.firstName} {selectedLead.lastName}</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedLead.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedLead.phone}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Company</p>
                  <p className="font-medium">{selectedLead.company || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Source</p>
                  <p className="font-medium">{selectedLead.source}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Stage</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${stageColors[selectedLead.stage]}`}>
                    {selectedLead.stage}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Lead Score</p>
                  <p className="font-medium text-lg">{Math.round(selectedLead.leadScore)}/100</p>
                </div>
              </div>
              {selectedLead.projectDetails && (
                <>
                  <hr />
                  <h3 className="font-bold">Project Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Property Type</p>
                      <p className="font-medium">{selectedLead.projectDetails.propertyType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Estimated Budget</p>
                      <p className="font-medium">${selectedLead.projectDetails.estimatedBudget || '-'}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assign Sales Modal */}
      {showAssignModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Assign Lead to Sales</h2>
            <p className="text-gray-600 mb-4">
              Assign <strong>{selectedLead.firstName} {selectedLead.lastName}</strong> to:
            </p>
            
            {salesStaff.length === 0 ? (
              <p className="text-red-600 mb-4">No active sales staff available</p>
            ) : (
              <div className="space-y-3 mb-6">
                {salesStaff.map((staff) => (
                  <button
                    key={staff._id}
                    onClick={() => handleAssignSales(staff._id)}
                    className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition"
                  >
                    <div className="font-semibold text-gray-900">
                      {staff.firstName} {staff.lastName}
                    </div>
                    <div className="text-sm text-gray-600">{staff.email}</div>
                    {staff.department && (
                      <div className="text-xs text-gray-500">{staff.department}</div>
                    )}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                setShowAssignModal(false);
                setSelectedLead(null);
              }}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadManagement;
