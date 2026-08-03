import React, { useState } from 'react';

export const SettingsPage: React.FC = () => {
  const [role, setRole] = useState<'Fleet Owner' | 'Dispatcher' | 'Safety Manager' | 'Accounting'>('Fleet Owner');
  const [autoDispatch, setAutoDispatch] = useState(true);
  const [smsVerification, setSmsVerification] = useState(false);
  const [geofenceRadius, setGeofenceRadius] = useState('15');
  const [complianceLockout, setComplianceLockout] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ padding: '24px', color: '#f8fafc', maxWidth: '800px' }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '8px' }}>Master Settings & Role Controls</h2>
      <p style={{ color: '#94a3b8', marginBottom: '24px' }}>Configure operational parameters and system-wide automation rules based on user roles.</p>

      {saved && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#34d399', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
          ✓ Settings updated successfully!
        </div>
      )}

      <form onSubmit={handleSave} style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Role Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '8px' }}>Active System Role</label>
          <select value={role} onChange={(e: any) => setRole(e.target.value)} style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff' }}>
            <option value="Fleet Owner">Fleet Owner</option>
            <option value="Dispatcher">Dispatcher</option>
            <option value="Safety Manager">Safety Manager</option>
            <option value="Accounting">Accounting</option>
          </select>
        </div>

        {/* Toggles */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1e293b', paddingTop: '16px' }}>
          <div>
            <div style={{ fontWeight: 'bold' }}>Automated Dispatch Assignment</div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Automatically assign available loads to drivers matching route profiles.</div>
          </div>
          <input type="checkbox" checked={autoDispatch} onChange={(e) => setAutoDispatch(e.target.checked)} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1e293b', paddingTop: '16px' }}>
          <div>
            <div style={{ fontWeight: 'bold' }}>Require SMS Security Verification</div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Prompt multi-factor authentication for high-value settlement changes.</div>
          </div>
          <input type="checkbox" checked={smsVerification} onChange={(e) => setSmsVerification(e.target.checked)} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
        </div>

        {/* Radius Input */}
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '6px' }}>Geofence Alert Radius (Miles)</label>
          <input type="number" value={geofenceRadius} onChange={(e) => setGeofenceRadius(e.target.value)} style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1e293b', paddingTop: '16px' }}>
          <div>
            <div style={{ fontWeight: 'bold' }}>Strict ELD Compliance Lockout</div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Prevent load dispatching if driver HOS limits are reached.</div>
          </div>
          <input type="checkbox" checked={complianceLockout} onChange={(e) => setComplianceLockout(e.target.checked)} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
        </div>

        <button type="submit" style={{ marginTop: '10px', background: '#6366f1', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          Save Configuration
        </button>
      </form>
    </div>
  );
};