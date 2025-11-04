import React, { useState } from 'react';

const OTPVerification = ({ email, onVerify, onBack, type = 'login' }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onVerify(otp);
    } catch (error) {
      setError(error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
        {type === 'login' ? 'Login Verification' : 'Registration Verification'}
      </h2>
      
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Enter OTP</label>
          <input
            type="text"
            className="form-input"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength="6"
            placeholder="Enter 6-digit OTP"
            required
          />
          <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
            OTP sent to {email}
          </small>
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ width: '100%' }}
          disabled={loading}
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
        
        <button 
          type="button" 
          className="btn" 
          style={{ width: '100%', marginTop: '10px' }}
          onClick={onBack}
        >
          Back
        </button>
      </form>
    </div>
  );
};

export default OTPVerification;