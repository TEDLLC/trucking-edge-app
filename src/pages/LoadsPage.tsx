import React, { useState } from 'react';

interface Load {
  id: string;
  broker: string;
  origin: string;
  destination: string;
  miles: number;
  rate: number;
  truck: string;
  status: 'Dispatched' | 'In Transit' | 'Delivered';
}

export function LoadsPage() {
  const [loads, setLoads] = useState<Load[]>([
    { id: 'LD-1001', broker: 'TQL', origin: 'Chicago, IL', destination: 'Dallas, TX', miles: 950, rate: 2850, truck: 'Freightliner #12', status: 'In Transit' }
  ]);

  const [broker, setBroker] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [miles, setMiles] = useState('');
  const [rate, setRate] = useState('');
  const [truck, setTruck] = useState('Freightliner #12');
  const [status, setStatus] = useState<'Dispatched' | 'In Transit' | 'Delivered'>('Dispatched');

  const handleAddLoad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broker || !origin || !destination || !miles || !rate) return;

    const newLoad: Load = {
      id: `LD-${Math.floor(1000 + Math.random() * 9000)}`,
      broker,
      origin,
      destination,
      miles: Number(miles),
      rate: Number(rate),
      truck,
      status
    };

    setLoads([newLoad, ...loads]);
    setBroker('');
    setOrigin('');
    setDestination('');
    setMiles('');
    setRate('');
  };

  return (
    <div style={{ color: '#f8fafc' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '8px' }}>Dispatch & RPM Management</h2>
      <p style={{ color: '#94a3b8', marginBottom: '24px' }}>Manage active freight, calculate rate per mile (RPM), and assign loads to your fleet.</p>

      {/* Add Load Form */}
      <form onSubmit={handleAddLoad} style={{ background: '#090d16', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px', color: '#38bdf8' }}>Dispatch New Load</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Broker / Shipper</label>
            <input type="text" placeholder="e.g. Echo, TQL" value={broker} onChange={(e) => setBroker(e.target.value)} required style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Origin</label>
            <input type="text" placeholder="City, ST" value={origin} onChange={(e) => setOrigin(e.target.value)} required style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Destination</label>
            <input type="text" placeholder="City, ST" value={destination} onChange={(e) => setDestination(e.target.value)} required style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Total Miles</label>
            <input type="number" placeholder="e.g. 850" value={miles} onChange={(e) => setMiles(e.target.value)} required style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Flat Rate ($)</label>
            <input type="number" placeholder="e.g. 2500" value={rate} onChange={(e) => setRate(e.target.value)} required style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Assigned Truck</label>
            <input type="text" value={truck} onChange={(e) => setTruck(e.target.value)} required style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff' }} />
          </div>
        </div>
        <button type="submit" style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          Add & Calculate RPM
        </button>
      </form>

      {/* Loads Table */}
      <div style={{ background: '#090d16', borderRadius: '12px', border: '1px solid #1e293b', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#1e293b', color: '#94a3b8' }}>
              <th style={{ padding: '12px 16px' }}>Load ID</th>
              <th style={{ padding: '12px 16px' }}>Broker</th>
              <th style={{ padding: '12px 16px' }}>Route</th>
              <th style={{ padding: '12px 16px' }}>Miles</th>
              <th style={{ padding: '12px 16px' }}>Rate</th>
              <th style={{ padding: '12px 16px' }}>RPM</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loads.map((load) => {
              const rpm = load.miles > 0 ? (load.rate / load.miles).toFixed(2) : '0.00';
              return (
                <tr key={load.id} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 'bold' }}>{load.id}</td>
                  <td style={{ padding: '14px 16px' }}>{load.broker}</td>
                  <td style={{ padding: '14px 16px', color: '#cbd5e1' }}>{load.origin} ➔ {load.destination}</td>
                  <td style={{ padding: '14px 16px' }}>{load.miles} mi</td>
                  <td style={{ padding: '14px 16px', color: '#4ade80', fontWeight: 'bold' }}>${load.rate}</td>
                  <td style={{ padding: '14px 16px', color: '#facc15', fontWeight: 'bold' }}>${rpm}/mi</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', background: load.status === 'In Transit' ? '#1e3a8a' : '#065f46', color: '#fff' }}>
                      {load.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}