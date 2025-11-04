const express = require('express');
const cors = require('cors');
require('dotenv').config();

console.log('🚀 Starting VeriChain Server...');

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'VeriChain Server is running',
    timestamp: new Date().toISOString()
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!',
    version: '1.0.0'
  });
});

// Routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// 404 handler - SIMPLIFIED: Remove the problematic wildcard
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({ 
    success: false,
    error: 'Internal server error'
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  console.log(`✅ Test route: http://localhost:${PORT}/api/test`);
  console.log(`✅ Debug users: http://localhost:${PORT}/api/debug/users`);
});