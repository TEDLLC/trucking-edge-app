import React from 'react';

export const MarketingBanner: React.FC = () => {
  return (
    <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)', color: '#fff', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '8px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>PROMO</span>
        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Unlock unlimited commercial load board APIs and automated dispatch tools with Trucking Edge Pro!</span>
      </div>
      <button 
        onClick={() => alert('Redirecting to subscription billing plans...')}
        style={{ background: '#fff', color: '#4f46e5', border: 'none', padding: '6px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}
      >
        Upgrade Now
      </button>
    </div>
  );
};