import React, { useState, useEffect } from 'react';
import { EuBorderCrossingLog } from '../components/EuBorderCrossingLog';
import { RouteMap } from '../components/RouteMap';
import { useRegionStore } from '../services/useRegion';
import { useUserStore } from '../services/useUserStore';

interface LoadItem {
  id: string;
  route: string;
  distance: number;
  grossRate: number;
  driver: string;
  status: string;
  hostCountry?: string;
  podName?: string;
}

interface LoadsPageProps {
  loads?: any[];
  drivers?: any[];
  onAddLoad?: (newLoad: any) => void;
  onUpdateLoadStatus?: (id: string, status: string) => void;
}

export function LoadsPage({
  loads: externalLoads,
  onAddLoad,
  onUpdateLoadStatus,
}: LoadsPageProps) {
  const { region } = useRegionStore();
  const { role } = useUserStore();
  const isEU = region === 'EU';

  // Regional Mock Data Default Sets
  const usDefaultLoads: LoadItem[] = [
    {
      id: 'LD-101',
      route: 'Chicago, IL -> Dallas, TX',
      distance: 920,
      grossRate: 2300,
      driver: 'Michael Scott',
      status: 'Assigned',
    },
  ];

  const euDefaultLoads: LoadItem[] = [
    {
      id: 'LD-901',
      route: 'Frankfurt, DE -> Paris, FR',
      distance: 570,
      grossRate: 1425,
      driver: 'Hans Müller',
      status: 'Assigned',
      hostCountry: 'FR',
    },
  ];

  const [internalLoads, setInternalLoads] = useState<LoadItem[]>(isEU ? euDefaultLoads : usDefaultLoads);
  const [podFiles, setPodFiles] = useState<{ [key: string]: string }>({});

  // Form Field State
  const [pickup, setPickup] = useState('');
  const [delivery, setDelivery] = useState('');
  const [distance, setDistance] = useState<number | ''>('');
  const [grossRate, setGrossRate] = useState<number | ''>('');
  const [driver, setDriver] = useState('');

  // Reset page defaults whenever the user switches regions
  useEffect(() => {
    if (isEU) {
      setInternalLoads(euDefaultLoads);
      setPickup('Frankfurt, DE');
      setDelivery('Paris, FR');
      setDistance(570);
      setGrossRate(1425);
      setDriver('Jean Dupont');
    } else {
      setInternalLoads(usDefaultLoads);
      setPickup('Chicago, IL');
      setDelivery('Dallas, TX');
      setDistance(920);
      setGrossRate(2300);
      setDriver('Michael Scott');
    }
  }, [region]);

  const loads = (externalLoads && externalLoads.length > 0 ? externalLoads : internalLoads) as LoadItem[];

  // Dynamic Rate Calculation (RPK for EU / RPM for US)
  const computedRate = React.useMemo(() => {
    const dist = Number(distance);
    const rate = Number(grossRate);
    if (!dist || dist <= 0 || !rate || rate <= 0) return 0;
    return parseFloat((rate / dist).toFixed(2));
  }, [distance, grossRate]);

  // Cabotage Check (EU Only)
  const checkCabotageWarning = (): boolean => {
    if (!isEU) return false;
    const deliveryCountry = delivery.split(',').pop()?.trim().toUpperCase() || 'FR';
    const recentCabotageCount = loads.filter(
      (l) => l.hostCountry === deliveryCountry && l.status !== 'Completed' && l.status !== 'Delivered'
    ).length;
    return recentCabotageCount >= 3;
  };

  const handleBookFreight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!distance || !grossRate) return;

    if (isEU && checkCabotageWarning()) {
      const deliveryCountry = delivery.split(',').pop()?.trim().toUpperCase() || 'FR';
      alert(`⚠️ CABOTAGE VIOLATION WARNING: Maximum 3 cabotage operations in host country (${deliveryCountry}) reached within 7 days.`);
      return;
    }

    const newLoad: LoadItem = {
      id: `LD-${Math.floor(100 + Math.random() * 900)}`,
      route: `${pickup} -> ${delivery}`,
      distance: Number(distance),
      grossRate: Number(grossRate),
      driver,
      status: 'Assigned',
      hostCountry: isEU ? delivery.split(',').pop()?.trim().toUpperCase() : undefined,
    };

    if (onAddLoad) {
      onAddLoad(newLoad);
    } else {
      setInternalLoads([newLoad, ...internalLoads]);
    }
  };

  const handleStatusChange = (loadId: string, newStatus: string) => {
    if (onUpdateLoadStatus) {
      onUpdateLoadStatus(loadId, newStatus);
    } else {
      setInternalLoads((prev) =>
        prev.map((load) => (load.id === loadId ? { ...load, status: newStatus } : load))
      );
    }
  };

  const handleFileUpload = (loadId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPodFiles((prev) => ({ ...prev, [loadId]: file.name }));
      alert(`Proof of Delivery uploaded for Load #${loadId}: ${file.name}`);
    }
  };

  const isCabotageAtLimit = checkCabotageWarning();

  return (
    <div style={{ color: '#f8fafc', padding: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>
          Dispatches & Loads Management
        </h2>
        <span style={{ fontSize: '0.8rem', background: isEU ? '#7c3aed' : '#2563eb', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>
          {isEU ? '🇪🇺 EU Regulations (EC 561/2006)' : '🇺🇸 US FMCSA Rules'}
        </span>
      </div>

      {/* EU ONLY: Border Crossings */}
      {isEU && (
        <div style={{ marginBottom: '24px' }}>
          <EuBorderCrossingLog />
        </div>
      )}

      {/* Dispatch Booking Form (Hidden for Drivers) */}
      {role !== 'driver' && (
        <div style={{ background: '#0b1329', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.05rem' }}>Book New Freight</h3>
            {isEU && isCabotageAtLimit && (
              <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid #ef4444', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                ⚠️ Cabotage Threshold Near Limit
              </span>
            )}
          </div>

          <form onSubmit={handleBookFreight}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>
                  Pickup Location ({isEU ? 'City, Country' : 'City, State'})
                </label>
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
                <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>
                  Delivery Location ({isEU ? 'City, Country' : 'City, State'})
                </label>
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
                  Total Distance ({isEU ? 'km' : 'miles'})
                </label>
                <input
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value ? Number(e.target.value) : '')}
                  required
                  style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', borderRadius: '4px', padding: '8px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>
                  Gross Rate ({isEU ? '€' : '$'})
                </label>
                <input
                  type="number"
                  value={grossRate}
                  onChange={(e) => setGrossRate(e.target.value ? Number(e.target.value) : '')}
                  required
                  style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', borderRadius: '4px', padding: '8px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Assign Driver</label>
                <input
                  type="text"
                  value={driver}
                  onChange={(e) => setDriver(e.target.value)}
                  style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', borderRadius: '4px', padding: '8px', color: '#fff' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#020617', padding: '12px 16px', borderRadius: '6px', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                Calculated {isEU ? 'RPK' : 'RPM'}:{' '}
                <strong style={{ color: '#38bdf8', fontSize: '1.1rem' }}>
                  {isEU ? `€${computedRate} / km` : `$${computedRate} / mi`}
                </strong>
              </div>
              <button
                type="submit"
                style={{ background: '#38bdf8', color: '#0f172a', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Dispatch Freight Load
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Dispatches Table with Pipeline Actions */}
      <div style={{ background: '#0b1329', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#f8fafc', fontSize: '1.05rem' }}>
          Active Dispatches & {isEU ? 'RPK' : 'RPM'} Breakdown
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#020617', color: '#94a3b8' }}>
                <th style={{ padding: '10px' }}>Load ID</th>
                <th style={{ padding: '10px' }}>Route</th>
                <th style={{ padding: '10px' }}>Distance</th>
                <th style={{ padding: '10px' }}>Gross Rate</th>
                <th style={{ padding: '10px' }}>{isEU ? 'RPK' : 'RPM'}</th>
                <th style={{ padding: '10px' }}>Driver</th>
                <th style={{ padding: '10px' }}>Status</th>
                <th style={{ padding: '10px' }}>Actions & Documents</th>
              </tr>
            </thead>
            <tbody>
              {loads.map((l) => (
                <tr key={l.id} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: '#38bdf8' }}>{l.id}</td>
                  <td style={{ padding: '10px', color: '#fff' }}>{l.route}</td>
                  <td style={{ padding: '10px', color: '#cbd5e1' }}>
                    {l.distance} {isEU ? 'km' : 'mi'}
                  </td>
                  <td style={{ padding: '10px', color: '#4ade80' }}>
                    {isEU ? `€${l.grossRate}` : `$${l.grossRate}`}
                  </td>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: '#f59e0b' }}>
                    {isEU
                      ? `€${(l.grossRate / (l.distance || 1)).toFixed(2)}/km`
                      : `$${(l.grossRate / (l.distance || 1)).toFixed(2)}/mi`}
                  </td>
                  <td style={{ padding: '10px', color: '#cbd5e1' }}>{l.driver || 'Unassigned'}</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{
                      background: l.status === 'Delivered' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(56, 189, 248, 0.1)',
                      color: l.status === 'Delivered' ? '#4ade80' : '#38bdf8',
                      border: `1px solid ${l.status === 'Delivered' ? '#22c55e' : '#0284c7'}`,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      {l.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {/* Pipeline Action Buttons */}
                      {(l.status === 'Assigned' || l.status === 'Dispatched') && (
                        <button
                          onClick={() => handleStatusChange(l.id, 'En Route')}
                          style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                        >
                          Start Route 🚚
                        </button>
                      )}

                      {l.status === 'En Route' && isEU && (
                        <button
                          onClick={() => handleStatusChange(l.id, 'At Border')}
                          style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                        >
                          At Border 🇪🇺
                        </button>
                      )}

                      {(l.status === 'En Route' || l.status === 'At Border') && (
                        <button
                          onClick={() => handleStatusChange(l.id, 'Delivered')}
                          style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                        >
                          Delivered ✅
                        </button>
                      )}

                      {/* POD Document Upload */}
                      <label style={{ background: '#1e293b', color: '#cbd5e1', border: '1px solid #334155', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>
                        📎 {podFiles[l.id] ? podFiles[l.id] : 'POD'}
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => handleFileUpload(l.id, e)}
                        />
                      </label>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Route Map */}
      {loads.length > 0 && (
        <RouteMap
          pickup={loads[0].route.split('->')[0]?.trim() || pickup}
          delivery={loads[0].route.split('->')[1]?.trim() || delivery}
        />
      )}
    </div>
  );
}