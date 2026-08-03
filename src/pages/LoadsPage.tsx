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
    <div className="content-grid">
      <div className="card table-card">
        <h2>Active Dispatches</h2>
        <table>
          <thead>
            <tr>
              <th>Load ID</th>
              <th>Route</th>
              <th>Miles</th>
              <th>Gross Rate</th>
              <th>RPM</th>
              <th>Driver</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loads.map(l => {
              const rpm = l.miles > 0 ? (l.rate / l.miles).toFixed(2) : 'N/A';
              return (
                <tr key={l.id}>
                  <td><strong>{l.id}</strong></td>
                  <td>{l.origin} ➔ {l.destination}</td>
                  <td>{l.miles} mi</td>
                  <td>${l.rate.toLocaleString()}</td>
                  <td><strong style={{ color: '#f59e0b' }}>${rpm}/mi</strong></td>
                  <td>{l.driver}</td>
                  <td>
                    <select 
                      value={l.status} 
                      onChange={(e) => onUpdateLoadStatus(l.id, e.target.value as any)}
                      className="status-select"
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

      <div className="card form-card">
        <h2>Book New Freight</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Pickup Location</label>
            <input type="text" placeholder="e.g. Chicago, IL" value={origin} onChange={(e) => setOrigin(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Delivery Location</label>
            <input type="text" placeholder="e.g. Dallas, TX" value={destination} onChange={(e) => setDestination(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Total Miles</label>
            <input type="number" placeholder="e.g. 925" value={miles} onChange={(e) => setMiles(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Gross Rate ($)</label>
            <input type="number" placeholder="e.g. 2500" value={rate} onChange={(e) => setRate(e.target.value)} required />
          </div>

          {parseFloat(miles) > 0 && parseFloat(rate) > 0 && (
            <div style={{ padding: '12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', marginBottom: '14px', textAlign: 'center' }}>
              Calculated RPM: <strong style={{ color: '#f59e0b' }}>${(parseFloat(rate) / parseFloat(miles)).toFixed(2)} / mi</strong>
            </div>
          )}

          <div className="form-group">
            <label>Assign Driver</label>
            <select value={driver} onChange={(e) => setDriver(e.target.value)} className="status-select">
              <option value="">Unassigned</option>
              {drivers.map(d => <option key={d.id} value={d.name}>{d.name} ({d.truck})</option>)}
            </select>
          </div>
          <button type="submit" className="btn-primary">Dispatch Freight</button>
        </form>
      </div>
    </div>
  );
};