import React from 'react';
import { useRegionStore } from '../services/useRegion';
import { EuHosView } from './EuHosView';
import { EUComplianceModule } from './EUComplianceModule';
import { EuViolationAlert } from './EuViolationAlert';
import { EuDddExport } from './EuDddExport';
import { EuBorderCrossingLog } from './EuBorderCrossingLog';

export function EldManager() {
  const { region } = useRegionStore();
  const isEU = region === 'EU';

  return (
    <div style={{ color: '#f8fafc' }}>
      {/* 🇪🇺 EU DASHBOARD VIEW */}
      {isEU ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '4px', color: '#a855f7' }}>
              🇪🇺 EU Smart Tachograph & HOS Compliance
            </h2>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem' }}>
              Regulation (EC) 561/2006 • Mandatory Border Logging & DDD Downloads
            </p>
          </div>

          <EuViolationAlert />
          <EUComplianceModule />
          <EuHosView />
          <EuBorderCrossingLog />
          <EuDddExport />
        </div>
      ) : (
        /* 🇺🇸 US DASHBOARD VIEW */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '4px', color: '#38bdf8' }}>
              📟 US ELD & Hours of Service (FMCSA)
            </h2>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem' }}>
              49 CFR Part 395 • 11-Hour Driving & 14-Hour On-Duty Limits
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#090d16', border: '1px solid #1e293b', padding: '16px', borderRadius: '10px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Driving Hours Remaining</span>
              <h3 style={{ margin: '8px 0 0 0', color: '#4ade80', fontSize: '1.4rem' }}>8.5 hrs</h3>
            </div>
            <div style={{ background: '#090d16', border: '1px solid #1e293b', padding: '16px', borderRadius: '10px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Shift Hours Remaining</span>
              <h3 style={{ margin: '8px 0 0 0', color: '#38bdf8', fontSize: '1.4rem' }}>11.0 hrs</h3>
            </div>
            <div style={{ background: '#090d16', border: '1px solid #1e293b', padding: '16px', borderRadius: '10px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>70-Hour Cycle Available</span>
              <h3 style={{ margin: '8px 0 0 0', color: '#f59e0b', fontSize: '1.4rem' }}>42.0 hrs</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}