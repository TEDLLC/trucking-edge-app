import React, { useState } from 'react';

interface TollRate {
  country: string;
  systemName: string;
  ratePerKmEuro6: number; // Avg toll rate for Euro VI >18t
}

const TOLL_RATES: TollRate[] = [
  { country: 'DE', systemName: 'Toll Collect (Germany)', ratePerKmEuro6: 0.348 },
  { country: 'AT', systemName: 'GO-Maut (Austria)', ratePerKmEuro6: 0.421 },
  { country: 'PL', systemName: 'e-TOLL (Poland)', ratePerKmEuro6: 0.112 },
  { country: 'CZ', systemName: 'MYTO CZ (Czech Rep)', ratePerKmEuro6: 0.185 },
  { country: 'FR', systemName: 'Autoroutes Tépé (France)', ratePerKmEuro6: 0.230 },
  { country: 'BE', systemName: 'Viapass (Belgium)', ratePerKmEuro6: 0.163 },
];

export const EuTollTracker: React.FC = () => {
  const [country, setCountry] = useState('DE');
  const [distanceKm, setDistanceKm] = useState('850');

  const selectedToll = TOLL_RATES.find((t) => t.country === country) || TOLL_RATES[0];
  const kmNum = parseFloat(distanceKm) || 0;
  const estimatedTollCost = kmNum * selectedToll.ratePerKmEuro6;

  return (
    <div style={{ background: '#0b1329', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.05rem', fontWeight: 600 }}>
          EU Distance-Based Road Toll Estimator (EETS / Eurovignette)
        </h3>
        <span style={{ fontSize: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
          Euro VI Emissions Class
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '6px' }}>Toll Domain</label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', padding: '10px', color: '#f8fafc', outline: 'none' }}
          >
            {TOLL_RATES.map((t) => (
              <option key={t.country} value={t.country}>
                {t.systemName} (€{t.ratePerKmEuro6.toFixed(3)}/km)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '6px' }}>Distance Driven (km)</label>
          <input
            type="number"
            value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value)}
            style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', padding: '10px', color: '#f8fafc', outline: 'none' }}
          />
        </div>
      </div>

      <div style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '8px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block' }}>System Rate</span>
          <span style={{ color: '#cbd5e1', fontWeight: 600 }}>€{selectedToll.ratePerKmEuro6.toFixed(3)} / km</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block' }}>Estimated Road Toll Duty</span>
          <span style={{ color: '#38bdf8', fontSize: '1.25rem', fontWeight: 700 }}>
            €{estimatedTollCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
};