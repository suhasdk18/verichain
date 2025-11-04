import React from 'react';
import { getUser, logout } from '../../utils/auth';

const Header = () => {
  const user = getUser();

  return (
    <header style={{
      background: 'white',
      padding: '15px 30px',
      borderBottom: '1px solid #ddd',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <h1 style={{ margin: 0, color: '#333' }}>
        VeriChain {user?.role === 'admin' ? 'Admin' : 'Dashboard'}
      </h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <span>Welcome, {user?.email}</span>
        <button 
          onClick={logout}
          className="btn btn-danger"
          style={{ padding: '8px 15px' }}
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;