import React from 'react';

interface FuelLog {
  state: string;
  gallons: number;
}

interface TaxPageProps {
  fuelLogs: FuelLog[];
}

export const TaxPage: React.FC<TaxPageProps> = ({ fuelLogs }) => {
  // Aggregate gallons by state for IFTA
  const stateSummary = fuelLogs.reduce((acc: { [key: string]: number }, log) => {
    acc[log.state] = (acc[log.state] || 0) + log.gallons;
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card" style={{ padding: '20px' }}>
        <h2>🏛️ IFTA State Tax & Fuel Summary</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '15px' }}>
          Quarterly aggregate fuel purchases by jurisdiction for International Fuel Tax Agreement (IFTA) reporting.
        </p>
        
        {Object.keys(stateSummary).length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
            No fuel logs recorded yet. Add fuel stops in the Fuel tab to generate tax reports.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Jurisdiction (State)</th>
                <th>Total Gallons Purchased</th>
                <th>Estimated Tax Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stateSummary).map(([state, gallons]) => (
                <tr key={state}>
                  <td><strong>{state}</strong></td>
                  <td>{gallons.toFixed(1)} gal</td>
                  <td><span style={{ color: '#10b981', fontWeight: 'bold' }}>Logged</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};