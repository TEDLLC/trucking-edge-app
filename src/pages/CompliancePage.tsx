import React, { useState, useEffect } from 'react';
import { getEldLogs, createEldLog } from '../utils/eldService';
import { getDrivers } from '../utils/fleetService';
import { useRegionStore } from '../services/useRegion';

export function CompliancePage() {
  const { region } = useRegionStore();
  const [logs, setLogs] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [status, setStatus] = useState('Off Duty');
  const [location, setLocation] = useState('');

  useEffect(() => {
    fetchComplianceData();
  }, []);

  async function fetchComplianceData() {
    try {
      setLoading(true);
      const [logsData, driversData] = await Promise.all([
        getEldLogs(),
        getDrivers()
      ]);
      setLogs(logsData || []);
      setDrivers(driversData || []);
    } catch (err) {
      console.error('Error fetching compliance data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogStatus(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDriverId) return;

    try {
      await createEldLog({
        driver_id: selectedDriverId,
        status,
        location
      });
      setLocation('');
      fetchComplianceData();
    } catch (err) {
      console.error('Error logging status:', err);
    }
  }

  if (loading) {
    return <div style={{ color: '#f8fafc', padding: '20px' }}>Loading Compliance Logs...</div>;
  }

  return (
    <div style={{ color: '#f8fafc', padding: '10px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>ELD Compliance Tracker</h2>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
          Real-time HOS monitoring for {region === 'EU' ? 'EC 561/2006' : 'FMCSA'} compliance.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' }}>
        {/* Log Status Form */}
        <div style={{ background: '#0b1329', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>Log Duty Status</h3>
          <form onSubmit={handleLogStatus}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Select Driver</label>
              <select
                required
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', borderRadius: '4px', padding: '8px', color: '#fff' }}
              >
                <option value="">Select a driver...</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Duty Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', borderRadius: '4px', padding: '8px', color: '#fff' }}
              >
                <option>Driving</option>
                <option>On Duty</option>
                <option>Sleeper Berth</option>
                <option>Off Duty</option>
              </select>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Location / Note</label>
              <input
                type="text"
                placeholder="City, State"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', borderRadius: '4px', padding: '8px', color: '#fff' }}
              />
            </div>
            <button
              type="submit"
              style={{ width: '100%', background: '#4f46e5', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Update Log
            </button>
          </form>
        </div>

        {/* Logs Table */}
        <div style={{ background: '#0b1329', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>Recent Duty Status Changes</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#020617', color: '#94a3b8' }}>
                <th style={{ padding: '10px' }}>Time</th>
                <th style={{ padding: '10px' }}>Driver</th>
                <th style={{ padding: '10px' }}>Status</th>
                <th style={{ padding: '10px' }}>Location</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '10px', color: '#cbd5e1' }}>
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: '#fff' }}>{log.drivers?.name || 'Unknown'}</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ 
                      padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold',
                      background: log.status === 'Driving' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                      color: log.status === 'Driving' ? '#f87171' : '#4ade80'
                    }}>
                      {log.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px', color: '#cbd5e1' }}>{log.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}