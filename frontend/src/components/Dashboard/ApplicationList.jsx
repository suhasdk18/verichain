import React, { useState, useEffect } from 'react';
import { applicationsAPI, downloadAPI } from '../../utils/api';

const ApplicationList = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await applicationsAPI.getMyApplications();
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (appId) => {
    setDownloading(appId);
    try {
      const response = await downloadAPI.downloadZip(appId);
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate_${appId}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Refresh applications to update downloaded status
      fetchApplications();
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setDownloading(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'Pending': '#ffc107',
      'Issued': '#28a745',
      'Rejected': '#dc3545'
    };
    
    return (
      <span style={{
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold',
        backgroundColor: statusColors[status],
        color: 'white'
      }}>
        {status}
      </span>
    );
  };

  if (loading) {
    return <div className="loading">Loading applications...</div>;
  }

  return (
    <div className="card">
      <h2 style={{ marginBottom: '20px' }}>My Applications</h2>
      
      {applications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          No applications found. Start by creating a new application.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Full Name</th>
                <th>Status</th>
                <th>Applied Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td>{app.certificate_type}</td>
                  <td>{app.full_name}</td>
                  <td>{getStatusBadge(app.status)}</td>
                  <td>{new Date(app.created_at).toLocaleDateString()}</td>
                  <td>
                    {app.status === 'Issued' && !app.downloaded && (
                      <button
                        className="btn btn-success"
                        style={{ padding: '5px 10px', fontSize: '12px' }}
                        onClick={() => handleDownload(app.id)}
                        disabled={downloading === app.id}
                      >
                        {downloading === app.id ? 'Downloading...' : 'Download'}
                      </button>
                    )}
                    {app.status === 'Issued' && app.downloaded && (
                      <span style={{ color: '#28a745', fontSize: '12px' }}>
                        Downloaded
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ApplicationList;