import React, { useState, useEffect } from 'react';
import api from '../services/api';

const TeamMemberDashboard = () => {
  const [assignedLeads, setAssignedLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchAssignedLeads();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      console.log('[TEAM] Fetching user profile...');
      const res = await api.get('/users/profile');
      console.log('[TEAM] User profile:', res.data);
      console.log('[TEAM] User ID:', res.data._id);
      console.log('[TEAM] User role:', res.data.role);
      setUser(res.data);
    } catch (error) {
      console.error('[TEAM] Error fetching profile:', error);
    }
  };

  const fetchAssignedLeads = async () => {
    setLoading(true);
    try {
      console.log('[TEAM] Fetching assigned leads...');
      const res = await api.get('/leads/my-assigned-leads');
      console.log('[TEAM] API Response:', res);
      console.log('[TEAM] Response data:', res.data);
      console.log('[TEAM] Assigned leads:', res.data.data);
      setAssignedLeads(res.data.data || []);
    } catch (error) {
      console.error('[TEAM] Error fetching assigned leads:', error);
      console.error('[TEAM] Error response:', error.response);
      setAssignedLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await api.put(`/leads/${leadId}/stage`, { stage: newStatus });
      alert('Lead status updated successfully!');
      fetchAssignedLeads();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

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

  if (loading) {
    return <div className="p-4 sm:p-8 text-center text-lg">Loading your assigned leads...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Assigned Leads</h1>
              <p className="text-gray-600 mt-1">
                Welcome, {user?.name || user?.firstName} {user?.lastName}
              </p>
            </div>
            <div className="sm:text-right">
              <div className="text-sm text-gray-600">Role</div>
              <div className="text-lg font-semibold text-green-600 capitalize">
                {user?.role || 'Team Member'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="text-sm text-gray-600">Total Assigned</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
              {assignedLeads.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="text-sm text-gray-600">New Leads</div>
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 mt-2">
              {assignedLeads.filter(l => l.stage === 'New').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="text-sm text-gray-600">In Progress</div>
            <div className="text-2xl sm:text-3xl font-bold text-yellow-600 mt-2">
              {assignedLeads.filter(l => ['Contacted', 'Quoted'].includes(l.stage)).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="text-sm text-gray-600">Converted</div>
            <div className="text-2xl sm:text-3xl font-bold text-green-600 mt-2">
              {assignedLeads.filter(l => l.stage === 'Converted').length}
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Leads</h2>
          </div>
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lead Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignedLeads.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No leads assigned to you yet
                    </td>
                  </tr>
                ) : (
                  assignedLeads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {lead.firstName} {lead.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{lead.email}</div>
                        <div className="text-sm text-gray-500">{lead.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {lead.company || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {lead.source}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden p-4 space-y-3">
            {assignedLeads.length === 0 ? (
              <div className="text-center text-gray-500 py-6">No leads assigned to you yet</div>
            ) : (
              assignedLeads.map((lead) => (
                <div key={lead._id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{lead.firstName} {lead.lastName}</p>
                      <p className="text-xs text-gray-600 break-all">{lead.email}</p>
                      <p className="text-xs text-gray-500">{lead.phone}</p>
                    </div>
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                      {lead.source}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white border border-gray-200 rounded p-2">
                      <p className="text-gray-500">Company</p>
                      <p className="text-gray-800 font-medium">{lead.company || '-'}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded p-2">
                      <p className="text-gray-500">Created</p>
                      <p className="text-gray-800 font-medium">{new Date(lead.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <select
                    value={lead.stage}
                    onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                    className={`w-full px-3 py-2 rounded text-sm font-medium border-none cursor-pointer ${getStatusColor(
                      lead.stage
                    )}`}
                  >
                    <option>New</option>
                    <option>Contacted</option>
                    <option>Quoted</option>
                    <option>Converted</option>
                    <option>Lost</option>
                  </select>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberDashboard;
