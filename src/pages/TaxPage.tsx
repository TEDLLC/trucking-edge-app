import React from 'react';
import { useRegionStore } from '../services/useRegion';
import { EUComplianceModule } from '../components/EUComplianceModule';

interface FuelLog {
  state: string;
  gallons: number;
}

interface TaxPageProps {
  fuelLogs: FuelLog[];
}

export const TaxPage: React.FC<TaxPageProps> = ({ fuelLogs }) => {
  const { region } = useRegionStore();
  const isEU = region === 'EU' || region?.includes('EU');

  if (isEU) {
    return <EUComplianceModule />;
  }

  // Aggregate gallons by state for IFTA
  const stateSummary = fuelLogs.reduce((acc: { [key: string]: number }, log) => {
    acc[log.state] = (acc[log.state] || 0) + log.gallons;
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: '#f8fafc' }}>
      <div style={{ background: '#0b1329', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)' }}>
        <h2 style={{ color: '#f8fafc', fontSize: '1.15rem', fontWeight: 600, margin: '0 0 8px 0' }}>🏛️ IFTA State Tax & Fuel Summary</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px' }}>
          Quarterly aggregate fuel purchases by jurisdiction for International Fuel Tax Agreement (IFTA) reporting.
        </p>
        
        {Object.keys(stateSummary).length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', background: '#020617', borderRadius: '8px', border: '1px solid #1e293b' }}>
            No fuel logs recorded yet. Add fuel stops in the Fuel tab to generate tax reports.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#cbd5e1' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1e293b', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 16px' }}>Jurisdiction (State)</th>
                  <th style={{ padding: '12px 16px' }}>Total Gallons Purchased</th>
                  <th style={{ padding: '12px 16px' }}>Estimated Tax Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(stateSummary).map(([state, gallons]) => (
                  <tr key={state} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '16px', fontWeight: 600, color: '#f8fafc' }}>{state}</td>
                    <td style={{ padding: '16px', color: '#94a3b8' }}>{gallons.toFixed(1)} gal</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ color: '#10b981', fontWeight: 600, background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                        Logged
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};