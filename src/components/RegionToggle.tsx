import React from 'react';
import { useRegionStore, type UserRegion } from '../services/useRegion';

export function RegionToggle() {
  const { region, setUserRegion } = useRegionStore();
  const isEU = region === 'EU';

  return (
    <div style={{ display: 'flex', background: '#020617', padding: '3px', borderRadius: '8px', border: '1px solid #1e293b' }}>
      <button
        type="button"
        onClick={() => setUserRegion('US' as UserRegion)}
        style={{
          padding: '6px 14px',
          borderRadius: '6px',
          border: 'none',
          fontSize: '0.8rem',
          fontWeight: 600,
          cursor: 'pointer',
          background: !isEU ? '#1e293b' : 'transparent',
          color: !isEU ? '#38bdf8' : '#64748b',
          transition: 'all 0.2s ease',
        }}
      >
        US (FMCSA)
      </button>

      <button
        type="button"
        onClick={() => setUserRegion('EU' as UserRegion)}
        style={{
          padding: '6px 14px',
          borderRadius: '6px',
          border: 'none',
          fontSize: '0.8rem',
          fontWeight: 600,
          cursor: 'pointer',
          background: isEU ? '#1e293b' : 'transparent',
          color: isEU ? '#a855f7' : '#64748b',
          transition: 'all 0.2s ease',
        }}
      >
        EU (561/2006)
      </button>
    </div>
  );
}