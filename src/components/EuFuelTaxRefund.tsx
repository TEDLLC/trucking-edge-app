import React, { useState } from 'react';

interface CountryRefundRate {
  country: string;
  name: string;
  ratePerLiter: number; // in Euros
  minLitresThreshold: number;
}

const REFUND_RATES: CountryRefundRate[] = [
  { country: 'AT', name: 'Austria (AT)', ratePerLiter: 0.000, minLitresThreshold: 0 },
  { country: 'BE', name: 'Belgium (BE)', ratePerLiter: 0.226, minLitresThreshold: 0 },
  { country: 'BG', name: 'Bulgaria (BG)', ratePerLiter: 0.000, minLitresThreshold: 0 },
  { country: 'HR', name: 'Croatia (HR)', ratePerLiter: 0.000, minLitresThreshold: 0 },
  { country: 'CY', name: 'Cyprus (CY)', ratePerLiter: 0.000, minLitresThreshold: 0 },
  { country: 'CZ', name: 'Czech Republic (CZ)', ratePerLiter: 0.000, minLitresThreshold: 0 },
  { country: 'DK', name: 'Denmark (DK)', ratePerLiter: 0.000, minLitresThreshold: 0 },
  { country: 'EE', name: 'Estonia (EE)', ratePerLiter: 0.000, minLitresThreshold: 0 },
  { country: 'FI', name: 'Finland (FI)', ratePerLiter: 0.000, minLitresThreshold: 0 },
  { country: 'FR', name: 'France (TICPE) (FR)', ratePerLiter: 0.157, minLitresThreshold: 0 },
  { country: 'DE', name: 'Germany (DE)', ratePerLiter: 0.000, minLitresThreshold: 0 },
  { country: 'GR', name: 'Greece (GR)', ratePerLiter: 0.000, minLitresThreshold: 0 },
  { country: 'HU', name: 'Hungary (HU)', ratePerLiter: 0.000, minLitresThreshold: 0 },
  { country: 'IE', name: 'Ireland (IE)', ratePerLiter: 0.000, minLitresThreshold: 0 },
  { country: 'IT', name: 'Italy (Carbon Tax Refund) (IT)', ratePerLiter: 0.214, minLitresThreshold: 0 },
  { country: 'LV', name: 'Latvia (LV)', ratePerLiter: 0.000, minLitresThreshold: 0 },
  { country: 'LT', name: 'Lithuania (LT)', ratePerLiter: 0.000, minLitresThreshold: 0 },
  { country: 'LU', name: 'Luxembourg (LU)', ratePerLiter: 0.000, minLitresThreshold: 0 },
  { country: 'MT', name: 'Malta (MT)', ratePerLiter: 0.000, minLitresThreshold: 0 },
  { country: 'NL', name: 'Netherlands (NL)', ratePerLiter: 0.000, minLitresThreshold: 0 },
  { country: 'NO', name: 'Norway (NO)', ratePerLiter: 0.000, minLitresThreshold: 0 },
  { country: 'PL', name: 'Poland (PL)', ratePerLiter: 0.000, minLitresThreshold: 0 },
  { country: 'PT', name: 'Portugal (PT)', ratePerLiter: 0.000, minLitresThreshold: 0 },
  { country: 'RO', name: 'Romania (RO)', ratePerLiter: 0.000, minLitresThreshold: 0 },
  { country: 'SK', name: 'Slovakia (SK)', ratePerLiter: 0.000, minLitresThreshold: 0 },
  { country: 'SI', name: 'Slovenia (Trošarina) (SI)', ratePerLiter: 0.091, minLitresThreshold: 0 },
  { country: 'ES', name: 'Spain (Gasoil Profesional) (ES)', ratePerLiter: 0.049, minLitresThreshold: 0 },
  { country: 'SE', name: 'Sweden (SE)', ratePerLiter: 0.000, minLitresThreshold: 0 },
  { country: 'CH', name: 'Switzerland (CH)', ratePerLiter: 0.000, minLitresThreshold: 0 },
  { country: 'GB', name: 'United Kingdom (GB)', ratePerLiter: 0.000, minLitresThreshold: 0 },
];

export const EuFuelTaxRefund: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<string>('FR');
  const [litersPurchased, setLitersPurchased] = useState<string>('1200');

  const currentRate = REFUND_RATES.find((r) => r.country === selectedCountry) || REFUND_RATES[0];
  const litersNum = parseFloat(litersPurchased) || 0;
  const estimatedRefund = litersNum * currentRate.ratePerLiter;

  return (
    <div style={{ background: '#0b1329', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.05rem', fontWeight: 600 }}>
          EU Fuel Excise Duty Tax Refund Estimator
        </h3>
        <span style={{ fontSize: '0.75rem', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
          Directive 2003/96/EC
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Select Member State</label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', padding: '10px', color: '#f8fafc', outline: 'none' }}
          >
            {REFUND_RATES.map((r) => (
              <option key={r.country} value={r.country}>
                {r.name} {r.ratePerLiter > 0 ? `(€${r.ratePerLiter.toFixed(3)}/L)` : ''}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Commercial Fuel Volume (Liters)</label>
          <input
            type="number"
            value={litersPurchased}
            onChange={(e) => setLitersPurchased(e.target.value)}
            style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', padding: '10px', color: '#f8fafc', outline: 'none' }}
          />
        </div>
      </div>

      <div style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '8px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block' }}>Estimated Claimable Refund Rate</span>
          <span style={{ color: '#cbd5e1', fontWeight: 600 }}>€{currentRate.ratePerLiter.toFixed(3)} per Liter</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block' }}>Total Estimated Tax Recovery</span>
          <span style={{ color: '#4ade80', fontSize: '1.25rem', fontWeight: 700 }}>
            €{estimatedRefund.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
};