import React, { useState, useEffect } from 'react';
import { getLoads, createLoad, updateLoadStatus } from '../utils/loadService';
import { getCustomers } from '../utils/customerService';
import { useRegionStore } from '../services/useRegion';
import { useUserStore } from '../services/useUserStore';

interface LoadsPageProps {
  loads?: any[];
  drivers?: any[];
  onAddLoad?: (newLoad: any) => void;
  onUpdateLoadStatus?: (id: string, status: string) => void;
}

export function LoadsPage({
  loads: externalLoads,
  drivers = [],
  onAddLoad,
  onUpdateLoadStatus,
}: LoadsPageProps) {
  const { region } = useRegionStore();
  const { role } = useUserStore();
  const isEU = region === 'EU';

  const [loads, setLoads] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [podFiles, setPodFiles] = useState<{ [key: string]: string }>({});

  // Form Field State
  const [loadNumber, setLoadNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [originCity, setOriginCity] = useState(isEU ? 'Frankfurt, DE' : 'Chicago, IL');
  const [destinationCity, setDestinationCity] = useState(isEU ? 'Paris, FR' : 'Dallas, TX');
  const [distance, setDistance] = useState<number | ''>(isEU ? 570 : 920);
  const [grossRate, setGrossRate] = useState<number | ''>(isEU ? 1425 : 2300);
  const [fuelSurcharge, setFuelSurcharge] = useState<number | ''>(200);

  useEffect(() => {
    fetchData();
  }, [region]);

  async function fetchData() {
    try {
      setLoading(true);
      const [loadsData, customersData] = await Promise.all([
        getLoads(),
        getCustomers()
      ]);
      setLoads(loadsData || []);
      setCustomers(customersData || []);
    } catch (err) {
      console.error('Error loading dispatches from Supabase:', err);
    } finally {
      setLoading(false);
    }
  }

  // Use external loads if provided by App.tsx, otherwise fallback to fetched Supabase loads
  const activeLoads = externalLoads && externalLoads.length > 0 ? externalLoads : loads;

  const handleBookFreight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loadNumber || !customerName || !distance || !grossRate) return;

    try {
      const newLoadData = {
        customer_id: customerName, // Accepts custom typed shipper / customer name
        load_number: loadNumber,
        rate: Number(grossRate),
        fuel_surcharge: Number(fuelSurcharge) || 0,
        pickup_date: new Date().toISOString(),
        delivery_date: new Date(Date.now() + 86400000 * 2).toISOString(),
        origin_city: originCity,
        destination_city: destinationCity
      };

      const created = await createLoad(newLoadData);
      
      if (onAddLoad) {
        onAddLoad(created);
      }

      setShowModal(false);
      setLoadNumber('');
      setCustomerName('');
      fetchData();
    } catch (err) {
      console.error('Failed to create load in Supabase:', err);
    }
  };

  const handleStatusChange = async (loadId: string, newStatus: string) => {
    try {
      const dbStatusMap: { [key: string]: string } = {
        'Assigned': 'dispatched',
        'En Route': 'in_transit',
        'At Border': 'in_transit',
        'Delivered': 'delivered',
        'Cancelled': 'cancelled'
      };
      
      const mappedStatus = dbStatusMap[newStatus] || newStatus.toLowerCase();
      await updateLoadStatus(loadId, mappedStatus);

      if (onUpdateLoadStatus) {
        onUpdateLoadStatus(loadId, newStatus);
      }
      fetchData();
    } catch (err) {
      console.error('Failed to update load status:', err);
    }
  };

  const handleFileUpload = (loadId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPodFiles((prev) => ({ ...prev, [loadId]: file.name }));
    }
  };

  if (loading) {
    return <div style={{ color: '#f8fafc', padding: '20px' }}>Loading Dispatches from Supabase...</div>;
  }

  return (
    <div style={{ color: '#f8fafc', padding: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>
          Dispatches & Loads Management
        </h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', background: isEU ? '#7c3aed' : '#2563eb', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>
            {isEU ? '🇪🇺 EU Regulations (EC 561/2006)' : '🇺🇸 US FMCSA Rules'}
          </span>
          {role !== 'driver' && (
            <button
              onClick={() => setShowModal(true)}
              style={{ background: '#4f46e5', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              + Book New Load
            </button>
          )}
        </div>
      </div>

      {/* Modal for Booking New Load */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div style={{ background: '#0b1329', border: '1px solid #1e293b', borderRadius: '12px', width: '100%', maxWidth: '500px', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#f8fafc', fontSize: '1.2rem' }}>Book New Freight Load</h3>
            
            <form onSubmit={handleBookFreight}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Load / Order #</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LD-1001"
                    value={loadNumber}
                    onChange={(e) => setLoadNumber(e.target.value)}
                    style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', borderRadius: '4px', padding: '8px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Customer / Shipper</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter shipper or customer name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', borderRadius: '4px', padding: '8px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Origin City</label>
                  <input
                    type="text"
                    required
                    value={originCity}
                    onChange={(e) => setOriginCity(e.target.value)}
                    style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', borderRadius: '4px', padding: '8px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Destination City</label>
                  <input
                    type="text"
                    required
                    value={destinationCity}
                    onChange={(e) => setDestinationCity(e.target.value)}
                    style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', borderRadius: '4px', padding: '8px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Distance ({isEU ? 'km' : 'mi'})</label>
                  <input
                    type="number"
                    required
                    value={distance}
                    onChange={(e) => setDistance(e.target.value ? Number(e.target.value) : '')}
                    style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', borderRadius: '4px', padding: '8px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Linehaul Rate</label>
                  <input
                    type="number"
                    required
                    value={grossRate}
                    onChange={(e) => setGrossRate(e.target.value ? Number(e.target.value) : '')}
                    style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', borderRadius: '4px', padding: '8px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Fuel Surcharge</label>
                  <input
                    type="number"
                    value={fuelSurcharge}
                    onChange={(e) => setFuelSurcharge(e.target.value ? Number(e.target.value) : '')}
                    style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', borderRadius: '4px', padding: '8px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #1e293b', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ background: '#1e293b', color: '#cbd5e1', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: '#4f46e5', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Save & Book Load
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispatches Table */}
      <div style={{ background: '#0b1329', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#f8fafc', fontSize: '1.05rem' }}>
          Active Dispatches & Financial Breakdown
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#020617', color: '#94a3b8' }}>
                <th style={{ padding: '10px' }}>Load #</th>
                <th style={{ padding: '10px' }}>Customer</th>
                <th style={{ padding: '10px' }}>Route</th>
                <th style={{ padding: '10px' }}>Total Rate</th>
                <th style={{ padding: '10px' }}>Status</th>
                <th style={{ padding: '10px' }}>Actions & Documents</th>
              </tr>
            </thead>
            <tbody>
              {activeLoads.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                    No loads booked yet. Click "+ Book New Load" to create your first dispatch.
                  </td>
                </tr>
              ) : (
                activeLoads.map((l: any) => {
                  const totalRate = Number(l.rate || l.grossRate || 0) + Number(l.fuel_surcharge || 0);
                  const origin = l.stops?.[0]?.city || l.route?.split('->')[0]?.trim() || l.origin_city || 'Origin';
                  const destination = l.stops?.[l.stops.length - 1]?.city || l.route?.split('->')[1]?.trim() || l.destination_city || 'Destination';
                  const loadNumberStr = l.load_number || l.id;
                  const customerDisplay = l.customers?.company_name || l.customer_id || l.driver || 'N/A';

                  return (
                    <tr key={l.id} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold', color: '#38bdf8' }}>{loadNumberStr}</td>
                      <td style={{ padding: '10px', color: '#fff' }}>{customerDisplay}</td>
                      <td style={{ padding: '10px', color: '#cbd5e1' }}>
                        {origin} $\rightarrow$ {destination}
                      </td>
                      <td style={{ padding: '10px', color: '#4ade80', fontWeight: 'bold' }}>
                        ${totalRate.toFixed(2)}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          background: l.status === 'delivered' || l.status === 'Delivered' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(56, 189, 248, 0.1)',
                          color: l.status === 'delivered' || l.status === 'Delivered' ? '#4ade80' : '#38bdf8',
                          border: `1px solid ${l.status === 'delivered' || l.status === 'Delivered' ? '#22c55e' : '#0284c7'}`,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          textTransform: 'uppercase'
                        }}>
                          {l.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <select
                            value={l.status}
                            onChange={(e) => handleStatusChange(l.id, e.target.value)}
                            style={{ background: '#020617', border: '1px solid #1e293b', color: '#fff', borderRadius: '4px', padding: '4px 8px', fontSize: '0.75rem' }}
                          >
                            <option value="booked">Booked</option>
                            <option value="dispatched">Dispatched</option>
                            <option value="in_transit">In Transit</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>

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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}