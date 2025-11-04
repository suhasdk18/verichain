import React from 'react';
import Header from '../components/Common/Header';
import Sidebar from '../components/Common/Sidebar';
import UserDashboard from '../components/Dashboard/UserDashboard';

const DashboardPage = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: '20px', backgroundColor: '#f5f5f5' }}>
          <UserDashboard />
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;