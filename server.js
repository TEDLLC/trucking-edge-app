import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Centralized in-memory compliance database simulation
let complianceLogs = [
  { id: '1', region: 'US', driverName: 'John Doe', status: 'DRIVING', hours: 8.5, location: 'Chicago, IL', date: new Date().toISOString() },
  { id: '2', region: 'EU', driverName: 'Janis Kask', status: 'REST', hours: 4.5, location: 'Berlin, DE', date: new Date().toISOString() }
];

// API Routes
app.get('/api/logs', (req, res) => {
  const { region } = req.query;
  if (region) {
    return res.json(complianceLogs.filter(l => l.region === region));
  }
  res.json(complianceLogs);
});

app.post('/api/logs', (req, res) => {
  const newLog = {
    id: 'log-' + Date.now(),
    region: req.body.region || 'US',
    driverName: req.body.driverName || 'Unknown Driver',
    status: req.body.status || 'DRIVING',
    hours: req.body.hours || 0,
    location: req.body.location || 'Unknown Location',
    date: new Date().toISOString()
  };
  complianceLogs.unshift(newLog);
  res.status(201).json(newLog);
});

app.get('/api/loads', (req, res) => {
  res.json([
    { id: 1, loadNumber: 'LD-1001', origin: 'Chicago, IL', destination: 'Detroit, MI', status: 'In Transit' },
    { id: 2, loadNumber: 'LD-1002', origin: 'Dallas, TX', destination: 'Houston, TX', status: 'Delivered' }
  ]);
});

// Start Server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});