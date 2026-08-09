import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useRegionStore } from '../services/useRegion';
import { EuDddExport } from './EuDddExport';

export default function DriversManager() {
  const { region } = useRegionStore();
  const [currentRegion, setCurrentRegion] = useState<string>(() => {
    return localStorage.getItem('regionMode') || region || 'US (FMCSA)';
  });

  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states matching your drivers table
  const [driverName, setDriverName] = useState('');
  const [phone, setPhone] = useState('');
  const [cdlNumber, setCdlNumber] = useState('');
  const [cdlState, setCdlState] = useState('');
  const [truckNumber, setTruckNumber] = useState('');

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

  useEffect(() => {
    async function fetchDrivers() {
      const { data, error } = await supabase.from('drivers').select('*');
      if (error) {
        console.error('Error fetching drivers:', error);
      } else {
        setDrivers(data || []);
      }
      setLoading(false);
    }

    fetchDrivers();
  }, []);

  const isEU = currentRegion.includes('EU') || region === 'EU' || region?.includes('EU');

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName || !truckNumber) {
      alert('Please fill out driver name and truck number.');
      return;
    }

    const { data, error } = await supabase.from('drivers').insert([
      { 
        driver_name: driverName, 
        phone, 
        cdl_number: cdlNumber, 
        cdl_state: cdlState, 
        truck_number: truckNumber 
      }
    ]).select();

    if (error) {
      console.error('Error adding driver:', error);
      alert('Failed to add driver.');
    } else if (data) {
      setDrivers([...drivers, data[0]]);
      setDriverName('');
      setPhone('');
      setCdlNumber('');
      setCdlState('');
      setTruckNumber('');
      alert('Driver added successfully!');
    }
  };

  return (
    <div className="p-8 text-slate-100 max-w-5xl mx-auto flex flex-col gap-6">
      <h2 className="text-xl font-semibold">Fleet Drivers Manager</h2>

      {/* Render Tachograph .DDD Export Vault when in EU Mode */}
      {isEU && <EuDddExport />}

      {/* Add Driver Form */}
      <form onSubmit={handleAddDriver} className="bg-slate-900 p-6 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Driver Name</label>
          <input type="text" value={driverName} onChange={(e) => setDriverName(e.target.value)} placeholder="Jane Doe" className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white" />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Phone Number</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="555-0199" className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white" />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Truck Number</label>
          <input type="text" value={truckNumber} onChange={(e) => setTruckNumber(e.target.value)} placeholder="Truck 402" className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white" />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">{isEU ? 'Driver Card / License' : 'CDL Number'}</label>
          <input type="text" value={cdlNumber} onChange={(e) => setCdlNumber(e.target.value)} placeholder={isEU ? 'D100984729' : 'A1234567'} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white" />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">{isEU ? 'Country Code' : 'CDL State'}</label>
          <input type="text" value={cdlState} onChange={(e) => setCdlState(e.target.value)} placeholder={isEU ? 'DE' : 'IL'} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white" />
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-4 rounded text-sm transition-all cursor-pointer">
            Add Driver to Fleet
          </button>
        </div>
      </form>

      {/* Drivers List */}
      {loading ? (
        <p>Loading drivers...</p>
      ) : drivers.length === 0 ? (
        <p className="text-slate-400">No drivers found. Add one above!</p>
      ) : (
        <div className="space-y-3">
          {drivers.map((driver, index) => (
            <div key={driver.id || index} className="bg-slate-900/60 border border-slate-800 p-4 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-semibold text-white">{driver.driver_name} <span className="text-xs text-indigo-400 ml-2">Truck: {driver.truck_number}</span></p>
                <p className="text-xs text-slate-400">Phone: {driver.phone || 'N/A'} | {isEU ? 'Card No' : 'CDL'}: {driver.cdl_number || 'N/A'} ({driver.cdl_state || 'N/A'})</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}