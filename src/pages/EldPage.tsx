import React, { useState, useEffect } from 'react';
import { useRegionStore } from '../services/useRegion';
import { EuHosView } from '../components/EuHosView';
import { EUComplianceModule } from '../components/EUComplianceModule';
import { EuViolationAlert } from '../components/EuViolationAlert';
import { EuDddExport } from '../components/EuDddExport';
import { EuBorderCrossingLog } from '../components/EuBorderCrossingLog';

export function EldPage() {
  const { region } = useRegionStore();
  
  // Track region state directly from localStorage so it re-renders immediately on toggle
  const [currentRegion, setCurrentRegion] = useState<string>(() => {
    return localStorage.getItem('regionMode') || region || 'US (FMCSA)';
  });

  useEffect(() => {
    const syncRegion = () => {
      const stored = localStorage.getItem('regionMode');
      if (stored) setCurrentRegion(stored);
    };

    // Listen to custom/storage events when switching regions in top bar
    window.addEventListener('storage', syncRegion);
    const interval = setInterval(syncRegion, 500); // Polling backup for same-window updates

    return () => {
      window.removeEventListener('storage', syncRegion);
      clearInterval(interval);
    };
  }, []);

  const isEU = currentRegion.includes('EU') || region === 'EU' || region?.includes('EU');

  const [logs, setLogs] = useState<Array<{ id: string; driverName: string; status: string; hours: number; location: string; date: string }>>([
    { id: '1', driverName: 'John Doe', status: 'DRIVING', hours: 8.5, location: 'Chicago, IL', date: new Date().toISOString() }
  ]);

  const [drivers] = useState([
    { id: 'driver-001', firstName: 'John', lastName: 'Doe' },
    { id: 'driver-002', firstName: 'Sarah', lastName: 'Jenkins' },
    { id: 'driver-003', firstName: 'Mike', lastName: 'Ross' }
  ]);

  const [driverName, setDriverName] = useState('John Doe');
  const [status, setStatus] = useState('DRIVING');
  const [hours, setHours] = useState('11.0');
  const [location, setLocation] = useState('Chicago, IL');

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedHours = parseFloat(hours) || 0;
    if (parsedHours <= 0) return;

    const newLog = {
      id: 'local-' + Date.now(),
      driverName: driverName || 'John Doe',
      status,
      location: location || 'Unknown Location',
      hours: parsedHours,
      date: new Date().toISOString()
    };

    setLogs([newLog, ...logs]);
    setLocation('');
    setHours('11.0');
  };

  return (
    <div style={{ color: '#f8fafc' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '8px' }}>
          {isEU ? '🇪🇺 EU Tachograph & HOS Compliance' : '📟 ELD & Hours of Service (HOS)'}
        </h2>
        <p style={{ color: '#94a3b8', margin: 0 }}>
          Monitor compliance logs, driver duty availability, and real-time HOS tracking ({currentRegion}).
        </p>
      </div>

      {/* Conditional View: Render Full EU suite if EU mode is toggled */}
      {isEU && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <EuViolationAlert />
          <EUComplianceModule />
          <EuHosView />
          <EuBorderCrossingLog />
          <EuDddExport />
        </div>
      )}

      {/* US Standard View */}
      {!isEU && (
        <>
          {/* Compliance Log Form */}
          <form onSubmit={handleAddLog} style={{ background: '#090d16', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px', color: '#38bdf8' }}>Update US Compliance Log</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Driver Name</label>
                <select 
                  value={driverName} 
                  onChange={(e) => setDriverName(e.target.value)} 
                  style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', outline: 'none' }}
                >
                  {drivers.map((d) => {
                    const fullName = `${d.firstName} ${d.lastName}`;
                    return <option key={d.id} value={fullName}>{fullName}</option>;
                  })}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Duty Status</label>
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)} 
                  style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', outline: 'none' }}
                >
                  <option value="DRIVING">Driving</option>
                  <option value="ON_DUTY">On Duty (ND)</option>
                  <option value="SLEEPER">Sleeping Berth</option>
                  <option value="OFF_DUTY">Off Duty</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Hours Logged / Remaining</label>
                <input type="number" step="0.1" value={hours} onChange={(e) => setHours(e.target.value)} required style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Current Location</label>
                <input type="text" placeholder="e.g. St. Louis, MO" value={location} onChange={(e) => setLocation(e.target.value)} required style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', outline: 'none' }} />
              </div>
            </div>
            <button type="submit" style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              Record ELD Event
            </button>
          </form>

          {/* Logs Table */}
          <div style={{ background: '#090d16', borderRadius: '12px', border: '1px solid #1e293b', overflow: 'hidden' }}>
            {logs.length === 0 ? (
              <p style={{ padding: '16px', color: '#94a3b8' }}>No compliance logs found. Record your first ELD event above!</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#1e293b', color: '#94a3b8' }}>
                    <th style={{ padding: '12px 16px' }}>Log ID</th>
                    <th style={{ padding: '12px 16px' }}>Driver</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Hours</th>
                    <th style={{ padding: '12px 16px' }}>Location</th>
                    <th style={{ padding: '12px 16px' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 'bold' }}>{log.id.slice(0, 8)}...</td>
                      <td style={{ padding: '14px 16px', color: '#fff' }}>{log.driverName}</td>
                      <td style={{ padding: '14px 16px', color: '#38bdf8' }}>{log.status}</td>
                      <td style={{ padding: '14px 16px', color: log.hours < 3 ? '#ef4444' : '#4ade80', fontWeight: 'bold' }}>{log.hours} hrs</td>
                      <td style={{ padding: '14px 16px', color: '#cbd5e1' }}>{log.location}</td>
                      <td style={{ padding: '14px 16px', color: '#94a3b8' }}>{new Date(log.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}