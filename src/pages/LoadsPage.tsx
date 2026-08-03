import React, { useState } from 'react';

interface Load {
  id: string;
  origin: string;
  destination: string;
  driver: string;
  rate: number;
  miles: number;
  fuelCost: number;
  status: 'Pending' | 'In Transit' | 'Delivered' | 'Cancelled';
  date: string;
}

interface Driver {
  id: string;
  name: string;
  truck: string;
}

interface LoadsPageProps {
  loads: Load[];
  drivers: Driver[];
  onAddLoad: (load: Load) => void;
  onUpdateLoadStatus: (id: string, status: Load['status']) => void;
}

export const LoadsPage: React.FC<LoadsPageProps> = ({ loads, drivers, onAddLoad, onUpdateLoadStatus }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [driver, setDriver] = useState('');
  const [rate, setRate] = useState('');
  const [miles, setMiles] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLoad: Load = {
      id: `TED-${Math.floor(1000 + Math.random() * 9000)}`,
      origin,
      destination,
      driver: driver || 'Unassigned',
      rate: parseFloat(rate) || 0,
      miles: parseFloat(miles) || 0,
      fuelCost: 0,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
    };
    onAddLoad(newLoad);
    setOrigin(''); setDestination(''); setDriver(''); setRate(''); setMiles('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Active Dispatches Section */}
      <div style={{ background: '#0b1329', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ color: '#f8fafc', fontSize: '1.15rem', fontWeight: 600, margin: 0 }}>Active Dispatches & Rate Per Mile</h2>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8', background: '#1e293b', padding: '4px 10px', borderRadius: '6px' }}>{loads.length} Active Loads</span>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#cbd5e1' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e293b', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '12px 16px' }}>Load ID</th>
                <th style={{ padding: '12px 16px' }}>Route</th>
                <th style={{ padding: '12px 16px' }}>Miles</th>
                <th style={{ padding: '12px 16px' }}>Gross Rate</th>
                <th style={{ padding: '12px 16px' }}>RPM</th>
                <th style={{ padding: '12px 16px' }}>Driver</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loads.map(l => {
                const rpm = l.miles > 0 ? (l.rate / l.miles).toFixed(2) : 'N/A';
                return (
                  <tr key={l.id} style={{ borderBottom: '1px solid #1e293b', transition: 'background 0.2s' }}>
                    <td style={{ padding: '16px' }}><code style={{ color: '#38bdf8', fontWeight: 600, background: '#020617', padding: '4px 8px', borderRadius: '4px' }}>{l.id}</code></td>
                    <td style={{ padding: '16px', fontWeight: 500, color: '#f1f5f9' }}>{l.origin} <span style={{ color: '#64748b', margin: '0 4px' }}>➔</span> {l.destination}</td>
                    <td style={{ padding: '16px', color: '#94a3b8' }}>{l.miles} mi</td>
                    <td style={{ padding: '16px', fontWeight: 600, color: '#f8fafc' }}>${l.rate.toLocaleString()}</td>
                    <td style={{ padding: '16px' }}><span style={{ color: '#f59e0b', fontWeight: 700, background: 'rgba(245, 158, 11, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>${rpm}/mi</span></td>
                    <td style={{ padding: '16px', color: '#e2e8f0' }}>{l.driver}</td>
                    <td style={{ padding: '16px' }}>
                      <select 
                        value={l.status} 
                        onChange={(e) => onUpdateLoadStatus(l.id, e.target.value as any)}
                        style={{ background: '#020617', color: '#f8fafc', border: '1px solid #334155', borderRadius: '6px', padding: '6px 12px', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book New Freight Form Card (Compact Grid Layout) */}
      <div style={{ background: '#0b1329', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)' }}>
        <h2 style={{ color: '#f8fafc', fontSize: '1.15rem', fontWeight: 600, marginBottom: '20px' }}>Book New Freight</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500 }}>Pickup Location</label>
              <input type="text" placeholder="e.g. Chicago, IL" value={origin} onChange={(e) => setOrigin(e.target.value)} required style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '8px', padding: '10px 14px', color: '#f8fafc', outline: 'none', fontSize: '0.9rem' }} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500 }}>Delivery Location</label>
              <input type="text" placeholder="e.g. Dallas, TX" value={destination} onChange={(e) => setDestination(e.target.value)} required style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '8px', padding: '10px 14px', color: '#f8fafc', outline: 'none', fontSize: '0.9rem' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500 }}>Total Miles</label>
              <input type="number" placeholder="e.g. 925" value={miles} onChange={(e) => setMiles(e.target.value)} required style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '8px', padding: '10px 14px', color: '#f8fafc', outline: 'none', fontSize: '0.9rem' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500 }}>Gross Rate ($)</label>
              <input type="number" placeholder="e.g. 2500" value={rate} onChange={(e) => setRate(e.target.value)} required style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '8px', padding: '10px 14px', color: '#f8fafc', outline: 'none', fontSize: '0.9rem' }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#020617', padding: '14px 20px', borderRadius: '8px', border: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, maxWidth: '300px' }}>
              <label style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500 }}>Assign Driver</label>
              <select value={driver} onChange={(e) => setDriver(e.target.value)} style={{ background: '#0b1329', border: '1px solid #334155', borderRadius: '6px', padding: '8px 12px', color: '#f8fafc', outline: 'none', fontSize: '0.85rem' }}>
                <option value="">Unassigned</option>
                {drivers.map(d => <option key={d.id} value={d.name}>{d.name} ({d.truck})</option>)}
              </select>
            </div>

            {parseFloat(miles) > 0 && parseFloat(rate) > 0 ? (
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block' }}>Estimated Target RPM</span>
                <span style={{ color: '#f59e0b', fontSize: '1.25rem', fontWeight: 700 }}>${(parseFloat(rate) / parseFloat(miles)).toFixed(2)} / mi</span>
              </div>
            ) : (
              <div style={{ textAlign: 'right', color: '#64748b', fontSize: '0.85rem' }}>
                Enter miles & rate to preview RPM
              </div>
            )}
          </div>

          <button type="submit" style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '12px 24px', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', alignSelf: 'flex-end', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)', transition: 'opacity 0.2s' }}>
            Dispatch Freight
          </button>
        </form>
      </div>
    </div>
  );
};