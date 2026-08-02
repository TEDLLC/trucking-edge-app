import React, { useState } from 'react';

interface FuelRecord {
  id: string;
  truck: string;
  location: string;
  gallons: number;
  totalCost: number;
  date: string;
}

interface FuelStation {
  name: string;
  chain: string;
  price: string;
  amenities: string[];
}

export const FuelPage: React.FC = () => {
  const [fuelLogs, setFuelLogs] = useState<FuelRecord[]>([
    { id: 'FUEL-901', truck: 'Freightliner #12', location: "Pilot #451 - Effingham, IL", gallons: 145.5, totalCost: 523.80, date: '2026-08-01' }
  ]);

  const [origin, setOrigin] = useState('Chicago, IL');
  const [destination, setDestination] = useState('Dallas, TX');
  const [stations, setStations] = useState<FuelStation[]>([
    { name: 'Pilot Travel Center #382', chain: 'Pilot', price: '$3.59/gal', amenities: ['Truck Parking', 'Scales', 'Showers'] },
    { name: 'Love\'s Travel Stop #619', chain: 'Loves', price: '$3.52/gal', amenities: ['DEF at Pump', 'Tire Care', 'Subway'] },
    { name: 'Flying J Travel Plaza #81', chain: 'Flying J', price: '$3.64/gal', amenities: ['CAT Scales', 'Restaraunts', 'Reserved Parking'] }
  ]);

  // Form states
  const [truck, setTruck] = useState('Freightliner #12');
  const [location, setLocation] = useState('');
  const [gallons, setGallons] = useState('');
  const [totalCost, setTotalCost] = useState('');

  const handleRouteSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate dynamic fuel corridor stations fetched along origin -> destination route
    setStations([
      { name: `Pilot Travel Center (${origin} Corridor)`, chain: 'Pilot', price: '$3.55/gal', amenities: ['Truck Parking', 'Scales'] },
      { name: `Love's Travel Stop (Midway Route)`, chain: 'Loves', price: '$3.49/gal', amenities: ['DEF at Pump', 'Tire Care'] },
      { name: `TA Travel Center (${destination} Approach)`, chain: 'TA', price: '$3.62/gal', amenities: ['Full Repair Shop', 'Showers'] }
    ]);
  };

  const handleAddFuel = (e: React.FormEvent) => {
    e.preventDefault();
    const g = parseFloat(gallons) || 0;
    const c = parseFloat(totalCost) || 0;
    if (g <= 0 || c <= 0) return;

    const newRecord: FuelRecord = {
      id: `FUEL-${Math.floor(1000 + Math.random() * 9000)}`,
      truck,
      location,
      gallons: g,
      totalCost: c,
      date: new Date().toISOString().split('T')[0]
    };

    setFuelLogs([newRecord, ...fuelLogs]);
    setLocation('');
    setGallons('');
    setTotalCost('');
  };

  return (
    <div style={{ color: '#f8fafc' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '8px' }}>Fuel Map & IFTA Logs</h2>
      <p style={{ color: '#94a3b8', marginBottom: '24px' }}>Optimize corridor routing, track real-time fuel prices along lanes, and record purchases.</p>

      {/* Corridor Route Fuel Planner Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        
        {/* Route Planner */}
        <div style={{ background: '#090d16', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px', color: '#38bdf8' }}>Route Fuel Corridor</h3>
          <form onSubmit={handleRouteSearch}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Origin Hub</label>
              <input type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} required style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff' }} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Destination Hub</label>
              <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} required style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff' }} />
            </div>
            <button type="submit" style={{ width: '100%', background: '#3b82f6', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              Find Stations On Route
            </button>
          </form>
        </div>

        {/* Stations Along Route Display */}
        <div style={{ background: '#090d16', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b', maxHeight: '300px', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '12px', color: '#4ade80' }}>Recommended Stops Along Lane</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {stations.map((st, idx) => (
              <div key={idx} style={{ background: '#020617', padding: '10px 14px', borderRadius: '8px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#fff' }}>{st.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{st.amenities.join(' • ')}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#facc15', fontWeight: 'bold', fontSize: '0.95rem' }}>{st.price}</div>
                  <button 
                    onClick={() => setLocation(st.name)}
                    style={{ background: '#1e293b', color: '#38bdf8', border: '1px solid #334155', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', marginTop: '4px' }}
                  >
                    Select Stop
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Record Fuel Form */}
      <form onSubmit={handleAddFuel} style={{ background: '#090d16', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px', color: '#38bdf8' }}>Record Fuel Purchase</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Truck ID</label>
            <input type="text" value={truck} onChange={(e) => setTruck(e.target.value)} required style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Truck Stop / Location</label>
            <input type="text" placeholder="Select above or type location" value={location} onChange={(e) => setLocation(e.target.value)} required style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Gallons</label>
            <input type="number" step="0.1" placeholder="e.g. 120" value={gallons} onChange={(e) => setGallons(e.target.value)} required style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Total Cost ($)</label>
            <input type="number" step="0.01" placeholder="e.g. 450.00" value={totalCost} onChange={(e) => setTotalCost(e.target.value)} required style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff' }} />
          </div>
        </div>

        {parseFloat(gallons) > 0 && parseFloat(totalCost) > 0 && (
          <div style={{ padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', marginBottom: '14px', textAlign: 'center', fontSize: '0.9rem' }}>
            Effective Price: <strong style={{ color: '#38bdf8' }}>${(parseFloat(totalCost) / parseFloat(gallons)).toFixed(3)} / gal</strong>
          </div>
        )}

        <button type="submit" style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          Log Fuel Entry
        </button>
      </form>

      {/* Fuel Table */}
      <div style={{ background: '#090d16', borderRadius: '12px', border: '1px solid #1e293b', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#1e293b', color: '#94a3b8' }}>
              <th style={{ padding: '12px 16px' }}>Record ID</th>
              <th style={{ padding: '12px 16px' }}>Truck</th>
              <th style={{ padding: '12px 16px' }}>Location</th>
              <th style={{ padding: '12px 16px' }}>Gallons</th>
              <th style={{ padding: '12px 16px' }}>Total Cost</th>
              <th style={{ padding: '12px 16px' }}>PPU</th>
              <th style={{ padding: '12px 16px' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {fuelLogs.map((log) => {
              const ppu = (log.totalCost / log.gallons).toFixed(3);
              return (
                <tr key={log.id} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 'bold' }}>{log.id}</td>
                  <td style={{ padding: '14px 16px', color: '#38bdf8' }}>{log.truck}</td>
                  <td style={{ padding: '14px 16px', color: '#fff' }}>{log.location}</td>
                  <td style={{ padding: '14px 16px' }}>{log.gallons} gal</td>
                  <td style={{ padding: '14px 16px', color: '#4ade80', fontWeight: 'bold' }}>${log.totalCost.toFixed(2)}</td>
                  <td style={{ padding: '14px 16px', color: '#facc15' }}>${ppu}/gal</td>
                  <td style={{ padding: '14px 16px', color: '#94a3b8' }}>{log.date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};