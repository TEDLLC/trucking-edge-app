import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export default function AnalyticsDashboard() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [activeLoadsCount, setActiveLoadsCount] = useState(0);
  const [totalDrivers, setTotalDrivers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      const { data: loadsData } = await supabase.from('loads').select('rate');
      if (loadsData) {
        const revenue = loadsData.reduce((acc: number, load: any) => acc + (Number(load.rate) || 0), 0);
        setTotalRevenue(revenue);
        setActiveLoadsCount(loadsData.length);
      }

      const { count: driversCount } = await supabase.from('drivers').select('*', { count: 'exact', head: true });
      if (driversCount !== null) {
        setTotalDrivers(driversCount);
      }

      setLoading(false);
    }

    fetchAnalytics();
  }, []);

  if (loading) return <div className="p-8 text-slate-400">Loading enterprise metrics...</div>;

  return (
    <div className="p-8 text-slate-100 max-w-5xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">Enterprise Fleet Analytics</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Pipeline Revenue</p>
          <p className="text-3xl font-bold text-emerald-400">${totalRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Active Loads</p>
          <p className="text-3xl font-bold text-indigo-400">{activeLoadsCount}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Registered Drivers</p>
          <p className="text-3xl font-bold text-sky-400">{totalDrivers}</p>
        </div>
      </div>
    </div>
  );
}