import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running successfully!' });
});

// POST: Record a new ELD event
app.post('/api/eld/events', async (req, res) => {
  try {
    const { driverId, eventType, timestamp, location, notes } = req.body;

    if (!driverId || !eventType) {
      return res.status(400).json({ error: 'Missing required fields: driverId and eventType' });
    }

    const { data, error } = await supabase
      .from('eld_events')
      .insert([
        { 
          driver_id: driverId, 
          event_type: eventType, 
          timestamp: timestamp || new Date().toISOString(), 
          location, 
          notes 
        }
      ])
      .select();

    if (error) {
      throw error;
    }

    return res.status(201).json({ message: 'ELD event recorded successfully', data });
  } catch (err: any) {
    console.error('Error recording ELD event:', err.message);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// GET: Fetch ELD events for a specific driver
app.get('/api/eld/events/:driverId', async (req, res) => {
  try {
    const { driverId } = req.params;

    const { data, error } = await supabase
      .from('eld_events')
      .select('*')
      .eq('driver_id', driverId)
      .order('timestamp', { ascending: false });

    if (error) {
      throw error;
    }

    return res.status(200).json(data);
  } catch (err: any) {
    console.error('Error fetching ELD events:', err.message);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});