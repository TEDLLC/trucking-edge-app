import React, { useState } from 'react';

interface EldRecord {
  id: string;
  driverName: string;
  dutyStatus: 'Driving' | 'On Duty (ND)' | 'Sleeping Berth' | 'Off Duty';
  hoursLeft: number;
  location: string;
  date: string;
}

interface Driver {
  name: string;
}

interface EldPageProps {
  drivers: Driver[];
}

export const EldPage: React.FC<EldPageProps> = ({ drivers }) => {
  const [logs, setLogs] = useState<EldRecord[]>([
    { id: 'ELD-501', driverName: 'John Doe', dutyStatus: 'Driving', hoursLeft: 8.5, location: 'St. Louis, MO', date: '2026-08-02' }
  ]);

  const [driverName, setDriverName] = useState(drivers[0]?.name || 'John Doe');
  const [dutyStatus, setDutyStatus] = useState<'Driving' | 'On Duty (ND)' | 'Sleeping Berth' | 'Off Duty'>('Driving');
  const [hoursLeft, setHoursLeft] = useState('11.0');
  const [location, setLocation] = useState('Chicago, IL');

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: EldRecord = {
      id: `ELD-${Math.floor(1000 + Math.random() * 9000)}`,
      driverName,
      dutyStatus,
      hoursLeft: parseFloat(hoursLeft) || 0,
      location,
      date: new Date().toISOString().split('T')[0]
    };
    setLogs([newLog, ...logs]);
    setLocation('');
  };

  return (
    <div style={{ color: '#f8fafc' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '8px' }}>ELD & Hours of Service (HOS)</h2>
      <p style={{ color: '#94a3b8', marginBottom: '24px' }}>Monitor compliance logs, driver duty availability, and real-time HOS tracking.</p>

      {/* Compliance Log Form */}
      <form onSubmit={handleAddLog} style={{ background: '#090d16', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px', color: '#38bdf8' }}>Update Compliance Log</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Driver Name</label>
            <select value={driverName} onChange={(e) => setDriverName(e.target.value)} style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff' }}>
              {drivers.map((d, idx) => <option key={idx} value={d.name}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Duty Status</label>
            <select value={dutyStatus} onChange={(e) => setDutyStatus(e.target.value as any)} style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff' }}>
              <option value="Driving">Driving</option>
              <option value="On Duty (ND)">On Duty (ND)</option>
              <option value="Sleeping Berth">Sleeping Berth</option>
              <option value="Off Duty">Off Duty</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Hours Left (HOS)</label>
            <input type="number" step="0.1" value={hoursLeft} onChange={(e) => setHoursLeft(e.target.value)} required style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Current Location</label>
            <input type="text" placeholder="e.g. St. Louis, MO" value={location} onChange={(e) => setLocation(e.target.value)} required style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff' }} />
          </div>
        </div>
        <button type="submit" style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          Record ELD Event
        </button>
      </form>

      {/* Logs Table */}
      <div style={{ background: '#090d16', borderRadius: '12px', border: '1px solid #1e293b', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#1e293b', color: '#94a3b8' }}>
              <th style={{ padding: '12px 16px' }}>Log ID</th>
              <th style={{ padding: '12px 16px' }}>Driver</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px' }}>Hours Remaining</th>
              <th style={{ padding: '12px 16px' }}>Location</th>
              <th style={{ padding: '12px 16px' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} style={{ borderBottom: '1px solid #1e293b' }}>
                <td style={{ padding: '14px 16px', fontWeight: 'bold' }}>{log.id}</td>
                <td style={{ padding: '14px 16px', color: '#fff' }}>{log.driverName}</td>
                <td style={{ padding: '14px 16px', color: '#38bdf8' }}>{log.dutyStatus}</td>
                <td style={{ padding: '14px 16px', color: log.hoursLeft < 3 ? '#ef4444' : '#4ade80', fontWeight: 'bold' }}>{log.hoursLeft} hrs</td>
                <td style={{ padding: '14px 16px', color: '#cbd5e1' }}>{log.location}</td>
                <td style={{ padding: '14px 16px', color: '#94a3b8' }}>{log.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};