import React, { useState } from 'react';
import { authAPI } from '../../utils/api';

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    aadhaar_number: '',
    phone_number: ''
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegisterInitiate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await authAPI.registerInitiate({
        email: formData.email,
        password: formData.password,
        aadhaar_number: formData.aadhaar_number,
        phone_number: formData.phone_number
      });
      setStep(2);
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterFinalize = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authAPI.registerFinalize({
        email: formData.email,
        otp
      });
      
      // Redirect to login
      window.location.href = '/';
    } catch (error) {
      setError(error.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Register for VeriChain</h2>
      
      {error && <div className="error">{error}</div>}

      {step === 1 ? (
        <form onSubmit={handleRegisterInitiate}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-input"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Aadhaar Number</label>
            <input
              type="text"
              name="aadhaar_number"
              className="form-input"
              value={formData.aadhaar_number}
              onChange={handleInputChange}
              maxLength="12"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="text"
              name="phone_number"
              className="form-input"
              value={formData.phone_number}
              onChange={handleInputChange}
              maxLength="10"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegisterFinalize}>
          <div className="form-group">
            <label className="form-label">Enter OTP</label>
            <input
              type="text"
              className="form-input"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength="6"
              required
            />
            <small style={{ color: '#666' }}>
              OTP sent to {formData.email}
            </small>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify OTP & Register'}
          </button>
          
          <button 
            type="button" 
            className="btn" 
            style={{ width: '100%', marginTop: '10px' }}
            onClick={() => setStep(1)}
          >
            Back
          </button>
        </form>
      )}
    </div>
  );
};

export default Register;