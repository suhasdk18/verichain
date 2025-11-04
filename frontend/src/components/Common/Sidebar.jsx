import React from 'react';
import { isAdmin } from '../../utils/auth';

const Sidebar = () => {
  const admin = isAdmin();

  return (
    <aside style={{
      width: '250px',
      background: '#2c3e50',
      color: 'white',
      minHeight: '100vh',
      padding: '20px 0'
    }}>
      <nav>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ padding: '15px 25px', borderBottom: '1px solid #34495e' }}>
            <a href={admin ? '/admin' : '/dashboard'} style={{ color: 'white', textDecoration: 'none' }}>
              {admin ? 'Admin Dashboard' : 'My Dashboard'}
            </a>
          </li>
          {!admin && (
            <>
              <li style={{ padding: '15px 25px', borderBottom: '1px solid #34495e' }}>
                <a href="#applications" style={{ color: 'white', textDecoration: 'none' }}>
                  My Applications
                </a>
              </li>
              <li style={{ padding: '15px 25px', borderBottom: '1px solid #34495e' }}>
                <a href="#new-application" style={{ color: 'white', textDecoration: 'none' }}>
                  New Application
                </a>
              </li>
            </>
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;