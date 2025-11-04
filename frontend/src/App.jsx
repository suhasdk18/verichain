import React from 'react';
import { Navigate } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import ChatbotWidget from './components/Chatbot/ChatbotWidget';
import ProtectedRoute from './components/Common/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* Protected User Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminPage />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {/* Show chatbot only for authenticated users */}
        <ChatbotWidget />
      </div>
    </Router>
  );
}

export default App;