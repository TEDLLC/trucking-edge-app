import React, { useState, useEffect } from 'react';

interface BorderCrossingRecord {
  id: string;
  driverName: string;
  vehicleReg: string;
  entryCountry: string;
  exitCountry: string;
  timestamp: string;
  odometerKm: number;
}

const DEFAULT_CROSSINGS: BorderCrossingRecord[] = [
  {
    id: '1',
    driverName: 'Hans Müller',
    vehicleReg: 'B-MW 1024',
    entryCountry: 'FR',
    exitCountry: 'DE',
    timestamp: '2026-08-08 14:15',
    odometerKm: 342150
  },
  {
    id: '2',
    driverName: 'Piotr Kowalski',
    vehicleReg: 'WI 90812',
    entryCountry: 'DE',
    exitCountry: 'PL',
    timestamp: '2026-08-08 09:30',
    odometerKm: 198420
  }
];

const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 
  'NO', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'CH', 'GB'
];

export const EuBorderCrossingLog: React.FC = () => {
  const [crossings, setCrossings] = useState<BorderCrossingRecord[]>(() => {
    const saved = localStorage.getItem('eu_border_crossings');
    return saved ? JSON.parse(saved) : DEFAULT_CROSSINGS;
  });

  const [driverName, setDriverName] = useState('Jean Dupont');
  const [vehicleReg, setVehicleReg] = useState('789-XYZ-75');
  const [exitCountry, setExitCountry] = useState('FR');
  const [entryCountry, setEntryCountry] = useState('BE');
  const [odometer, setOdometer] = useState<number>(210500);

  useEffect(() => {
    localStorage.setItem('eu_border_crossings', JSON.stringify(crossings));
  }, [crossings]);

  const handleAddCrossing = (e: React.FormEvent) => {
    e.preventDefault();
    const newCrossing: BorderCrossingRecord = {
      id: Date.now().toString(),
      driverName,
      vehicleReg,
      exitCountry,
      entryCountry,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      odometerKm: odometer
    };

    setCrossings([newCrossing, ...crossings]);
  };

  const adjustOdometer = (amount: number) => {
    setOdometer((prev) => Math.max(0, prev + amount));
  };

  const exportCSV = () => {
    const headers = ['Timestamp,Driver,Vehicle,Exit Country,Entry Country,Odometer (km)'];
    const rows = crossings.map(c => 
      `"${c.timestamp}","${c.driverName}","${c.vehicleReg}","${c.exitCountry}","${c.entryCountry}",${c.odometerKm}`
    );
    const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EU_Border_Crossings_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div style={{ background: '#0b1329', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.05rem', fontWeight: 600 }}>
            Smart Tachograph Border Crossing Log
          </h3>
          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
            Reg (EU) 2020/1054 &bull; Mandatory Border Crossing Country Entry
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={exportCSV}
            style={{ background: '#1e293b', color: '#38bdf8', border: '1px solid #334155', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
          >
            📥 Export CSV
          </button>
          <span style={{ fontSize: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            Cabotage Guard Active
          </span>
        </div>
      </div>

      <form onSubmit={handleAddCrossing} style={{ background: '#020617', padding: '16px', borderRadius: '8px', border: '1px solid #1e293b', marginBottom: '16px' }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#38bdf8', fontSize: '0.9rem' }}>Log Border Entry</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Driver</label>
            <input
              type="text"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              style={{ width: '100%', background: '#0b1329', border: '1px solid #1e293b', borderRadius: '4px', padding: '6px 8px', color: '#fff', fontSize: '0.85rem' }}
            />
          </div>

          <div>
            <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Exit Country</label>
            <select
              value={exitCountry}
              onChange={(e) => setExitCountry(e.target.value)}
              style={{ width: '100%', background: '#0b1329', border: '1px solid #1e293b', borderRadius: '4px', padding: '6px 8px', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
            >
              {EU_COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Entry Country</label>
            <select
              value={entryCountry}
              onChange={(e) => setEntryCountry(e.target.value)}
              style={{ width: '100%', background: '#0b1329', border: '1px solid #1e293b', borderRadius: '4px', padding: '6px 8px', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
            >
              {EU_COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Odometer (km)</label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => adjustOdometer(-100)}
                style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRight: 'none', borderRadius: '4px 0 0 4px', padding: '6px 10px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                -
              </button>
              <input
                type="number"
                value={odometer}
                onChange={(e) => setOdometer(Number(e.target.value))}
                style={{ width: '100%', background: '#0b1329', border: '1px solid #1e293b', textAlign: 'center', padding: '6px 4px', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
              />
              <button
                type="button"
                onClick={() => adjustOdometer(100)}
                style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', borderLeft: 'none', borderRadius: '0 4px 4px 0', padding: '6px 10px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                +
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          style={{ background: '#38bdf8', color: '#0f172a', border: 'none', padding: '6px 14px', borderRadius: '4px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
        >
          Record Border Entry
        </button>
      </form>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#020617', color: '#94a3b8' }}>
              <th style={{ padding: '8px 10px' }}>Timestamp</th>
              <th style={{ padding: '8px 10px' }}>Driver</th>
              <th style={{ padding: '8px 10px' }}>Vehicle</th>
              <th style={{ padding: '8px 10px' }}>Route Cross</th>
              <th style={{ padding: '8px 10px', textAlign: 'right' }}>Odometer</th>
            </tr>
          </thead>
          <tbody>
            {crossings.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #1e293b' }}>
                <td style={{ padding: '8px 10px', color: '#cbd5e1' }}>{c.timestamp}</td>
                <td style={{ padding: '8px 10px', fontWeight: 600, color: '#fff' }}>{c.driverName}</td>
                <td style={{ padding: '8px 10px', color: '#94a3b8' }}>{c.vehicleReg}</td>
                <td style={{ padding: '8px 10px', color: '#38bdf8', fontWeight: 600 }}>{c.exitCountry} &rarr; {c.entryCountry}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', color: '#4ade80' }}>{c.odometerKm.toLocaleString()} km</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};