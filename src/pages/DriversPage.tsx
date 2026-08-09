import React, { useState } from 'react';
import type { Driver } from '../components/EnterpriseDashboard';

interface DriversPageProps {
  drivers: Driver[];
  onAddDriver: (newDriver: Driver) => void;
}

interface DriverRoster {
  id: string;
  name: string;
  cardNumber: string;
  cardExpiry: string;
  weeklyRestStatus: 'Compliant' | 'Rest Required' | 'Warning';
  hoursThisWeek: number;
  lastBorderCrossing: string;
}

export function DriversPage({ drivers: parentDrivers, onAddDriver: parentAddDriver }: DriversPageProps) {
  const [rosterDrivers, setRosterDrivers] = useState<DriverRoster[]>([
    {
      id: 'DRV-101',
      name: 'Hans Müller',
      cardNumber: 'E1234567890000',
      cardExpiry: '2028-05-12',
      weeklyRestStatus: 'Compliant',
      hoursThisWeek: 38.5,
      lastBorderCrossing: 'DE -> FR (2026-08-08)'
    },
    {
      id: 'DRV-102',
      name: 'Piotr Kowalski',
      cardNumber: 'E9876543210000',
      cardExpiry: '2027-11-20',
      weeklyRestStatus: 'Rest Required',
      hoursThisWeek: 54.0,
      lastBorderCrossing: 'PL -> DE (2026-08-08)'
    },
    {
      id: 'DRV-103',
      name: 'Jean Dupont',
      cardNumber: 'E4567891230000',
      cardExpiry: '2026-09-01',
      weeklyRestStatus: 'Warning',
      hoursThisWeek: 48.0,
      lastBorderCrossing: 'FR -> BE (2026-08-09)'
    }
  ]);

  const [name, setName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !cardNumber) return;

    const newRosterDriver: DriverRoster = {
      id: `DRV-${Math.floor(100 + Math.random() * 900)}`,
      name,
      cardNumber,
      cardExpiry: cardExpiry || '2029-01-01',
      weeklyRestStatus: 'Compliant',
      hoursThisWeek: 0,
      lastBorderCrossing: 'None'
    };

    setRosterDrivers([...rosterDrivers, newRosterDriver]);

    parentAddDriver({
      id: newRosterDriver.id,
      name: newRosterDriver.name,
      truck: 'Truck-01',
      phone: '+15550199',
      license: newRosterDriver.cardNumber,
      status: 'Active'
    });

    setName('');
    setCardNumber('');
    setCardExpiry('');
  };

  const getStatusBadge = (status: DriverRoster['weeklyRestStatus']) => {
    switch (status) {
      case 'Compliant':
        return <span style={{ background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80', border: '1px solid rgba(74, 222, 128, 0.3)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Compliant</span>;
      case 'Warning':
        return <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Near Limit (48h+)</span>;
      case 'Rest Required':
        return <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Mandatory Rest Due</span>;
    }
  };

  return (
    <div style={{ color: '#f8fafc', padding: '10px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '4px' }}>
          Drivers & Driver Card Roster
        </h2>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem' }}>
          Monitor EU Smart Tachograph driver card validity, 56-hour fortnightly drive limits, and weekly rest periods.
        </p>
      </div>

      <div style={{ background: '#0b1329', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 14px 0', color: '#38bdf8', fontSize: '1rem' }}>Register Driver Card</h3>
        <form onSubmit={handleFormSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div>
            <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Full Name</label>
            <input
              type="text"
              placeholder="e.g. Marco Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', borderRadius: '4px', padding: '8px', color: '#fff' }}
            />
          </div>
          <div>
            <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Tachograph Card No.</label>
            <input
              type="text"
              placeholder="e.g. E5544332210000"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              required
              style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', borderRadius: '4px', padding: '8px', color: '#fff' }}
            />
          </div>
          <div>
            <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Card Expiry Date</label>
            <input
              type="date"
              value={cardExpiry}
              onChange={(e) => setCardExpiry(e.target.value)}
              style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', borderRadius: '4px', padding: '8px', color: '#fff' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              type="submit"
              style={{ width: '100%', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '10px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Add Driver Card
            </button>
          </div>
        </form>
      </div>

      <div style={{ background: '#0b1329', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#f8fafc', fontSize: '1rem' }}>Active Driver Card Compliance Roster</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#020617', color: '#94a3b8' }}>
                <th style={{ padding: '10px' }}>Driver ID</th>
                <th style={{ padding: '10px' }}>Name</th>
                <th style={{ padding: '10px' }}>Card Number</th>
                <th style={{ padding: '10px' }}>Card Expiry</th>
                <th style={{ padding: '10px' }}>Weekly Driving</th>
                <th style={{ padding: '10px' }}>Rest Compliance</th>
                <th style={{ padding: '10px' }}>Recent Border Cross</th>
              </tr>
            </thead>
            <tbody>
              {rosterDrivers.map((d) => (
                <tr key={d.id} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: '#38bdf8' }}>{d.id}</td>
                  <td style={{ padding: '10px', fontWeight: 600, color: '#fff' }}>{d.name}</td>
                  <td style={{ padding: '10px', fontFamily: 'monospace', color: '#cbd5e1' }}>{d.cardNumber}</td>
                  <td style={{ padding: '10px', color: '#94a3b8' }}>{d.cardExpiry}</td>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: d.hoursThisWeek >= 50 ? '#ef4444' : '#fff' }}>
                    {d.hoursThisWeek} / 56 hrs
                  </td>
                  <td style={{ padding: '10px' }}>{getStatusBadge(d.weeklyRestStatus)}</td>
                  <td style={{ padding: '10px', color: '#94a3b8' }}>{d.lastBorderCrossing}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}