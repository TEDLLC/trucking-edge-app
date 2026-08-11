import React, { useState, useEffect } from 'react';
import { getDrivers, createDriver, getVehicles, createVehicle } from '../utils/fleetService';

export function FleetPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'drivers' | 'vehicles'>('drivers');
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);

  // Driver Form State
  const [driverName, setDriverName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [driverEmail, setDriverEmail] = useState('');

  // Vehicle Form State
  const [unitNumber, setUnitNumber] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number | ''>(2024);
  const [plateNumber, setPlateNumber] = useState('');

  useEffect(() => {
    fetchFleetData();
  }, []);

  async function fetchFleetData() {
    try {
      setLoading(true);
      const [driversData, vehiclesData] = await Promise.all([
        getDrivers(),
        getVehicles()
      ]);
      setDrivers(driversData || []);
      setVehicles(vehiclesData || []);
    } catch (err) {
      console.error('Error fetching fleet data from Supabase:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddDriver(e: React.FormEvent) {
    e.preventDefault();
    if (!driverName || !licenseNumber) return;

    try {
      await createDriver({
        name: driverName,
        license_number: licenseNumber,
        phone: driverPhone,
        email: driverEmail
      });
      setShowDriverModal(false);
      setDriverName('');
      setLicenseNumber('');
      setDriverPhone('');
      setDriverEmail('');
      fetchFleetData();
    } catch (err) {
      console.error('Failed to create driver:', err);
    }
  }

  async function handleAddVehicle(e: React.FormEvent) {
    e.preventDefault();
    if (!unitNumber || !make) return;

    try {
      await createVehicle({
        unit_number: unitNumber,
        make,
        model,
        year: Number(year) || 2024,
        plate_number: plateNumber
      });
      setShowVehicleModal(false);
      setUnitNumber('');
      setMake('');
      setModel('');
      setYear(2024);
      setPlateNumber('');
      fetchFleetData();
    } catch (err) {
      console.error('Failed to create vehicle:', err);
    }
  }

  if (loading) {
    return <div style={{ color: '#f8fafc', padding: '20px' }}>Loading Fleet & Roster...</div>;
  }

  return (
    <div style={{ color: '#f8fafc', padding: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>Driver & Asset Fleet Roster</h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0 0' }}>Manage drivers, compliance status, and truck/trailer assets.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {activeTab === 'drivers' ? (
            <button
              onClick={() => setShowDriverModal(true)}
              style={{ background: '#4f46e5', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              + Add Driver
            </button>
          ) : (
            <button
              onClick={() => setShowVehicleModal(true)}
              style={{ background: '#4f46e5', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              + Add Vehicle / Truck
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid #1e293b', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('drivers')}
          style={{ background: 'none', border: 'none', padding: '10px 16px', color: activeTab === 'drivers' ? '#38bdf8' : '#94a3b8', fontWeight: 'bold', borderBottom: activeTab === 'drivers' ? '2px solid #38bdf8' : 'none', cursor: 'pointer' }}
        >
          Drivers Roster ({drivers.length})
        </button>
        <button
          onClick={() => setActiveTab('vehicles')}
          style={{ background: 'none', border: 'none', padding: '10px 16px', color: activeTab === 'vehicles' ? '#38bdf8' : '#94a3b8', fontWeight: 'bold', borderBottom: activeTab === 'vehicles' ? '2px solid #38bdf8' : 'none', cursor: 'pointer' }}
        >
          Trucks & Equipment ({vehicles.length})
        </button>
      </div>

      {/* Drivers Table */}
      {activeTab === 'drivers' && (
        <div style={{ background: '#0b1329', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#020617', color: '#94a3b8' }}>
                <th style={{ padding: '10px' }}>Driver Name</th>
                <th style={{ padding: '10px' }}>License #</th>
                <th style={{ padding: '10px' }}>Phone</th>
                <th style={{ padding: '10px' }}>Email</th>
                <th style={{ padding: '10px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {drivers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                    No drivers found. Click "+ Add Driver" to register personnel.
                  </td>
                </tr>
              ) : (
                drivers.map((d) => (
                  <tr key={d.id} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '10px', fontWeight: 'bold', color: '#fff' }}>{d.name}</td>
                    <td style={{ padding: '10px', fontFamily: 'monospace', color: '#38bdf8' }}>{d.license_number}</td>
                    <td style={{ padding: '10px', color: '#cbd5e1' }}>{d.phone || 'N/A'}</td>
                    <td style={{ padding: '10px', color: '#cbd5e1' }}>{d.email || 'N/A'}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid #22c55e', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Vehicles Table */}
      {activeTab === 'vehicles' && (
        <div style={{ background: '#0b1329', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#020617', color: '#94a3b8' }}>
                <th style={{ padding: '10px' }}>Unit #</th>
                <th style={{ padding: '10px' }}>Make / Model</th>
                <th style={{ padding: '10px' }}>Year</th>
                <th style={{ padding: '10px' }}>License Plate</th>
                <th style={{ padding: '10px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                    No vehicles found. Click "+ Add Vehicle / Truck" to add equipment.
                  </td>
                </tr>
              ) : (
                vehicles.map((v) => (
                  <tr key={v.id} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '10px', fontWeight: 'bold', color: '#38bdf8' }}>{v.unit_number}</td>
                    <td style={{ padding: '10px', color: '#fff' }}>{v.make} {v.model}</td>
                    <td style={{ padding: '10px', color: '#cbd5e1' }}>{v.year}</td>
                    <td style={{ padding: '10px', fontFamily: 'monospace', color: '#cbd5e1' }}>{v.plate_number || 'N/A'}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid #0284c7', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Driver Modal */}
      {showDriverModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div style={{ background: '#0b1329', border: '1px solid #1e293b', borderRadius: '12px', width: '100%', maxWidth: '450px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#f8fafc', fontSize: '1.1rem' }}>Add New Driver</h3>
            <form onSubmit={handleAddDriver}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Michael Scott"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', borderRadius: '4px', padding: '8px', color: '#fff' }}
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>License Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DL-9876543"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', borderRadius: '4px', padding: '8px', color: '#fff' }}
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +1 (555) 019-2834"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', borderRadius: '4px', padding: '8px', color: '#fff' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. driver@truckingedge.com"
                  value={driverEmail}
                  onChange={(e) => setDriverEmail(e.target.value)}
                  style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', borderRadius: '4px', padding: '8px', color: '#fff' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #1e293b', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowDriverModal(false)}
                  style={{ background: '#1e293b', color: '#cbd5e1', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: '#4f46e5', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Save Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showVehicleModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div style={{ background: '#0b1329', border: '1px solid #1e293b', borderRadius: '12px', width: '100%', maxWidth: '450px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#f8fafc', fontSize: '1.1rem' }}>Add New Truck / Asset</h3>
            <form onSubmit={handleAddVehicle}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Unit Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TRK-102"
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                  style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', borderRadius: '4px', padding: '8px', color: '#fff' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Make</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Freightliner"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', borderRadius: '4px', padding: '8px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Model</label>
                  <input
                    type="text"
                    placeholder="e.g. Cascadia"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', borderRadius: '4px', padding: '8px', color: '#fff' }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Year</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value ? Number(e.target.value) : '')}
                    style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', borderRadius: '4px', padding: '8px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Plate Number</label>
                  <input
                    type="text"
                    placeholder="e.g. IL-TRK99"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', borderRadius: '4px', padding: '8px', color: '#fff' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #1e293b', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowVehicleModal(false)}
                  style={{ background: '#1e293b', color: '#cbd5e1', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: '#4f46e5', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}