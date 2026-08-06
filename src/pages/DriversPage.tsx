import React, { useEffect, useState } from 'react';
import { getDrivers, createDriver } from '../services/api';
import type { Driver } from '../services/api';

export function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Form state for creating a new driver
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  // Fetch drivers on component mount
  useEffect(() => {
    async function loadDrivers() {
      setLoading(true);
      const data = await getDrivers();
      setDrivers(data);
      setLoading(false);
    }
    loadDrivers();
  }, []);

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    const newDriver = await createDriver({
      firstName,
      lastName,
      email,
      phone,
      licenseNumber,
      status: 'AVAILABLE',
    });

    if (newDriver) {
      setDrivers([...drivers, newDriver]);
      // Reset form fields
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setLicenseNumber('');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-white">Drivers Management</h1>

      {/* Driver Creation Form */}
      <form onSubmit={handleCreateDriver} className="bg-slate-800 border border-slate-700 p-6 shadow-xl rounded-xl mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          className="bg-slate-900 border border-slate-700 text-white placeholder-slate-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          className="bg-slate-900 border border-slate-700 text-white placeholder-slate-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-slate-900 border border-slate-700 text-white placeholder-slate-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="bg-slate-900 border border-slate-700 text-white placeholder-slate-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="License Number"
          value={licenseNumber}
          onChange={(e) => setLicenseNumber(e.target.value)}
          required
          className="bg-slate-900 border border-slate-700 text-white placeholder-slate-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="bg-blue-600 text-white font-medium p-3 rounded-lg hover:bg-blue-500 transition shadow-lg shadow-blue-600/30">
          Add Driver to Database
        </button>
      </form>

      {/* Driver List Display */}
      <div className="bg-slate-800 border border-slate-700 shadow-xl rounded-xl overflow-hidden text-white">
        <h2 className="text-lg font-semibold p-4 bg-slate-900/50 border-b border-slate-700">Active Fleet Roster</h2>
        {loading ? (
          <p className="p-4 text-slate-400">Loading secure database records...</p>
        ) : drivers.length === 0 ? (
          <p className="p-4 text-slate-400">No drivers found in database. Add your first driver above!</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/40 border-b border-slate-700 text-slate-300 text-sm uppercase tracking-wider">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">License</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700 text-slate-200">
              {drivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-slate-700/50 transition">
                  <td className="p-4 font-medium">{driver.firstName} {driver.lastName}</td>
                  <td className="p-4 text-slate-300">{driver.email}</td>
                  <td className="p-4 text-slate-300">{driver.phone}</td>
                  <td className="p-4 text-slate-300">{driver.licenseNumber}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {driver.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}