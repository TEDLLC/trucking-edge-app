import React, { useState, useEffect } from 'react';
import { useRegionStore } from '../services/useRegion';
import { EuFuelTaxRefund } from '../components/EuFuelTaxRefund';
import { EuTollTracker } from '../components/EuTollTracker';

interface FuelLog {
  jurisdiction: string;
  gallons: number;
  totalCost: number;
}

interface FuelPageProps {
  fuelLogs?: FuelLog[];
  onAddFuelLog?: (log: FuelLog) => void;
}

export const FuelPage: React.FC<FuelPageProps> = ({ 
  fuelLogs: externalFuelLogs, 
  onAddFuelLog 
}) => {
  const { region } = useRegionStore();
  
  const [currentRegion, setCurrentRegion] = useState<string>(() => {
    return localStorage.getItem('regionMode') || region || 'US (FMCSA)';
  });

  useEffect(() => {
    const syncRegion = () => {
      const stored = localStorage.getItem('regionMode');
      if (stored) setCurrentRegion(stored);
    };

    window.addEventListener('storage', syncRegion);
    const interval = setInterval(syncRegion, 500);

    return () => {
      window.removeEventListener('storage', syncRegion);
      clearInterval(interval);
    };
  }, []);

  const isEU = currentRegion.includes('EU') || region === 'EU' || region?.includes('EU');
  const currencySymbol = isEU ? '€' : '$';
  const volumeLabel = isEU ? 'Liters Purchased' : 'Gallons Purchased';
  const volumeUnit = isEU ? 'L' : 'gal';

  const [jurisdiction, setJurisdiction] = useState(isEU ? 'DE' : 'TX');
  const [gallons, setGallons] = useState<string>(isEU ? '200' : '50');
  const [totalCost, setTotalCost] = useState<string>(isEU ? '350' : '200');

  const [internalReceipts, setInternalReceipts] = useState<FuelLog[]>(
    isEU 
      ? [
          { jurisdiction: 'DE', gallons: 450.0, totalCost: 680.0 },
          { jurisdiction: 'FR', gallons: 320.0, totalCost: 510.0 }
        ]
      : [
          { jurisdiction: 'TX', gallons: 120.5, totalCost: 482.0 },
          { jurisdiction: 'IL', gallons: 85.0, totalCost: 357.0 }
        ]
  );

  const receipts = externalFuelLogs || internalReceipts;

  const usMileageMap: { [state: string]: number } = {
    TX: 950,
    IL: 620,
    OH: 410,
    IN: 300,
    PA: 450
  };

  const euMileageMap: { [country: string]: number } = {
    DE: 850,
    FR: 720,
    NL: 400,
    PL: 650,
    ES: 900
  };

  const mileageMap = isEU ? euMileageMap : usMileageMap;

  const handleRecord = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const gNum = parseFloat(gallons);
    const cNum = parseFloat(totalCost);

    if (isNaN(gNum) || isNaN(cNum) || gNum <= 0 || cNum <= 0) {
      alert('Please enter valid numbers.');
      return;
    }

    const newReceipt: FuelLog = {
      jurisdiction,
      gallons: gNum,
      totalCost: cNum
    };

    if (onAddFuelLog) {
      onAddFuelLog(newReceipt);
    } else {
      setInternalReceipts([newReceipt, ...internalReceipts]);
    }

    setGallons(isEU ? '200' : '50');
    setTotalCost(isEU ? '350' : '200');
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
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '8px' }}>
        {isEU ? 'Fuel Map & Energy Consumption Tracker' : 'Fuel Map & IFTA Tracker'}
      </h2>
      <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
        {isEU 
          ? `Monitor cross-border fuel purchases, distance metrics, and regional operating efficiency (${currentRegion}).` 
          : `Log jurisdiction-specific fuel purchases and monitor automated IFTA quarterly tax reports (${currentRegion}).`}
      </p>

      {/* EU Specific Compliance Tools */}
      {isEU && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
          <EuFuelTaxRefund />
          <EuTollTracker />
        </div>
      )}

      <div style={{ background: '#090d16', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px', color: '#38bdf8' }}>Log Fuel Purchase</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>
              {isEU ? 'Jurisdiction (Country)' : 'Jurisdiction (State)'}
            </label>
            <select
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', outline: 'none' }}
            >
              {isEU ? (
                <>
                  <option value="AT">Austria (AT)</option>
                  <option value="BE">Belgium (BE)</option>
                  <option value="BG">Bulgaria (BG)</option>
                  <option value="HR">Croatia (HR)</option>
                  <option value="CY">Cyprus (CY)</option>
                  <option value="CZ">Czech Republic (CZ)</option>
                  <option value="DK">Denmark (DK)</option>
                  <option value="EE">Estonia (EE)</option>
                  <option value="FI">Finland (FI)</option>
                  <option value="FR">France (FR)</option>
                  <option value="DE">Germany (DE)</option>
                  <option value="GR">Greece (GR)</option>
                  <option value="HU">Hungary (HU)</option>
                  <option value="IE">Ireland (IE)</option>
                  <option value="IT">Italy (IT)</option>
                  <option value="LV">Latvia (LV)</option>
                  <option value="LT">Lithuania (LT)</option>
                  <option value="LU">Luxembourg (LU)</option>
                  <option value="MT">Malta (MT)</option>
                  <option value="NL">Netherlands (NL)</option>
                  <option value="NO">Norway (NO)</option>
                  <option value="PL">Poland (PL)</option>
                  <option value="PT">Portugal (PT)</option>
                  <option value="RO">Romania (RO)</option>
                  <option value="SK">Slovakia (SK)</option>
                  <option value="SI">Slovenia (SI)</option>
                  <option value="ES">Spain (ES)</option>
                  <option value="SE">Sweden (SE)</option>
                  <option value="CH">Switzerland (CH)</option>
                  <option value="GB">United Kingdom (GB)</option>
                </>
              ) : (
                <>
                  <option value="TX">Texas (TX)</option>
                  <option value="IL">Illinois (IL)</option>
                  <option value="OH">Ohio (OH)</option>
                  <option value="IN">Indiana (IN)</option>
                  <option value="PA">Pennsylvania (PA)</option>
                </>
              )}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>{volumeLabel}</label>
            <input
              type="text"
              value={gallons}
              onChange={(e) => setGallons(e.target.value)}
              style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Total Cost ({currencySymbol})</label>
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
        <h3 style={{ fontSize: '1rem', fontWeight: '600', padding: '16px', borderBottom: '1px solid #1e293b', color: '#38bdf8' }}>
          {isEU ? 'Regional Tax & Distance Breakdown' : 'Quarterly IFTA Tax & Mileage Breakdown'}
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#1e293b', color: '#94a3b8' }}>
              <th style={{ padding: '12px 16px' }}>Jurisdiction</th>
              <th style={{ padding: '12px 16px' }}>{isEU ? 'Total Distance' : 'Total Miles'}</th>
              <th style={{ padding: '12px 16px' }}>{volumeLabel}</th>
              <th style={{ padding: '12px 16px' }}>Total Spent ({currencySymbol})</th>
              <th style={{ padding: '12px 16px' }}>{isEU ? 'Efficiency' : 'Avg MPG'}</th>
            </tr>
          </thead>
          <tbody>
            {allStates.map((state, idx) => {
              const totalVolume = summaryMap[state]?.gallons || 0;
              const totalDistance = mileageMap[state] || 0;
              const costPaid = summaryMap[state]?.cost || 0;
              const efficiency = totalVolume > 0 ? (totalDistance / totalVolume).toFixed(2) : '0.00';

              return (
                <tr key={idx} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 'bold', color: '#fff' }}>{state}</td>
                  <td style={{ padding: '14px 16px', color: '#cbd5e1' }}>{totalDistance} {isEU ? 'km' : 'mi'}</td>
                  <td style={{ padding: '14px 16px', color: '#38bdf8' }}>{totalVolume.toFixed(1)} {volumeUnit}</td>
                  <td style={{ padding: '14px 16px', color: '#4ade80' }}>{currencySymbol}{costPaid.toFixed(2)}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 'bold', color: '#f59e0b' }}>
                    {efficiency} {isEU ? 'km/L' : 'MPG'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};