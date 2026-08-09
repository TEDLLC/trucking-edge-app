import React, { useState } from 'react';

export const EuCsrdEmissions: React.FC = () => {
  const [fuelConsumedLiters, setFuelConsumedLiters] = useState<string>('3500');
  const [cargoWeightTons, setCargoWeightTons] = useState<string>('18');
  const [distanceKm, setDistanceKm] = useState<string>('2400');

  // Standard EU DEFRA/IPCC conversion factor for Diesel (~2.68 kg CO2 per liter)
  const liters = parseFloat(fuelConsumedLiters) || 0;
  const tons = parseFloat(cargoWeightTons) || 0;
  const km = parseFloat(distanceKm) || 0;

  const totalCo2Kg = liters * 2.68;
  const totalTonKm = tons * km;
  const co2GramsPerTonKm = totalTonKm > 0 ? (totalCo2Kg * 1000) / totalTonKm : 0;

  return (
    <div style={{ background: '#0b1329', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.05rem', fontWeight: 600 }}>
          CSRD Fleet $CO_2$ Emissions Report
        </h3>
        <span style={{ fontSize: '0.75rem', background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(74, 222, 128, 0.2)' }}>
          ESRS E1 Climate Standard
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '6px' }}>Total Fuel (Liters)</label>
          <input
            type="number"
            value={fuelConsumedLiters}
            onChange={(e) => setFuelConsumedLiters(e.target.value)}
            style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', padding: '10px', color: '#f8fafc', outline: 'none' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '6px' }}>Avg Cargo Weight (Tons)</label>
          <input
            type="number"
            value={cargoWeightTons}
            onChange={(e) => setCargoWeightTons(e.target.value)}
            style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', padding: '10px', color: '#f8fafc', outline: 'none' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '6px' }}>Total Distance (km)</label>
          <input
            type="number"
            value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value)}
            style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', padding: '10px', color: '#f8fafc', outline: 'none' }}
          />
        </div>
      </div>

      <div style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '8px', padding: '14px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <span style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block' }}>Scope 1 Total $CO_2$ Output</span>
          <span style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 700 }}>
            {(totalCo2Kg / 1000).toFixed(2)} Metric Tons
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block' }}>Carbon Intensity</span>
          <span style={{ color: '#38bdf8', fontSize: '1.1rem', fontWeight: 700 }}>
            {co2GramsPerTonKm.toFixed(1)} g $CO_2$ / tkm
          </span>
        </div>
      </div>
    </div>
  );
};