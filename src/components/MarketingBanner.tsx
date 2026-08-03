import React from 'react';

export const MarketingBanner: React.FC = () => {
  return (
    <div style={{ background: 'linear-gradient(90deg, #4f46e5 0%, #0284c7 100%)', color: '#fff', padding: '10px 20px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>NEW</span>
        <span>Trucking Edge v3.5 Enterprise Release is live with automated dispatch optimizations and compliance lockouts.</span>
      </div>
      <button onClick={() => alert('Redirecting to release notes...')} style={{ background: '#fff', color: '#0f172a', border: 'none', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}>
        Learn More
      </button>
    </div>
  );
};