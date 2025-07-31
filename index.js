const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const reportRoute = require('./routes/report');

const app = express();
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

// Routes
app.use('/api/report', reportRoute);

// HTTPS setup later via NGINX or direct with SSL certs
app.listen(process.env.PORT, () => {
  console.log(`Server running securely on port ${process.env.PORT}`);
});
