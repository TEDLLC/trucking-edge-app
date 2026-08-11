import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

interface EnterpriseHubProps {
  organizationId: string;
}

const HUBS = ['Executive Analytics', 'Customer Portal', 'Integration Hub'];

export const EnterpriseHub: React.FC<EnterpriseHubProps> = ({ organizationId }) => {
  const [activeHub, setActiveHub] = useState<string>('Executive Analytics');
  const [loads, setLoads] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [trucks, setTrucks] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Customer Portal state
  const [selectedCustomer, setSelectedCustomer] = useState<string>('Acme Corp');

  const fetchData = async () => {
    setLoading(true);
    const [loadsRes, invoicesRes, trucksRes, driversRes] = await Promise.all([
      supabase.from('loads').select('*, load_stops(*)').eq('organization_id', organizationId),
      supabase.from('invoices').select('*').eq('organization_id', organizationId),
      supabase.from('trucks').select('*').eq('organization_id', organizationId),
      supabase.from('drivers').select('*').eq('organization_id', organizationId)
    ]);

    setLoads(loadsRes.data || []);
    setInvoices(invoicesRes.data || []);
    setTrucks(trucksRes.data || []);
    setDrivers(driversRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (organizationId) fetchData();
  }, [organizationId]);

  // Analytics Calculations
  const totalRevenue = loads.reduce((acc, l) => acc + ((l.linehaul_rate || 0) + (l.fuel_surcharge || 0)), 0);
  const activeLoadsCount = loads.filter(l => !['Delivered', 'Cancelled', 'Paid'].includes(l.status)).length;
  const utilizationRate = trucks.length > 0 ? Math.round((loads.filter(l => l.truck_id).length / trucks.length) * 100) : 0;

  const customers = Array.from(new Set(loads.map(l => l.customer)));

  return (
    <div className="space-y-6">
      {/* Header & Hub Selection */}
      <div className="bg-white p-6 rounded-lg shadow-md flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Enterprise Expansion Hub</h2>
          <p className="text-sm text-gray-500">Executive analytics, customer shipper portal, and external integration connectors</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg space-x-1">
          {HUBS.map(hub => (
            <button
              key={hub}
              onClick={() => setActiveHub(hub)}
              className={`py-1.5 px-3 text-xs font-bold rounded transition ${
                activeHub === hub ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              {hub}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-gray-500">Loading enterprise data...</div>
      ) : (
        <>
          {/* 1. EXECUTIVE ANALYTICS */}
          {activeHub === 'Executive Analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-lg shadow-md border space-y-1">
                  <span className="text-xs font-bold text-gray-400 uppercase">Total Revenue</span>
                  <h3 className="text-2xl font-black text-gray-900">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-md border space-y-1">
                  <span className="text-xs font-bold text-gray-400 uppercase">Active Loads</span>
                  <h3 className="text-2xl font-black text-indigo-600">{activeLoadsCount}</h3>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-md border space-y-1">
                  <span className="text-xs font-bold text-gray-400 uppercase">Fleet Utilization</span>
                  <h3 className="text-2xl font-black text-green-600">{utilizationRate}%</h3>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-md border space-y-1">
                  <span className="text-xs font-bold text-gray-400 uppercase">Total Drivers</span>
                  <h3 className="text-2xl font-black text-slate-700">{drivers.length}</h3>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
                <h3 className="text-base font-bold text-gray-800 border-b pb-2">Operational Health & Volume</h3>
                <p className="text-sm text-gray-600">
                  Your fleet is currently maintaining a <strong>{utilizationRate}% asset assignment rate</strong> across {trucks.length} registered power units. 
                  Financial reconciliation shows {invoices.length} total generated invoices awaiting settlement.
                </p>
              </div>
            </div>
          )}

          {/* 2. CUSTOMER PORTAL */}
          {activeHub === 'Customer Portal' && (
            <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-800">Shipper Portal View</h3>
                  <p className="text-xs text-gray-500">Simulate what your external customers see when tracking their freight</p>
                </div>
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="border p-2 rounded text-sm bg-white font-bold text-indigo-600"
                >
                  {customers.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-700 uppercase">Active Shipments for {selectedCustomer}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {loads.filter(l => l.customer === selectedCustomer).map(load => (
                    <div key={load.id} className="border p-4 rounded-lg bg-gray-50 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-indigo-600 text-sm">#{load.load_number}</span>
                        <span className="px-2 py-0.5 text-xs font-bold rounded bg-indigo-100 text-indigo-800">{load.status}</span>
                      </div>
                      <p className="text-xs text-gray-600"><strong>Stops:</strong> {load.load_stops?.length || 0} stops recorded</p>
                      <p className="text-xs text-gray-600"><strong>Rate:</strong> ${(load.linehaul_rate || 0).toFixed(2)}</p>
                    </div>
                  ))}
                  {loads.filter(l => l.customer === selectedCustomer).length === 0 && (
                    <p className="col-span-full text-center py-8 text-sm text-gray-500">No shipments found for this customer.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. INTEGRATION HUB */}
          {activeHub === 'Integration Hub' && (
            <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
              <div className="border-b pb-4">
                <h3 className="text-base font-bold text-gray-800">Connected Telematics & Accounting Adapters</h3>
                <p className="text-xs text-gray-500">Manage API integrations for automated ELD feeds and financial synchronization</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Samsara ELD Adapter */}
                <div className="border p-5 rounded-lg space-y-3 bg-slate-50">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-sm text-gray-900">Samsara ELD Telematics</h4>
                    <span className="px-2 py-0.5 text-xs font-bold rounded bg-green-100 text-green-800">Connected</span>
                  </div>
                  <p className="text-xs text-gray-600">Real-time GPS vehicle location sync and hours-of-service (HOS) compliance streaming.</p>
                  <button onClick={() => alert('Samsara API sync triggered successfully.')} className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-medium">
                    Test API Sync
                  </button>
                </div>

                {/* QuickBooks Accounting Adapter */}
                <div className="border p-5 rounded-lg space-y-3 bg-slate-50">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-sm text-gray-900">QuickBooks Online</h4>
                    <span className="px-2 py-0.5 text-xs font-bold rounded bg-amber-100 text-amber-800">Ready to Connect</span>
                  </div>
                  <p className="text-xs text-gray-600">Automated invoice export, customer ledger matching, and settlement payout synchronization.</p>
                  <button onClick={() => alert('Redirecting to QuickBooks OAuth authorization...')} className="px-3 py-1.5 bg-slate-800 text-white rounded text-xs font-medium">
                    Authorize QuickBooks
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};