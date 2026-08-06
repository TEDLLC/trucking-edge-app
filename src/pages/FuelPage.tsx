import React, { useState } from 'react';

export function FuelPage() {
  const [jurisdiction, setJurisdiction] = useState('TX');
  const [gallons, setGallons] = useState<string>('50');
  const [totalCost, setTotalCost] = useState<string>('200');

  const [receipts, setReceipts] = useState([
    { jurisdiction: 'TX', gallons: 120.5, totalCost: 482.0 },
    { jurisdiction: 'IL', gallons: 85.0, totalCost: 357.0 }
  ]);

  const mileageMap: { [state: string]: number } = {
    TX: 950,
    IL: 620,
    OH: 410,
    IN: 300,
    PA: 450
  };

  const handleRecord = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const gNum = parseFloat(gallons);
    const cNum = parseFloat(totalCost);

    if (isNaN(gNum) || isNaN(cNum) || gNum <= 0 || cNum <= 0) {
      alert('Please enter valid numbers.');
      return;
    }

    const newReceipt = {
      jurisdiction,
      gallons: gNum,
      totalCost: cNum
    };

    setReceipts([newReceipt, ...receipts]);
    setGallons('50');
    setTotalCost('200');
  };

  const summaryMap: { [state: string]: { gallons: number; cost: number } } = {};
  receipts.forEach(r => {
    if (!summaryMap[r.jurisdiction]) {
      summaryMap[r.jurisdiction] = { gallons: 0, cost: 0 };
    }
    summaryMap[r.jurisdiction].gallons += r.gallons;
    summaryMap[r.jurisdiction].cost += r.totalCost;
  });

  const allStates = Array.from(new Set([...Object.keys(summaryMap), ...Object.keys(mileageMap)]));

  return (
    <div style={{ color: '#f8fafc', padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '8px' }}>Fuel Map & IFTA Tracker</h2>
      <p style={{ color: '#94a3b8', marginBottom: '24px' }}>Log jurisdiction-specific fuel purchases and monitor automated IFTA quarterly tax reports.</p>

      <div style={{ background: '#090d16', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px', color: '#38bdf8' }}>Log Fuel Purchase</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Jurisdiction (State)</label>
            <select
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', outline: 'none' }}
            >
              <option value="TX">Texas (TX)</option>
              <option value="IL">Illinois (IL)</option>
              <option value="OH">Ohio (OH)</option>
              <option value="IN">Indiana (IN)</option>
              <option value="PA">Pennsylvania (PA)</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Gallons Purchased</label>
            <input
              type="text"
              value={gallons}
              onChange={(e) => setGallons(e.target.value)}
              style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Total Cost ($)</label>
            <input
              type="text"
              value={totalCost}
              onChange={(e) => setTotalCost(e.target.value)}
              style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', outline: 'none' }}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleRecord}
          style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Record Fuel Purchase
        </button>
      </div>

      <div style={{ background: '#090d16', borderRadius: '12px', border: '1px solid #1e293b', overflow: 'hidden' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', padding: '16px', borderBottom: '1px solid #1e293b', color: '#38bdf8' }}>Quarterly IFTA Tax & Mileage Breakdown</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#1e293b', color: '#94a3b8' }}>
              <th style={{ padding: '12px 16px' }}>Jurisdiction</th>
              <th style={{ padding: '12px 16px' }}>Total Miles</th>
              <th style={{ padding: '12px 16px' }}>Gallons Purchased</th>
              <th style={{ padding: '12px 16px' }}>Total Spent ($)</th>
              <th style={{ padding: '12px 16px' }}>Avg MPG</th>
            </tr>
          </thead>
          <tbody>
            {allStates.map((state, idx) => {
              const totalGallons = summaryMap[state]?.gallons || 0;
              const totalMiles = mileageMap[state] || 0;
              const taxPaid = summaryMap[state]?.cost || 0;
              const mpg = totalGallons > 0 ? (totalMiles / totalGallons).toFixed(2) : '0.00';

              return (
                <tr key={idx} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 'bold', color: '#fff' }}>{state}</td>
                  <td style={{ padding: '14px 16px', color: '#cbd5e1' }}>{totalMiles} mi</td>
                  <td style={{ padding: '14px 16px', color: '#38bdf8' }}>{totalGallons.toFixed(1)} gal</td>
                  <td style={{ padding: '14px 16px', color: '#4ade80' }}>${taxPaid.toFixed(2)}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 'bold', color: '#f59e0b' }}>{mpg} MPG</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}