import React, { useState } from 'react';
import { useRegionStore } from '../services/useRegion';
import { EuBorderCrossingLog } from './EuBorderCrossingLog';

interface LoadItem {
  id: string;
  route: string;
  distance: number;
  grossRate: number;
  driver: string;
  status: string;
}

export function LoadsManager() {
  const { region } = useRegionStore();
  const isEU = region === 'EU';

  const [loads, setLoads] = useState<LoadItem[]>([
    {
      id: isEU ? 'LD-EU-901' : 'LD-US-101',
      route: isEU ? 'Frankfurt (DE) -> Paris (FR)' : 'Chicago (IL) -> Dallas (TX)',
      distance: isEU ? 570 : 920,
      grossRate: isEU ? 1425 : 2300,
      driver: isEU ? 'Hans Müller' : 'John Doe',
      status: 'In Transit',
    },
  ]);

  const [pickup, setPickup] = useState('');
  const [delivery, setDelivery] = useState('');
  const [distance, setDistance] = useState<number | ''>('');
  const [rate, setRate] = useState<number | ''>('');
  const [driver, setDriver] = useState('');

  const computedUnitRate = React.useMemo(() => {
    const dist = Number(distance);
    const gross = Number(rate);
    if (!dist || dist <= 0 || !gross || gross <= 0) return 0;
    return parseFloat((gross / dist).toFixed(2));
  }, [distance, rate]);

  const handleBookFreight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!distance || !rate) return;

    const newLoad: LoadItem = {
      id: isEU ? `LD-EU-${Math.floor(100 + Math.random() * 900)}` : `LD-US-${Math.floor(100 + Math.random() * 900)}`,
      route: `${pickup} -> ${delivery}`,
      distance: Number(distance),
      grossRate: Number(rate),
      driver: driver || 'Unassigned',
      status: 'Dispatched',
    };

    setLoads([newLoad, ...loads]);
    setPickup('');
    setDelivery('');
    setDistance('');
    setRate('');
    setDriver('');
  };

  return (
    <div style={{ color: '#f8fafc' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '4px', color: isEU ? '#a855f7' : '#38bdf8' }}>
          {isEU ? '🇪🇺 EU Cabotage & Dispatches' : '🇺🇸 US Freight Dispatches & Loads'}
        </h2>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem' }}>
          {isEU ? 'Manage Regulation (EC) 1072/2009 Cabotage Limits & Rate Per Kilometer' : 'FMCSA Interstate Load Boards & Rate Per Mile Dispatching'}
        </p>
      </div>

      {/* RENDER EU BORDER LOG ONLY IF LOGGED IN AS EU */}
      {isEU && (
        <div style={{ marginBottom: '24px' }}>
          <EuBorderCrossingLog />
        </div>
      )}

      {/* Freight Dispatch Form */}
      <div style={{ background: '#0b1329', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#f8fafc', fontSize: '1rem' }}>
          {isEU ? 'Dispatch EU Freight (EUR / KM)' : 'Dispatch US Freight (USD / Miles)'}
        </h3>

        <form onSubmit={handleBookFreight}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Pickup Location</label>
              <input
                type="text"
                placeholder={isEU ? 'e.g. Frankfurt, DE' : 'e.g. Chicago, IL'}
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                required
                style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', borderRadius: '4px', padding: '8px', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Delivery Location</label>
              <input
                type="text"
                placeholder={isEU ? 'e.g. Paris, FR' : 'e.g. Dallas, TX'}
                value={delivery}
                onChange={(e) => setDelivery(e.target.value)}
                required
                style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', borderRadius: '4px', padding: '8px', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>
                {isEU ? 'Total Distance (km)' : 'Total Distance (miles)'}
              </label>
              <input
                type="number"
                placeholder={isEU ? '570' : '920'}
                value={distance}
                onChange={(e) => setDistance(e.target.value ? Number(e.target.value) : '')}
                required
                style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', borderRadius: '4px', padding: '8px', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>
                {isEU ? 'Gross Rate (€)' : 'Gross Rate ($)'}
              </label>
              <input
                type="number"
                placeholder={isEU ? '1425' : '2300'}
                value={rate}
                onChange={(e) => setRate(e.target.value ? Number(e.target.value) : '')}
                required
                style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', borderRadius: '4px', padding: '8px', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Assign Driver</label>
              <input
                type="text"
                placeholder="Driver Name"
                value={driver}
                onChange={(e) => setDriver(e.target.value)}
                style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', borderRadius: '4px', padding: '8px', color: '#fff' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#020617', padding: '12px 16px', borderRadius: '6px', border: '1px solid #1e293b' }}>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              {isEU ? 'Calculated RPK: ' : 'Calculated RPM: '}
              <strong style={{ color: isEU ? '#a855f7' : '#38bdf8', fontSize: '1.05rem' }}>
                {isEU ? `€${computedUnitRate} / km` : `$${computedUnitRate} / mi`}
              </strong>
            </div>
            <button
              type="submit"
              style={{ background: isEU ? '#a855f7' : '#38bdf8', color: '#0f172a', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Dispatch Freight Load
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}