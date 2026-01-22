import React, { useState, useEffect } from 'react';
import leadService from '../services/leadService';

const SalesDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leadsResponse, analyticsResponse] = await Promise.all([
        leadService.getAllLeads({ limit: 100 }),
        leadService.getLeadAnalytics()
      ]);
      
      console.log('Sales Dashboard - Leads Response:', leadsResponse.data);
      console.log('Sales Dashboard - Analytics Response:', analyticsResponse.data);
      
      // Ensure leads is always an array - backend returns data in response.data.data
      const leadsData = Array.isArray(leadsResponse.data?.data) ? leadsResponse.data.data : [];
      setLeads(leadsData);
      
      // Analytics data is in response.data.data
      const analyticsData = analyticsResponse.data?.data || analyticsResponse.data;
      console.log('Sales Dashboard - Parsed Analytics:', analyticsData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set empty array on error
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading Sales Dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-8">
        <h1 className="text-4xl font-bold text-gray-900">Sales Dashboard</h1>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Top Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Leads Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium mb-2">Total Leads</p>
            <p className="text-4xl font-bold text-blue-600">
              {analytics?.totalLeads || leads.length}
            </p>
          </div>

          {/* Converted Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium mb-2">Converted</p>
            <p className="text-4xl font-bold text-green-600">
              {analytics?.convertedLeads || leads.filter(lead => lead.stage === 'Converted').length}
            </p>
          </div>

          {/* Conversion Rate Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium mb-2">Conversion Rate</p>
            <p className="text-4xl font-bold text-purple-600">
              {analytics?.conversionRate || 
                (leads.length > 0 
                  ? `${((leads.filter(lead => lead.stage === 'Converted').length / leads.length) * 100).toFixed(1)}%` 
                  : '0%')}
            </p>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Conversion Funnel</h2>
          <div className="space-y-4">
            {[
              { stage: 'New', icon: '🆕', color: 'from-blue-400 to-blue-600' },
              { stage: 'Contacted', icon: '📞', color: 'from-yellow-400 to-yellow-600' },
              { stage: 'Quoted', icon: '📋', color: 'from-purple-400 to-purple-600' },
              { stage: 'Converted', icon: '✅', color: 'from-green-400 to-green-600' }
            ].map((item) => {
              const count = leads.filter(lead => lead.stage === item.stage).length;
              const percentage = leads.length > 0 ? (count / leads.length) * 100 : 0;
              return (
                <div key={item.stage}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{item.icon}</span>
                      <span className="font-semibold text-gray-700">{item.stage}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">{count} leads</span>
                      <span className="text-gray-600 ml-2">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${item.color} flex items-center justify-start transition-all duration-500`}
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    >
                      <span className="text-white font-bold text-sm ml-2">
                        {percentage > 10 ? `${percentage.toFixed(0)}%` : ''}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Lost Leads */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">❌</span>
                <span className="font-semibold text-gray-700">Lost</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-gray-900">{leads.filter(lead => lead.stage === 'Lost').length} leads</span>
                <span className="text-gray-600 ml-2">
                  ({leads.length > 0 
                    ? ((leads.filter(lead => lead.stage === 'Lost').length / leads.length) * 100).toFixed(1) 
                    : 0}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Follow-ups */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Pending Follow-ups</h2>
          <p className="text-gray-500">No pending follow-ups</p>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
