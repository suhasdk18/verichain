import React, { useState } from 'react';
import { isAuthenticated } from '../utils/auth';
import Login from '../components/Auth/Login';
import Register from '../components/Auth/Register';

const Home = () => {
  const [activeTab, setActiveTab] = useState('login');
  const isLoggedIn = isAuthenticated();

  if (isLoggedIn) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user.role === 'admin') {
      window.location.href = '/admin';
    } else {
      window.location.href = '/dashboard';
    }
    return null;
  }

  return (
    <div className="container" style={{ maxWidth: '500px', marginTop: '50px' }}>
      <div className="card">
        <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '20px' }}>
          <button
            style={{
              flex: 1,
              padding: '15px',
              border: 'none',
              background: activeTab === 'login' ? '#007bff' : 'transparent',
              color: activeTab === 'login' ? 'white' : '#333',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            style={{
              flex: 1,
              padding: '15px',
              border: 'none',
              background: activeTab === 'register' ? '#007bff' : 'transparent',
              color: activeTab === 'register' ? 'white' : '#333',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('register')}
          >
            Register
          </button>
        </div>

        {activeTab === 'login' ? <Login /> : <Register />}
      </div>
    </div>
  );
};

export default Home;