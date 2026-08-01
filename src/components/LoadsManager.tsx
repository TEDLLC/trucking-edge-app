import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

export default function LoadsManager() {
  const [loads, setLoads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [rate, setRate] = useState('');
  const [assignedDriver, setAssignedDriver] = useState('');

  useEffect(() => {
    async function fetchLoads() {
      const { data, error } = await supabase.from('loads').select('*');
      if (error) {
        console.error('Error fetching loads:', error);
      } else {
        setLoads(data || []);
      }
      setLoading(false);
    }

    fetchLoads();
  }, []);

  const handleAddLoad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination || !rate) {
      alert('Please fill out origin, destination, and rate.');
      return;
    }

    const { data, error } = await supabase.from('loads').insert([
      { 
        origin, 
        destination, 
        rate: parseFloat(rate), 
        load_status: 'Active', 
        assigned_driver: assignedDriver || 'Unassigned' 
      }
    ]).select();

    if (error) {
      console.error('Error adding load:', error);
      alert('Failed to add load.');
    } else if (data) {
      setLoads([...loads, data[0]]);
      setOrigin('');
      setDestination('');
      setRate('');
      setAssignedDriver('');
      alert('Load added successfully!');
    }
  };

  return (
    <div className="p-8 text-slate-100 max-w-5xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">Active Freight Loads</h2>

      <form onSubmit={handleAddLoad} className="bg-slate-900 p-6 rounded-xl border border-slate-800 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Origin</label>
          <input type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Chicago, IL" className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white" />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Destination</label>
          <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Dallas, TX" className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white" />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Rate ($)</label>
          <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="2500" className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white" />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Driver</label>
          <input type="text" value={assignedDriver} onChange={(e) => setAssignedDriver(e.target.value)} placeholder="John Doe" className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white" />
        </div>
        <div className="sm:col-span-2 lg:col-span-4">
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-4 rounded text-sm transition-all cursor-pointer">
            Add New Load to Database
          </button>
        </div>
      </form>

      {loading ? (
        <p>Loading loads...</p>
      ) : loads.length === 0 ? (
        <p className="text-slate-400">No loads found in database yet. Try adding one above!</p>
      ) : (
        <div className="space-y-3">
          {loads.map((load, index) => (
            <div key={load.id || index} className="bg-slate-900/60 border border-slate-800 p-4 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-semibold text-white">{load.origin} ➔ {load.destination}</p>
                <p className="text-xs text-slate-400">Driver: {load.assigned_driver || 'Unassigned'} | Status: {load.load_status}</p>
              </div>
              <div className="text-emerald-400 font-semibold">
                ${load.rate}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}