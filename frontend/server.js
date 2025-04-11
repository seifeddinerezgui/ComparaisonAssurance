// Simple Express server to serve static files for development
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 5000;

// Set up CORS to allow requests from any origin during development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'src')));

// Simple API mock for development
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', message: 'Frontend server is running!' });
});

// For all API requests, respond with a message
app.use('/api', (req, res) => {
  res.json({
    message: 'API request received. In production, this would be handled by the backend.',
    endpoint: req.originalUrl
  });
});

// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/index.html'));
});

// Fallback route for SPA
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'src/index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});