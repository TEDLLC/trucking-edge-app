import React, { useState } from 'react';

interface Driver {
  id: string;
  name: string;
  truck: string;
  phone: string;
  license: string;
  status: 'Active' | 'On Delivery' | 'Off Duty';
}

export interface DriversPageProps {
  drivers: Driver[];
  onAddDriver: (driver: Driver) => void;
}

export const DriversPage: React.FC<DriversPageProps> = ({ drivers, onAddDriver }) => {
  const [name, setName] = useState('');
  const [truck, setTruck] = useState('');
  const [phone, setPhone] = useState('');
  const [license, setLicense] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !truck) return;

    const newDriver: Driver = {
      id: `DRV-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      truck,
      phone: phone || '555-0100',
      license: license || 'CDL-00000',
      status: 'Active',
    };

    onAddDriver(newDriver);
    setName('');
    setTruck('');
    setPhone('');
    setLicense('');
  };

  return (
    <div style={{ color: '#f8fafc' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '8px' }}>Fleet Driver Roster</h2>
      <p style={{ color: '#94a3b8', marginBottom: '24px' }}>Manage driver assignments, contact info, and operational status.</p>

      {/* Add Driver Form */}
      <form onSubmit={handleSubmit} style={{ background: '#090d16', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px', color: '#38bdf8' }}>Register New Driver</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Driver Full Name</label>
            <input type="text" placeholder="e.g. John Doe" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Truck / Rig Info</label>
            <input type="text" placeholder="e.g. Freightliner #12" value={truck} onChange={(e) => setTruck(e.target.value)} required style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Phone Number</label>
            <input type="text" placeholder="e.g. (555) 019-2834" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>CDL License #</label>
            <input type="text" placeholder="e.g. CDL-88392" value={license} onChange={(e) => setLicense(e.target.value)} style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff' }} />
          </div>
        </div>
        <button type="submit" style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          Register Driver
        </button>
      </form>

      {/* Drivers Table */}
      <div style={{ background: '#090d16', borderRadius: '12px', border: '1px solid #1e293b', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#1e293b', color: '#94a3b8' }}>
              <th style={{ padding: '12px 16px' }}>Driver ID</th>
              <th style={{ padding: '12px 16px' }}>Name</th>
              <th style={{ padding: '12px 16px' }}>Phone</th>
              <th style={{ padding: '12px 16px' }}>Assigned Truck</th>
              <th style={{ padding: '12px 16px' }}>License</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => (
              <tr key={driver.id} style={{ borderBottom: '1px solid #1e293b' }}>
                <td style={{ padding: '14px 16px', fontWeight: 'bold' }}>{driver.id}</td>
                <td style={{ padding: '14px 16px', color: '#fff' }}>{driver.name}</td>
                <td style={{ padding: '14px 16px', color: '#cbd5e1' }}>{driver.phone}</td>
                <td style={{ padding: '14px 16px', color: '#38bdf8' }}>{driver.truck}</td>
                <td style={{ padding: '14px 16px', color: '#cbd5e1' }}>{driver.license}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', background: '#065f46', color: '#fff' }}>
                    {driver.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};