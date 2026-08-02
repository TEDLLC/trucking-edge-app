import React, { useState } from 'react';

export const SettingsPage: React.FC = () => {
  const [minRpm, setMinRpm] = useState('2.50');
  const [defaultMargin, setDefaultMargin] = useState('15');
  const [autoDispatch, setAutoDispatch] = useState(false);
  const [loadBoardSync, setLoadBoardSync] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ color: '#f8fafc', maxWidth: '800px' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '8px' }}>Load Board & Dispatch Settings</h2>
      <p style={{ color: '#94a3b8', marginBottom: '24px' }}>Configure rate thresholds, automated matching rules, and load board API preferences.</p>

      {saved && (
        <div style={{ padding: '12px 16px', background: '#065f46', color: '#fff', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold' }}>
          Settings successfully updated and synchronized across dispatch nodes!
        </div>
      )}

      <form onSubmit={handleSave} style={{ background: '#090d16', padding: '24px', borderRadius: '12px', border: '1px solid #1e293b' }}>
        
        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px', color: '#38bdf8' }}>Rate & Margin Thresholds</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>Minimum Rate Per Mile (RPM Alert)</label>
            <div style={{ display: 'flex', alignItems: 'center', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', padding: '0 10px' }}>
              <span style={{ color: '#4ade80', fontWeight: 'bold' }}>$</span>
              <input 
                type="number" 
                step="0.05" 
                value={minRpm} 
                onChange={(e) => setMinRpm(e.target.value)} 
                style={{ width: '100%', padding: '10px', background: 'transparent', border: 'none', color: '#fff', outline: 'none' }} 
              />
            </div>
            <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>Loads falling below this rate will trigger warning flags.</small>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>Default Broker Margin (%)</label>
            <div style={{ display: 'flex', alignItems: 'center', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', padding: '0 10px' }}>
              <input 
                type="number" 
                value={defaultMargin} 
                onChange={(e) => setDefaultMargin(e.target.value)} 
                style={{ width: '100%', padding: '10px', background: 'transparent', border: 'none', color: '#fff', outline: 'none' }} 
              />
              <span style={{ color: '#facc15', fontWeight: 'bold' }}>%</span>
            </div>
            <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>Standard brokerage cut applied on calculated spot rates.</small>
          </div>
        </div>

        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px', color: '#38bdf8' }}>Automation & Integrations</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', background: '#020617', padding: '12px 16px', borderRadius: '8px', border: '1px solid #1e293b' }}>
            <input 
              type="checkbox" 
              checked={autoDispatch} 
              onChange={(e) => setAutoDispatch(e.target.checked)} 
              style={{ width: '18px', height: '18px', accentColor: '#6366f1' }} 
            />
            <div>
              <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.9rem' }}>Auto-Assign Available Drivers</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Automatically suggest or assign incoming loads to drivers with compliant HOS status.</div>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', background: '#020617', padding: '12px 16px', borderRadius: '8px', border: '1px solid #1e293b' }}>
            <input 
              type="checkbox" 
              checked={loadBoardSync} 
              onChange={(e) => setLoadBoardSync(e.target.checked)} 
              style={{ width: '18px', height: '18px', accentColor: '#6366f1' }} 
            />
            <div>
              <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.9rem' }}>Live Load Board Feed Synchronization</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Continuously pull high-paying spot market freight feeds directly into your dashboard.</div>
            </div>
          </label>
        </div>

        <button type="submit" style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          Save Configuration
        </button>

      </form>
    </div>
  );
};