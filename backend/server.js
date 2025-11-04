const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/applications', require('./routes/Applications'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/download', require('./routes/download'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/analytics', require('./routes/analytics'));
// Add this with your other routes
app.use('/api/upload', require('./routes/upload'));
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});