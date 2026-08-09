import React, { useState } from 'react';

interface PostingDeclaration {
  id: string;
  driverName: string;
  hostCountry: string;
  postingPeriod: string;
  minWageRate: string;
  imiDeclarationId: string;
  status: 'ACTIVE' | 'EXPIRED' | 'PENDING';
}

const INITIAL_DECLARATIONS: PostingDeclaration[] = [
  {
    id: '1',
    driverName: 'Hans Müller',
    hostCountry: 'France (FR)',
    postingPeriod: '2026-08-01 to 2026-08-31',
    minWageRate: '€11.88 / hr',
    imiDeclarationId: 'IMI-FR-2026-9842',
    status: 'ACTIVE'
  },
  {
    id: '2',
    driverName: 'Piotr Kowalski',
    hostCountry: 'Germany (DE)',
    postingPeriod: '2026-08-05 to 2026-09-05',
    minWageRate: '€12.82 / hr',
    imiDeclarationId: 'IMI-DE-2026-3301',
    status: 'ACTIVE'
  },
  {
    id: '3',
    driverName: 'Jean Dupont',
    hostCountry: 'Austria (AT)',
    postingPeriod: '2026-06-01 to 2026-07-01',
    minWageRate: '€10.95 / hr',
    imiDeclarationId: 'IMI-AT-2026-1102',
    status: 'EXPIRED'
  }
];

export const EuPostingWorkersView: React.FC = () => {
  const [declarations, setDeclarations] = useState<PostingDeclaration[]>(INITIAL_DECLARATIONS);

  return (
    <div style={{ background: '#0b1329', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.05rem', fontWeight: 600 }}>
            EU Posting of Drivers & Cabotage Wage Declarations
          </h3>
          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
            Directive (EU) 2020/1057 &bull; IMI Portal Cross-Border Minimum Wage Compliance
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
          IMI Portal Synced
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#020617', color: '#94a3b8' }}>
              <th style={{ padding: '10px 12px' }}>Driver</th>
              <th style={{ padding: '10px 12px' }}>Host Country</th>
              <th style={{ padding: '10px 12px' }}>Posting Period</th>
              <th style={{ padding: '10px 12px' }}>Min Wage Rate</th>
              <th style={{ padding: '10px 12px' }}>IMI Ref ID</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {declarations.map((decl) => (
              <tr key={decl.id} style={{ borderBottom: '1px solid #1e293b' }}>
                <td style={{ padding: '10px 12px', fontWeight: 600, color: '#fff' }}>{decl.driverName}</td>
                <td style={{ padding: '10px 12px', color: '#cbd5e1' }}>{decl.hostCountry}</td>
                <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{decl.postingPeriod}</td>
                <td style={{ padding: '10px 12px', color: '#4ade80', fontWeight: 600 }}>{decl.minWageRate}</td>
                <td style={{ padding: '10px 12px', color: '#818cf8', fontFamily: 'monospace' }}>{decl.imiDeclarationId}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: decl.status === 'ACTIVE' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: decl.status === 'ACTIVE' ? '#4ade80' : '#ef4444',
                      border: `1px solid ${decl.status === 'ACTIVE' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                    }}
                  >
                    {decl.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};