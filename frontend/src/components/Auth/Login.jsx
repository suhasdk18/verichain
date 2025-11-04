import React, { useState } from 'react';
import { authAPI } from '../../utils/api';

const Login = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    aadhaar_number: ''
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

  const handleLoginInitiate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authAPI.loginInitiate(formData);
      setStep(2);
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginFinalize = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.loginFinalize({
        email: formData.email,
        otp
      });
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      if (response.data.user.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (error) {
      setError(error.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Login to VeriChain</h2>
      
      {error && <div className="error">{error}</div>}

      {step === 1 ? (
        <form onSubmit={handleLoginInitiate}>
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
        <form onSubmit={handleLoginFinalize}>
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
            {loading ? 'Verifying...' : 'Verify OTP'}
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

export default Login;