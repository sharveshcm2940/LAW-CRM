const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const apiRoutes = require('./routes/api');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static mock uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Main API Router
app.use('/api', apiRoutes);

// Root health endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'LexOS Law Firm Operating System API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 LAW-CRM Server running on http://localhost:${PORT}`);
});
