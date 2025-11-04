import React, { useState, useEffect } from 'react';
import ApplicationForm from './ApplicationForm';
import ApplicationList from './ApplicationList';
import { analyticsAPI } from '../../utils/api';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('applications');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await analyticsAPI.getUserAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>My Dashboard</h1>
      </div>

      {/* Analytics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#007bff', marginBottom: '10px' }}>{analytics?.total || 0}</h3>
          <p>Total Applications</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#28a745', marginBottom: '10px' }}>{analytics?.approved || 0}</h3>
          <p>Approved</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#dc3545', marginBottom: '10px' }}>{analytics?.rejected || 0}</h3>
          <p>Rejected</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#ffc107', marginBottom: '10px' }}>{analytics?.pending || 0}</h3>
          <p>Pending</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #ddd', marginBottom: '20px' }}>
        <button
          style={{
            padding: '10px 20px',
            border: 'none',
            background: activeTab === 'applications' ? '#007bff' : 'transparent',
            color: activeTab === 'applications' ? 'white' : '#333',
            cursor: 'pointer'
          }}
          onClick={() => setActiveTab('applications')}
        >
          My Applications
        </button>
        <button
          style={{
            padding: '10px 20px',
            border: 'none',
            background: activeTab === 'new' ? '#007bff' : 'transparent',
            color: activeTab === 'new' ? 'white' : '#333',
            cursor: 'pointer'
          }}
          onClick={() => setActiveTab('new')}
        >
          New Application
        </button>
      </div>

      {activeTab === 'applications' ? <ApplicationList /> : <ApplicationForm />}
    </div>
  );
};

export default UserDashboard;