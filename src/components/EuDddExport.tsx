import React, { useState } from 'react';

interface DriverCardRecord {
  id: string;
  driverName: string;
  cardNumber: string;
  lastDownloaded: string;
  daysRemaining: number;
}

const MOCK_DRIVERS: DriverCardRecord[] = [
  { id: '1', driverName: 'Hans Müller', cardNumber: 'D1009847291000', lastDownloaded: '2026-07-28', daysRemaining: 17 },
  { id: '2', driverName: 'Jean Dupont', cardNumber: 'F883019482000', lastDownloaded: '2026-07-12', daysRemaining: 1 },
  { id: '3', driverName: 'Piotr Kowalski', cardNumber: 'PL554910283000', lastDownloaded: '2026-08-01', daysRemaining: 21 },
];

export const EuDddExport: React.FC = () => {
  const [drivers, setDrivers] = useState<DriverCardRecord[]>(MOCK_DRIVERS);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadDdd = (driver: DriverCardRecord) => {
    setDownloadingId(driver.id);

    setTimeout(() => {
      // Simulate binary generation of raw tachograph .ddd file
      const dummyHeader = `TACHO_C1B_RAW_${driver.cardNumber}_${new Date().toISOString()}`;
      const blob = new Blob([dummyHeader], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${driver.driverName.replace(/\s+/g, '_')}_${driver.cardNumber}.ddd`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Update download status
      setDrivers(prev =>
        prev.map(d =>
          d.id === driver.id
            ? { ...d, lastDownloaded: new Date().toISOString().split('T')[0], daysRemaining: 28 }
            : d
        )
      );
      setDownloadingId(null);
    }, 800);
  };

  return (
    <div style={{ background: '#0b1329', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.05rem', fontWeight: 600 }}>
            Tachograph .DDD File Export & Audit Vault
          </h3>
          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
            Reg (EU) No 165/2014 &bull; 28-Day Driver Card Compliance Cycle
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
          Gen2 Smart Tachograph Ready
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#020617', color: '#94a3b8' }}>
              <th style={{ padding: '10px 12px' }}>Driver</th>
              <th style={{ padding: '10px 12px' }}>Card Number</th>
              <th style={{ padding: '10px 12px' }}>Last Read</th>
              <th style={{ padding: '10px 12px' }}>Deadline</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map(driver => (
              <tr key={driver.id} style={{ borderBottom: '1px solid #1e293b' }}>
                <td style={{ padding: '10px 12px', fontWeight: 600, color: '#fff' }}>{driver.driverName}</td>
                <td style={{ padding: '10px 12px', color: '#94a3b8', fontFamily: 'monospace' }}>{driver.cardNumber}</td>
                <td style={{ padding: '10px 12px', color: '#cbd5e1' }}>{driver.lastDownloaded}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{
                    color: driver.daysRemaining <= 3 ? '#ef4444' : driver.daysRemaining <= 7 ? '#f59e0b' : '#4ade80',
                    fontWeight: 600
                  }}>
                    {driver.daysRemaining} days left
                  </span>
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                  <button
                    onClick={() => handleDownloadDdd(driver)}
                    disabled={downloadingId === driver.id}
                    style={{
                      background: downloadingId === driver.id ? '#334155' : '#6366f1',
                      color: '#fff',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontWeight: 600,
                      cursor: downloadingId === driver.id ? 'wait' : 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    {downloadingId === driver.id ? 'Exporting...' : 'Download .DDD'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};