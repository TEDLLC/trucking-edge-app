import React, { useState } from 'react';

export default function InsuranceCalculator() {
  const [vehicleValue, setVehicleValue] = useState<number>(55000);
  const [drivingRadius, setDrivingRadius] = useState<string>('Regional (50–500 miles)');
  const [experience, setExperience] = useState<string>('2-5 Years');
  const [hasLiability, setHasLiability] = useState<boolean>(true);
  const [hasPhysicalDamage, setHasPhysicalDamage] = useState<boolean>(true);
  const [hasCargo, setHasCargo] = useState<boolean>(false);

  // Simple premium estimation logic
  let baseRate = vehicleValue * 0.02; 
  if (drivingRadius.includes('Long Haul')) baseRate *= 1.4;
  if (experience.includes('0–1 Year')) baseRate *= 1.3;
  
  let coverageMultiplier = (hasLiability ? 1 : 0) + (hasPhysicalDamage ? 0.8 : 0) + (hasCargo ? 0.5 : 0);
  const annualEstimate = Math.round(baseRate * Math.max(coverageMultiplier, 0.5));
  const monthlyEstimate = Math.round(annualEstimate / 12);

  return (
    <div style={{ background: '#ffffff', color: '#1e293b', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', maxWidth: '500px', width: '100%', boxSizing: 'border-box' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: '0 0 6px 0', color: '#0f172a' }}>Carrier Insurance Calculator</h3>
        <p style={{ color: '#64748b', fontSize: '0.813rem', margin: 0 }}>Estimate your commercial insurance premiums based on vehicle specs and coverage options.</p>
      </div>

      {/* Vehicle Value Slider */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: '600', marginBottom: '8px', color: '#334155' }}>
          Vehicle & Trailer Value ($): <span style={{ color: '#2563eb' }}>${vehicleValue.toLocaleString()}</span>
        </label>
        <input 
          type="range" 
          min="10000" 
          max="250000" 
          step="5000"
          value={vehicleValue} 
          onChange={(e) => setVehicleValue(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#2563eb', cursor: 'pointer' }}
        />
      </div>

      {/* Dropdown Options Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Driving Radius</label>
          <select 
            value={drivingRadius} 
            onChange={(e) => setDrivingRadius(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', fontSize: '0.813rem', outline: 'none' }}
          >
            <option value="Local (0–50 miles)">Local (0–50 miles)</option>
            <option value="Regional (50–500 miles)">Regional (50–500 miles)</option>
            <option value="Long Haul (500+ miles)">Long Haul (500+ miles / Nationwide)</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Commercial Experience</label>
          <select 
            value={experience} 
            onChange={(e) => setExperience(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', fontSize: '0.813rem', outline: 'none' }}
          >
            <option value="New Venture (0–1 Year)">New Venture (0–1 Year)</option>
            <option value="1-3 Years">1–3 Years</option>
            <option value="2-5 Years">2–5 Years</option>
            <option value="5+ Years">5+ Years</option>
          </select>
        </div>
      </div>

      {/* Coverage Type Checkboxes */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Coverage Types</label>
        <div style={{ display: 'flex', gap: '16px', fontSize: '0.813rem', color: '#334155' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input type="checkbox" checked={hasLiability} onChange={(e) => setHasLiability(e.target.checked)} /> Liability
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input type="checkbox" checked={hasPhysicalDamage} onChange={(e) => setHasPhysicalDamage(e.target.checked)} /> Physical Damage
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input type="checkbox" checked={hasCargo} onChange={(e) => setHasCargo(e.target.checked)} /> Cargo
          </label>
        </div>
      </div>

      {/* Output Results Box */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
        <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: '700', color: '#64748b', letterSpacing: '0.05em' }}>Estimated Premium Breakdown</span>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '12px' }}>
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Estimated Monthly</span>
            <strong style={{ fontSize: '1.25rem', color: '#2563eb' }}>${monthlyEstimate} /mo</strong>
          </div>
          <div style={{ borderLeft: '1px solid #cbd5e1', paddingLeft: '20px' }}>
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Estimated Annual</span>
            <strong style={{ fontSize: '1.25rem', color: '#2563eb' }}>${annualEstimate.toLocaleString()} /yr</strong>
          </div>
        </div>
      </div>

    </div>
  );
}