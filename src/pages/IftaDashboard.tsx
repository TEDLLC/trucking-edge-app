import React, { useState } from 'react';
import { useRegionStore } from '../services/useRegion';
import { ExportReportButton } from '../components/ExportReportButton';

interface JurisdictionEntry {
  stateOrCountry: string;
  distance: number;
  fuelPurchased: number; // Gallons (US) or Liters (EU)
  taxRate: number; // Tax rate per unit
}

export function IftaDashboard() {
  const { region } = useRegionStore();
  const isEU = region === 'EU';

  // Sample tax rates: US $/gal vs EU €/L
  const [entries, setEntries] = useState<JurisdictionEntry[]>(
    isEU
      ? [
          { stateOrCountry: 'Germany (DE)', distance: 1200, fuelPurchased: 350, taxRate: 0.65 },
          { stateOrCountry: 'France (FR)', distance: 850, fuelPurchased: 220, taxRate: 0.68 },
          { stateOrCountry: 'Belgium (BE)', distance: 400, fuelPurchased: 100, taxRate: 0.60 },
        ]
      : [
          { stateOrCountry: 'Illinois (IL)', distance: 1450, fuelPurchased: 240, taxRate: 0.45 },
          { stateOrCountry: 'Indiana (IN)', distance: 820, fuelPurchased: 130, taxRate: 0.54 },
          { stateOrCountry: 'Ohio (OH)', distance: 610, fuelPurchased: 90, taxRate: 0.47 },
        ]
  );

  // Calculated fleet average economy (MPG or km/L)
  const totalDistance = entries.reduce((acc, curr) => acc + curr.distance, 0);
  const totalFuel = entries.reduce((acc, curr) => acc + curr.fuelPurchased, 0);
  const fleetAvgEconomy = totalFuel > 0 ? (totalDistance / totalFuel).toFixed(2) : '0';

  // Calculate Net Tax Owed / Refund per jurisdiction
  const calculatedRows = entries.map((entry) => {
    // Taxable fuel required for distance driven in jurisdiction
    const fuelRequired = totalDistance > 0 ? entry.distance / (totalDistance / totalFuel) : 0;
    const taxOwed = fuelRequired * entry.taxRate;
    const taxPaidAtPump = entry.fuelPurchased * entry.taxRate;
    const netTax = taxOwed - taxPaidAtPump;

    return {
      ...entry,
      fuelRequired: fuelRequired.toFixed(1),
      taxOwed: taxOwed.toFixed(2),
      taxPaidAtPump: taxPaidAtPump.toFixed(2),
      netTax: netTax.toFixed(2),
    };
  });

  const totalNetTax = calculatedRows.reduce((acc, curr) => acc + parseFloat(curr.netTax), 0);

  return (
    <div style={{ color: '#f8fafc', padding: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>
            {isEU ? '🇪🇺 EU Regional Fuel Tax Compliance' : '🇺🇸 IFTA Fuel Tax Reporting'}
          </h2>
          <span style={{ fontSize: '0.8rem', background: '#0284c7', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
            Quarterly Settlement Engine
          </span>
        </div>

        {/* CSV Export & Print Summary Button */}
        <ExportReportButton
          data={calculatedRows}
          filename={`${isEU ? 'EU_Tax_Report' : 'IFTA_Report'}_${new Date().toISOString().slice(0, 10)}.csv`}
        />
      </div>

      {/* Summary Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#0b1329', border: '1px solid #1e293b', borderRadius: '10px', padding: '16px' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Total Distance</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#38bdf8' }}>
            {totalDistance.toLocaleString()} {isEU ? 'km' : 'mi'}
          </div>
        </div>

        <div style={{ background: '#0b1329', border: '1px solid #1e293b', borderRadius: '10px', padding: '16px' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Total Fuel Purchased</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#38bdf8' }}>
            {totalFuel.toLocaleString()} {isEU ? 'L' : 'gal'}
          </div>
        </div>

        <div style={{ background: '#0b1329', border: '1px solid #1e293b', borderRadius: '10px', padding: '16px' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Fleet Average Efficiency</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#f59e0b' }}>
            {fleetAvgEconomy} {isEU ? 'km/L' : 'MPG'}
          </div>
        </div>

        <div style={{ background: '#0b1329', border: '1px solid #1e293b', borderRadius: '10px', padding: '16px' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Estimated Net Tax Due</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: totalNetTax > 0 ? '#ef4444' : '#4ade80' }}>
            {isEU ? `€${totalNetTax.toFixed(2)}` : `$${totalNetTax.toFixed(2)}`}
          </div>
        </div>
      </div>

      {/* Breakdown Table */}
      <div style={{ background: '#0b1329', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem' }}>Jurisdiction Breakdown & Tax Calculations</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#020617', color: '#94a3b8' }}>
                <th style={{ padding: '10px' }}>Jurisdiction</th>
                <th style={{ padding: '10px' }}>Distance ({isEU ? 'km' : 'mi'})</th>
                <th style={{ padding: '10px' }}>Fuel Purchased ({isEU ? 'L' : 'gal'})</th>
                <th style={{ padding: '10px' }}>Tax Rate</th>
                <th style={{ padding: '10px' }}>Tax Paid at Pump</th>
                <th style={{ padding: '10px' }}>Net Tax Due / (Refund)</th>
              </tr>
            </thead>
            <tbody>
              {calculatedRows.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: '#fff' }}>{row.stateOrCountry}</td>
                  <td style={{ padding: '10px', color: '#cbd5e1' }}>{row.distance}</td>
                  <td style={{ padding: '10px', color: '#cbd5e1' }}>{row.fuelPurchased}</td>
                  <td style={{ padding: '10px', color: '#94a3b8' }}>{isEU ? `€${row.taxRate}/L` : `$${row.taxRate}/gal`}</td>
                  <td style={{ padding: '10px', color: '#cbd5e1' }}>{isEU ? `€${row.taxPaidAtPump}` : `$${row.taxPaidAtPump}`}</td>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: parseFloat(row.netTax) > 0 ? '#ef4444' : '#4ade80' }}>
                    {isEU ? `€${row.netTax}` : `$${row.netTax}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}