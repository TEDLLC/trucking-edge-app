import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

export default function EldManager() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [driverName, setDriverName] = useState('');
  const [status, setStatus] = useState('Driving');
  const [hoursLeft, setHoursLeft] = useState('11.0');
  const [location, setLocation] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('eld_logs').select('*');
      if (error) {
        console.error('Supabase error fetching ELD logs:', error.message);
      } else if (data) {
        setLogs(data);
      }
    } catch (error) {
      console.error('Network or unexpected error fetching ELD logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName || !location) {
      alert('Please fill out driver name and location.');
      return;
    }

    try {
      const { data, error } = await supabase.from('eld_logs').insert([
        {
          driver_name: driverName,
          status,
          hours_left: parseFloat(hoursLeft),
          location,
        },
      ]).select();

      if (error) throw error;

      if (data) {
        setLogs([data[0], ...logs]);
        setDriverName('');
        setLocation('');
        alert('HOS Log updated successfully!');
      }
    } catch (error: any) {
      console.error('Error adding ELD log:', error);
      alert(`Failed to save HOS log: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="p-8 text-slate-100 max-w-5xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">ELD & Hours of Service (HOS)</h2>

      <form onSubmit={handleAddLog} className="bg-slate-900 p-6 rounded-xl border border-slate-800 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Driver Name</label>
          <input type="text" value={driverName} onChange={(e) => setDriverName(e.target.value)} placeholder="John Doe" className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white" />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Duty Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white">
            <option value="Driving">Driving</option>
            <option value="On-Duty">On-Duty (Not Driving)</option>
            <option value="Off-Duty">Off-Duty</option>
            <option value="Sleeper Berth">Sleeper Berth</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Hours Left</label>
          <input type="number" step="0.1" value={hoursLeft} onChange={(e) => setHoursLeft(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white" />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Current Location</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="St. Louis, MO" className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white" />
        </div>
        <div className="sm:col-span-2 lg:col-span-4">
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-4 rounded text-sm transition-all cursor-pointer">
            Update Compliance Log
          </button>
        </div>
      </form>

      {loading ? (
        <p className="text-slate-400">Loading HOS compliance logs...</p>
      ) : logs.length === 0 ? (
        <p className="text-slate-400">No ELD records found yet. Add one above!</p>
      ) : (
        <div className="space-y-3">
          {logs.map((log, index) => (
            <div key={log.id || index} className="bg-slate-900/60 border border-slate-800 p-4 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-semibold text-white">{log.driver_name} <span className="text-xs text-indigo-400 ml-2">Status: {log.status}</span></p>
                <p className="text-xs text-slate-400">Location: {log.location}</p>
              </div>
              <div className="text-amber-400 font-semibold text-sm">
                {log.hours_left} hrs remaining
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}