import React, { useState } from 'react';
import { evaluateHosCompliance } from '../utils/hosService';
import { logAuditAction } from '../utils/auditLogger';
import { useRegionStore } from '../services/useRegion';

export const HosLogsDashboard: React.FC = () => {
  const { region } = useRegionStore();
  const isEU = region === 'EU' || region?.includes('EU');

  const [drivers] = useState([
    { id: 'driver-001', name: 'John Doe (Truck #104)' },
    { id: 'driver-002', name: 'Sarah Jenkins (Truck #208)' },
    { id: 'driver-003', name: 'Mike Ross (Truck #312)' }
  ]);

  const [driverId, setDriverId] = useState<string>('driver-001');
  const [status, setStatus] = useState<'DRIVING' | 'ON_DUTY' | 'OFF_DUTY' | 'SLEEPER'>('DRIVING');
  const [hoursDrivenToday, setHoursDrivenToday] = useState<number>(isEU ? 8.0 : 8.5);
  const [cycleHoursUsed, setCycleHoursUsed] = useState<number>(isEU ? 36.0 : 45.0);
  
  const [logs, setLogs] = useState<Array<{ driverId: string; driverName: string; status: string; hoursDrivenToday: number; cycleHoursUsed: number; violation: boolean; reason?: string; timestamp: string }>>([
    { driverId: 'driver-001', driverName: 'John Doe (Truck #104)', status: 'DRIVING', hoursDrivenToday: isEU ? 8.0 : 8.5, cycleHoursUsed: isEU ? 36.0 : 45.0, violation: false, timestamp: '10:30 AM' },
    { driverId: 'driver-002', driverName: 'Sarah Jenkins (Truck #208)', status: isEU ? 'DRIVING' : 'ON_DUTY', hoursDrivenToday: isEU ? 10.2 : 11.5, cycleHoursUsed: isEU ? 56.0 : 71.0, violation: true, reason: isEU ? 'Exceeded maximum daily driving limit of 9-10 hours under EC 561/2006 (10.2 hrs logged without qualifying break extension).' : 'Exceeded maximum daily driving limit of 11 hours (11.5 hrs logged).', timestamp: '09:15 AM' }
  ]);

  const handleAddHosLog = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    let violation = false;
    let reason = '';

    if (isEU) {
      if (status === 'DRIVING' && hoursDrivenToday > 9.0) {
        violation = true;
        reason = `Exceeded standard EU daily driving limit of 9 hours under Regulation 561/2006 (${hoursDrivenToday} hrs logged).`;
      }
    } else {
      const evaluation = await evaluateHosCompliance(driverId);
      violation = !evaluation.isCompliant;
      if (violation) {
        reason = `Driver ${driverId} evaluated as non-compliant (Remaining hours: ${evaluation.remainingHours}).`;
      }
    }

    const selectedDriver = drivers.find((d) => d.id === driverId)?.name || driverId;

    const newLog = {
      driverId,
      driverName: selectedDriver,
      status,
      hoursDrivenToday,
      cycleHoursUsed,
      violation,
      reason,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setLogs([newLog, ...logs]);

    if (violation) {
      await logAuditAction({
        actorId: 'system-compliance-monitor',
        action: isEU ? 'EU_HOS_VIOLATION_DETECTED' : 'FMCSA_HOS_VIOLATION_DETECTED',
        targetEntity: 'HosLog',
        details: `Driver ${selectedDriver} flagged (${region}): ${reason}`
      });
    }
  };

  return (
    <div style={{ padding: '24px', color: '#fff', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
        {isEU ? 'EU Hours of Service (Regulation 561/2006)' : 'ELD & Hours of Service (HOS)'}
      </h1>
      <p style={{ color: '#9ca3af', marginBottom: '24px' }}>
        {isEU 
          ? `Monitor EU driving times, mandatory rest breaks, and compliance logs (${region}).` 
          : `Monitor compliance logs, driver duty availability, and real-time HOS tracking (${region}).`}
      </p>

      {/* Simulator Form */}
      <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Update Compliance Log</h2>
        <form onSubmit={handleAddHosLog} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', color: '#9ca3af', fontSize: '12px', marginBottom: '6px' }}>Driver Name</label>
            <select
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              style={{ width: '100%', padding: '10px', background: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '6px' }}
            >
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', color: '#9ca3af', fontSize: '12px', marginBottom: '6px' }}>Duty Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'DRIVING' | 'ON_DUTY' | 'OFF_DUTY' | 'SLEEPER')}
              style={{ width: '100%', padding: '10px', background: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '6px' }}
            >
              <option value="DRIVING">Driving</option>
              <option value="ON_DUTY">On Duty</option>
              <option value="OFF_DUTY">Off Duty</option>
              <option value="SLEEPER">{isEU ? 'Rest / Break' : 'Sleeper Berth'}</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', color: '#9ca3af', fontSize: '12px', marginBottom: '6px' }}>Hours Logged / Remaining</label>
            <input
              type="number"
              step="0.1"
              value={hoursDrivenToday}
              onChange={(e) => setHoursDrivenToday(parseFloat(e.target.value))}
              style={{ width: '100%', padding: '10px', background: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '6px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#9ca3af', fontSize: '12px', marginBottom: '6px' }}>Current Location</label>
            <input
              type="text"
              defaultValue={isEU ? 'Frankfurt, Germany' : 'Chicago, IL'}
              style={{ width: '100%', padding: '10px', background: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '6px' }}
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <button
              type="submit"
              style={{ padding: '10px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
            >
              Record {isEU ? 'EU Tachograph Event' : 'ELD Event'}
            </button>
          </div>
        </form>
      </div>

      {/* Logs Table Section */}
      <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Compliance Records Feed</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #374151', color: '#9ca3af', fontSize: '14px' }}>
              <th style={{ padding: '12px' }}>Time</th>
              <th style={{ padding: '12px' }}>Driver</th>
              <th style={{ padding: '12px' }}>Status</th>
              <th style={{ padding: '12px' }}>Hours Today</th>
              <th style={{ padding: '12px' }}>Cycle Hours</th>
              <th style={{ padding: '12px' }}>Compliance State</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '12px', color: '#9ca3af' }}>{log.timestamp}</td>
                <td style={{ padding: '12px', fontWeight: '600' }}>{log.driverName}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#1f2937', fontSize: '12px', fontWeight: '600' }}>
                    {log.status}
                  </span>
                </td>
                <td style={{ padding: '12px', color: '#d1d5db' }}>{log.hoursDrivenToday} hrs</td>
                <td style={{ padding: '12px', color: '#d1d5db' }}>{log.cycleHoursUsed} hrs</td>
                <td style={{ padding: '12px' }}>
                  {log.violation ? (
                    <span title={log.reason} style={{ background: '#7f1d1d', color: '#fca5a5', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'help' }}>
                      VIOLATION DETECTED
                    </span>
                  ) : (
                    <span style={{ background: '#064e3b', color: '#6ee7b7', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
                      COMPLIANT
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};