import React, { useState, useEffect } from 'react';
import leadService from '../services/leadService';

const CRMDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [filterSource, setFilterSource] = useState('All Sources');
  const [teamMembers, setTeamMembers] = useState([]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    source: 'Website',
    projectDetails: {
      propertyType: 'Residential',
      estimatedBudget: ''
    }
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        alert('Please login first');
        return;
      }

      const leadsRes = await leadService.getAllLeads({ limit: 100 });
      console.log('Leads Response:', leadsRes.data);
      
      // Ensure leads is always an array - backend returns data in response.data.data
      const leadsData = Array.isArray(leadsRes.data?.data) ? leadsRes.data.data : [];
      console.log('Leads Data after parsing:', leadsData);
      setLeads(leadsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
      }
      // Set empty array on error
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      console.log('[CRM] Fetching team members...');
      const res = await leadService.getTeamMembers();
      console.log('[CRM] Team members API response:', res.data);
      const members = res.data.data || [];
      console.log('[CRM] Parsed team members:', members);
      console.log('[CRM] Team members count:', members.length);
      if (members.length > 0) {
        console.log('[CRM] First team member:', members[0]);
      }
      setTeamMembers(members);
    } catch (error) {
      console.error('[CRM] Error fetching team members:', error);
      console.error('[CRM] Error response:', error.response?.data);
    }
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    console.log('handleAddLead called with formData:', formData);
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      alert('Please fill all required fields');
      return;
    }

    try {
      console.log('Sending API request to create lead...');
      await leadService.createLead(formData);
      console.log('Lead created successfully');
      alert('Lead added successfully!');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        source: 'Website',
        projectDetails: {
          propertyType: 'Residential',
          estimatedBudget: ''
        }
      });
      setShowAddForm(false);
      fetchData();
    } catch (error) {
      console.error('Error response data:', error.response?.data);
      console.error('Full error object:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add lead';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await leadService.updateLeadStage(leadId, newStatus);
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleAssignLead = async (leadId, engineerId) => {
    if (!engineerId) return;
    try {
      await leadService.assignSalesEngineer(leadId, engineerId);
      alert('Lead assigned successfully!');
      fetchData();
    } catch (error) {
      console.error('Error assigning lead:', error);
      alert('Failed to assign lead');
    }
  };

  const filteredLeads = Array.isArray(leads) ? leads.filter((lead) => {
    const statusMatch = filterStatus === 'All Status' || lead.stage === filterStatus;
    const sourceMatch = filterSource === 'All Sources' || lead.source === filterSource;
    return statusMatch && sourceMatch;
  }) : [];

  if (loading) {
    return <div className="p-8 text-center text-lg">Loading CRM Dashboard...</div>;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800';
      case 'Contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'Quoted':
        return 'bg-purple-100 text-purple-800';
      case 'Converted':
        return 'bg-green-100 text-green-800';
      case 'Lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">CRM Dashboard</h1>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300 shadow-md hover:shadow-lg"
            >
              + Add Enquiry
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Filter Controls */}
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <div className="flex gap-4 flex-wrap">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option>All Status</option>
                <option>New</option>
                <option>Contacted</option>
                <option>Quoted</option>
                <option>Converted</option>
                <option>Lost</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Source</label>
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option>All Sources</option>
                <option>Website</option>
                <option>Phone</option>
                <option>Walk-in</option>
                <option>Referral</option>
                <option>Social Media</option>
              </select>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Source</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Assigned To</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No leads found
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="text-blue-600 font-medium cursor-pointer hover:underline">
                          {lead.firstName} {lead.lastName}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{lead.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{lead.phone}</td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {lead.source}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={lead.stage}
                          onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                          className={`px-3 py-1 rounded text-sm font-medium border-none cursor-pointer ${getStatusColor(
                            lead.stage
                          )}`}
                        >
                          <option>New</option>
                          <option>Contacted</option>
                          <option>Quoted</option>
                          <option>Converted</option>
                          <option>Lost</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {lead.assignedSalesEngineer?._id ? (
                          <select
                            value={lead.assignedSalesEngineer._id}
                            onChange={(e) => handleAssignLead(lead._id, e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer bg-white"
                          >
                            <option value={lead.assignedSalesEngineer._id}>
                              {lead.assignedSalesEngineer?.firstName && lead.assignedSalesEngineer?.lastName
                                ? `${lead.assignedSalesEngineer.firstName} ${lead.assignedSalesEngineer.lastName}`
                                : lead.assignedSalesEngineer?.name || 'Assigned'}
                            </option>
                            {teamMembers && teamMembers.length > 0 && (
                              teamMembers
                                .filter(member => member._id !== lead.assignedSalesEngineer._id)
                                .map((member) => {
                                  const displayName = member.firstName && member.lastName 
                                    ? `${member.firstName} ${member.lastName}`
                                    : member.name || member.email || 'Unknown Member';
                                  return (
                                    <option key={member._id} value={member._id}>
                                      {displayName}
                                    </option>
                                  );
                                })
                            )}
                          </select>
                        ) : null}
                      </td>
                      <td className="px-6 py-4">
                        <select className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                          <option value="">{lead.stage}</option>
                          <option>View Details</option>
                          <option>Add Note</option>
                          <option>Delete</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Lead Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Add New Enquiry</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddLead} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option>Website</option>
                  <option>Phone</option>
                  <option>Walk-in</option>
                  <option>Referral</option>
                  <option>Social Media</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Budget</label>
                <input
                  type="number"
                  value={formData.projectDetails.estimatedBudget}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      projectDetails: { ...formData.projectDetails, estimatedBudget: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition"
                >
                  Add Enquiry
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRMDashboard;
