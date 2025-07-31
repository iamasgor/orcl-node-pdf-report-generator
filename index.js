const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const ReportManager = require('./services/ReportManager');

const app = express();
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

// Initialize report manager
const reportManager = new ReportManager();

// Routes
app.use('/api/reports', reportManager.getRouter());

// Legacy route for backward compatibility
app.use('/doa', require('./routes/doa'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// HTTPS setup later via NGINX or direct with SSL certs
app.listen(process.env.PORT, () => {
  console.log(`Server running securely on port ${process.env.PORT}`);
  console.log('Available reports:');
  reportManager.getAllReports().forEach(report => {
    console.log(`  - ${report.name}: ${report.description}`);
  });
});
