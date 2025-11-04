import React, { useState } from 'react';
import { applicationsAPI } from '../../utils/api';
import DocumentUpload from '../FileUpload/DocumentUpload';

const ApplicationForm = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    father_name: '',
    address: '',
    certificate_type: ''
  });
  const [documentUrl, setDocumentUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const certificateTypes = [
    'Birth Certificate',
    'Marriage Certificate',
    'Death Certificate',
    'Income Certificate',
    'Caste Certificate',
    'Domicile Certificate',
    'Character Certificate'
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUploadComplete = (url) => {
    setDocumentUrl(url);
    setMessage('Document uploaded successfully!');
  };

  const handleUploadError = (error) => {
    setMessage(error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Validate form
      if (!documentUrl) {
        setMessage('Please upload a supporting document first');
        setLoading(false);
        return;
      }

      // Submit application
      await applicationsAPI.apply({
        ...formData,
        document_url: documentUrl
      });

      setMessage('Application submitted successfully!');
      
      // Reset form
      setFormData({
        full_name: '',
        father_name: '',
        address: '',
        certificate_type: ''
      });
      setDocumentUrl('');

    } catch (error) {
      setMessage(error.response?.data?.message || 'Application submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '20px' }}>New Certificate Application</h2>
      
      {message && (
        <div className={message.includes('success') ? 'success' : 'error'}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Certificate Type *</label>
          <select
            name="certificate_type"
            className="form-input"
            value={formData.certificate_type}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Certificate Type</option>
            {certificateTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input
            type="text"
            name="full_name"
            className="form-input"
            value={formData.full_name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Father's Name *</label>
          <input
            type="text"
            name="father_name"
            className="form-input"
            value={formData.father_name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Address *</label>
          <textarea
            name="address"
            className="form-input"
            rows="4"
            value={formData.address}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Supporting Document *</label>
          <DocumentUpload
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
          />
          {documentUrl && (
            <div style={{ marginTop: '10px', color: '#28a745', fontSize: '14px' }}>
              ✅ Document uploaded successfully
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ width: '100%' }}
          disabled={loading || !documentUrl}
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
};

export default ApplicationForm;