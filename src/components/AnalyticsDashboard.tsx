import React, { useState, useEffect } from 'react';
import { useRegionStore } from '../services/useRegion';
import { EuCsrdEmissions } from './EuCsrdEmissions';

export default function AnalyticsDashboard() {
  const { region } = useRegionStore();
  const [currentRegion, setCurrentRegion] = useState<string>(() => {
    return localStorage.getItem('regionMode') || region || 'US (FMCSA)';
  });

  useEffect(() => {
    const syncRegion = () => {
      const stored = localStorage.getItem('regionMode');
      if (stored) setCurrentRegion(stored);
    };

    window.addEventListener('storage', syncRegion);
    const interval = setInterval(syncRegion, 500);

    return () => {
      window.removeEventListener('storage', syncRegion);
      clearInterval(interval);
    };
  }, []);

  const isEU = currentRegion.includes('EU') || region === 'EU' || region?.includes('EU');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ background: '#111827', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0 0 16px 0', color: '#f8fafc' }}>
          📈 Fleet Analytics & Performance
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
          Real-time revenue, cost per {isEU ? 'km' : 'mile'}, and operational KPIs ({currentRegion}).
        </p>
      </div>

      {/* Show CSRD Sustainability Reporting when in EU Mode */}
      {isEU && <EuCsrdEmissions />}

      <div style={{ background: '#0b1329', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#38bdf8', fontSize: '1rem' }}>Operating Performance Breakdown</h4>
        <p style={{ color: '#cbd5e1', fontSize: '0.875rem', margin: 0 }}>
          {isEU 
            ? 'Total Distance: 42,850 km | Fleet Avg Consumption: 31.2 L/100km | Operating Margin: +18.4%' 
            : 'Total Distance: 28,400 mi | Fleet Avg Fuel Efficiency: 6.8 MPG | Operating Margin: +16.2%'}
        </p>
      </div>
    </div>
  );
}