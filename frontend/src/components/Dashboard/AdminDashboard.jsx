import React, { useState, useEffect } from 'react';
import { adminAPI, analyticsAPI } from '../../utils/api';

const AdminDashboard = () => {
  const [pendingApplications, setPendingApplications] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pendingRes, analyticsRes] = await Promise.all([
        adminAPI.getPending(),
        analyticsAPI.getAdminAnalytics()
      ]);
      setPendingApplications(pendingRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appId) => {
    setProcessing(appId);
    try {
      await adminAPI.approve(appId);
      // Remove from pending list
      setPendingApplications(prev => prev.filter(app => app.id !== appId));
      // Refresh analytics
      const analyticsRes = await analyticsAPI.getAdminAnalytics();
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Approval error:', error);
      alert('Approval failed: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (appId) => {
    setProcessing(appId);
    try {
      await adminAPI.reject(appId);
      // Remove from pending list
      setPendingApplications(prev => prev.filter(app => app.id !== appId));
      // Refresh analytics
      const analyticsRes = await analyticsAPI.getAdminAnalytics();
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Rejection error:', error);
      alert('Rejection failed: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setProcessing(null);
    }
  };

const openDocument = (url) => {
  console.log('📁 Opening document for viewing:', url);
  
  if (!url) {
    alert('No document URL available');
    return;
  }

  let viewUrl = url;
  
  // Transform Cloudinary URLs for inline PDF viewing
  if (url.includes('cloudinary.com')) {
    // Remove any existing download flags
    viewUrl = viewUrl.replace(/[\?&]fl_attachment/g, '');
    
    // For PDF files, use Cloudinary's transformation for inline viewing
    if (url.includes('.pdf')) {
      // Method 1: Use Cloudinary's inline parameter
      if (!viewUrl.includes('?')) {
        viewUrl += '?flags=inline';
      } else if (!viewUrl.includes('flags=')) {
        viewUrl += '&flags=inline';
      }
      
      // Method 2: Transform the URL structure for better PDF handling
      // If it's using /image/upload/, try using the direct URL
      if (viewUrl.includes('/image/upload/')) {
        viewUrl = viewUrl.replace('/image/upload/', '/raw/upload/');
      }
    }
  }
  
  console.log('🔧 Transformed URL for viewing:', viewUrl);
  
  // Create an iframe for PDF viewing
  const pdfViewer = document.createElement('iframe');
  pdfViewer.style.position = 'fixed';
  pdfViewer.style.top = '0';
  pdfViewer.style.left = '0';
  pdfViewer.style.width = '100vw';
  pdfViewer.style.height = '100vh';
  pdfViewer.style.zIndex = '9999';
  pdfViewer.style.border = 'none';
  pdfViewer.style.background = 'white';
  pdfViewer.src = viewUrl;
  
  // Add close button
  const closeButton = document.createElement('button');
  closeButton.textContent = '✕ Close';
  closeButton.style.position = 'fixed';
  closeButton.style.top = '20px';
  closeButton.style.right = '20px';
  closeButton.style.zIndex = '10000';
  closeButton.style.padding = '10px 15px';
  closeButton.style.background = '#dc3545';
  closeButton.style.color = 'white';
  closeButton.style.border = 'none';
  closeButton.style.borderRadius = '5px';
  closeButton.style.cursor = 'pointer';
  
  closeButton.onclick = () => {
    document.body.removeChild(pdfViewer);
    document.body.removeChild(closeButton);
  };
  
  document.body.appendChild(pdfViewer);
  document.body.appendChild(closeButton);
};

// Alternative: Simple new tab approach
const openDocumentSimple = (url) => {
  if (!url) return;
  
  let viewUrl = url;
  
  // For Cloudinary PDFs, try to force inline viewing
  if (url.includes('cloudinary.com') && url.includes('.pdf')) {
    // Remove download flags and add inline flag
    viewUrl = url.split('?')[0]; // Remove any existing parameters
    viewUrl += '?flags=inline';
  }
  
  console.log('📄 Opening in new tab:', viewUrl);
  window.open(viewUrl, '_blank', 'noopener,noreferrer');
};

  if (loading) {
    return <div className="loading">Loading admin dashboard...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Admin Dashboard</h1>
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
          <p>Pending Review</p>
        </div>
      </div>

      {/* Pending Applications */}
      <div className="card">
        <h2 style={{ marginBottom: '20px' }}>Pending Applications ({pendingApplications.length})</h2>
        
        {pendingApplications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            No pending applications to review.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>User Email</th>
                  <th>Certificate Type</th>
                  <th>Full Name</th>
                  <th>Applied Date</th>
                  <th>Document</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingApplications.map((app) => (
                  <tr key={app.id}>
                    <td>{app.Users?.email}</td>
                    <td>{app.certificate_type}</td>
                    <td>{app.full_name}</td>
                    <td>{new Date(app.created_at).toLocaleDateString()}</td>
                    <td>
  <button
    className="btn btn-primary"
    style={{ padding: '5px 15px', fontSize: '12px' }}
    onClick={() => openDocumentSimple(app.document_url)}
  >
    View Document
  </button>
</td>
                    <td style={{ display: 'flex', gap: '10px' }}>
                      <button
                        className="btn btn-success"
                        style={{ padding: '5px 10px', fontSize: '12px' }}
                        onClick={() => handleApprove(app.id)}
                        disabled={processing === app.id}
                      >
                        {processing === app.id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '5px 10px', fontSize: '12px' }}
                        onClick={() => handleReject(app.id)}
                        disabled={processing === app.id}
                      >
                        {processing === app.id ? 'Processing...' : 'Reject'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;