import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

interface DispatchBoardProps {
  organizationId: string;
}

const VIEW_TABS = ['Unassigned', 'Assigned', 'Dispatched', 'In Transit', 'Delayed', 'Delivered'];

export const DispatchBoard: React.FC<DispatchBoardProps> = ({ organizationId }) => {
  const [loads, setLoads] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [trucks, setTrucks] = useState<any[]>([]);
  const [trailers, setTrailers] = useState<any[]>([]);
  const [driverDocs, setDriverDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Active view tab
  const [activeTab, setActiveTab] = useState<string>('Unassigned');

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCustomer, setFilterCustomer] = useState<string>('All');

  // Assignment Modal
  const [dispatchingLoad, setDispatchingLoad] = useState<any | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [selectedTruck, setSelectedTruck] = useState<string>('');
  const [selectedTrailer, setSelectedTrailer] = useState<string>('');
  const [conflictWarnings, setConflictWarnings] = useState<string[]>([]);

  const fetchData = async () => {
    setLoading(true);
    const [loadsRes, driversRes, trucksRes, trailersRes, docsRes] = await Promise.all([
      supabase.from('loads').select('*, load_stops(*), driver:drivers(first_name, last_name, status), truck:trucks(unit_number, status), trailer:trailers(unit_number, status)').eq('organization_id', organizationId),
      supabase.from('drivers').select('*').eq('organization_id', organizationId),
      supabase.from('trucks').select('*').eq('organization_id', organizationId),
      supabase.from('trailers').select('*').eq('organization_id', organizationId),
      supabase.from('driver_documents').select('*')
    ]);

    setLoads(loadsRes.data || []);
    setDrivers(driversRes.data || []);
    setTrucks(trucksRes.data || []);
    setTrailers(trailersRes.data || []);
    setDriverDocs(docsRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (organizationId) fetchData();
  }, [organizationId]);

  // Run Conflict Detection when selection changes
  useEffect(() => {
    if (!selectedDriver && !selectedTruck) {
      setConflictWarnings([]);
      return;
    }

    const warnings: string[] = [];
    const today = new Date();

    // Check Driver
    if (selectedDriver) {
      const driverObj = drivers.find(d => d.id === selectedDriver);
      if (driverObj && driverObj.status === 'Inactive') {
        warnings.push(`Warning: Selected driver (${driverObj.first_name} ${driverObj.last_name}) is marked Inactive.`);
      }

      // Check active load conflicts
      const activeLoadWithDriver = loads.find(l => l.driver_id === selectedDriver && l.status !== 'Delivered' && l.status !== 'Cancelled' && (!dispatchingLoad || l.id !== dispatchingLoad.id));
      if (activeLoadWithDriver) {
        warnings.push(`Conflict: Driver is already assigned to active Load #${activeLoadWithDriver.load_number}.`);
      }

      // Check expired documents
      const docs = driverDocs.filter(d => d.driver_id === selectedDriver);
      const expiredDocs = docs.filter(d => d.expiration_date && new Date(d.expiration_date) < today);
      if (expiredDocs.length > 0) {
        warnings.push(`Compliance Alert: Driver has ${expiredDocs.length} expired qualification document(s)!`);
      }
    }

    // Check Truck
    if (selectedTruck) {
      const activeLoadWithTruck = loads.find(l => l.truck_id === selectedTruck && l.status !== 'Delivered' && l.status !== 'Cancelled' && (!dispatchingLoad || l.id !== dispatchingLoad.id));
      if (activeLoadWithTruck) {
        warnings.push(`Conflict: Truck is already assigned to active Load #${activeLoadWithTruck.load_number}.`);
      }
    }

    setConflictWarnings(warnings);
  }, [selectedDriver, selectedTruck, loads, drivers, driverDocs, dispatchingLoad]);

  const handleAssignEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchingLoad) return;

    try {
      const isReassignment = dispatchingLoad.driver_id || dispatchingLoad.truck_id;
      const newStatus = 'Assigned';

      const { error: loadError } = await supabase
        .from('loads')
        .update({
          driver_id: selectedDriver || null,
          truck_id: selectedTruck || null,
          trailer_id: selectedTrailer || null,
          status: newStatus
        })
        .eq('id', dispatchingLoad.id);

      if (loadError) throw loadError;

      // Log activity audit
      await supabase.from('load_activity').insert([
        { 
          load_id: dispatchingLoad.id, 
          event_type: isReassignment ? 'Load Reassigned' : 'Load Assigned', 
          description: `Resources updated by dispatcher. Status set to ${newStatus}` 
        }
      ]);

      setDispatchingLoad(null);
      setSelectedDriver('');
      setSelectedTruck('');
      setSelectedTrailer('');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to assign load');
    }
  };

  const handleQuickStatusChange = async (loadId: string, nextStatus: string) => {
    const { error } = await supabase.from('loads').update({ status: nextStatus }).eq('id', loadId);
    if (!error) {
      await supabase.from('load_activity').insert([
        { load_id: loadId, event_type: 'Status Changed', description: `Status changed to ${nextStatus} from dispatch board` }
      ]);
      fetchData();
    }
  };

  // Filter loads by active view tab
  const filteredLoads = loads.filter((l) => {
    if (activeTab === 'Unassigned') return !l.driver_id || l.status === 'Quote' || l.status === 'Booked';
    if (activeTab === 'Assigned') return l.status === 'Assigned' || l.status === 'Planning';
    if (activeTab === 'Dispatched') return l.status === 'Dispatched' || l.status === 'At Pickup';
    if (activeTab === 'In Transit') return l.status === 'In Transit' || l.status === 'Picked Up' || l.status === 'At Delivery';
    if (activeTab === 'Delayed') return l.status === 'Delayed';
    if (activeTab === 'Delivered') return l.status === 'Delivered' || l.status === 'POD Received' || l.status === 'Ready to Invoice' || l.status === 'Invoiced' || l.status === 'Paid';
    return true;
  }).filter((l) => {
    const matchesSearch = l.load_number.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          l.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCustomer = filterCustomer === 'All' || l.customer === filterCustomer;
    return matchesSearch && matchesCustomer;
  });

  const customers = Array.from(new Set(loads.map(l => l.customer)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Dispatch Command Center</h2>
          <p className="text-sm text-gray-500">Real-time resource allocation, conflict detection, and load execution</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="px-3 py-1.5 border rounded text-xs font-semibold hover:bg-gray-50">
            🔄 Refresh Board
          </button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex bg-white rounded-lg shadow-sm border p-1 space-x-1">
        {VIEW_TABS.map((tab) => {
          const count = loads.filter(l => {
            if (tab === 'Unassigned') return !l.driver_id || l.status === 'Quote' || l.status === 'Booked';
            if (tab === 'Assigned') return l.status === 'Assigned' || l.status === 'Planning';
            if (tab === 'Dispatched') return l.status === 'Dispatched' || l.status === 'At Pickup';
            if (tab === 'In Transit') return l.status === 'In Transit' || l.status === 'Picked Up' || l.status === 'At Delivery';
            if (tab === 'Delayed') return l.status === 'Delayed';
            if (tab === 'Delivered') return ['Delivered', 'POD Received', 'Ready to Invoice', 'Invoiced', 'Paid'].includes(l.status);
            return false;
          }).length;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded transition ${
                activeTab === tab ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow-md flex gap-4 items-center">
        <input
          type="text"
          placeholder="Search load # or customer..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border p-2 rounded text-sm w-72"
        />
        <select
          value={filterCustomer}
          onChange={(e) => setFilterCustomer(e.target.value)}
          className="border p-2 rounded text-sm bg-white"
        >
          <option value="All">All Customers</option>
          {customers.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Load Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLoads.map((load) => {
          const revenue = (load.linehaul_rate || 0) + (load.fuel_surcharge || 0);
          const pickupStop = load.load_stops?.find((s: any) => s.stop_type === 'Pickup') || load.load_stops?.[0];
          const deliveryStop = load.load_stops?.reverse().find((s: any) => s.stop_type === 'Delivery') || load.load_stops?.[load.load_stops?.length - 1];

          return (
            <div key={load.id} className="bg-white rounded-lg shadow-md border p-5 space-y-4 hover:shadow-lg transition">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono font-bold text-indigo-600 text-base">#{load.load_number}</span>
                  <h4 className="font-bold text-gray-900 text-sm mt-0.5">{load.customer}</h4>
                </div>
                <span className="px-2.5 py-1 text-xs font-bold rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {load.status}
                </span>
              </div>

              {/* Route snippet */}
              <div className="bg-gray-50 p-3 rounded text-xs space-y-1">
                <p><strong>Pickup:</strong> {pickupStop?.location_name || 'TBD'} ({pickupStop?.appointment_date || 'No Date'})</p>
                <p><strong>Delivery:</strong> {deliveryStop?.location_name || 'TBD'} ({deliveryStop?.appointment_date || 'No Date'})</p>
              </div>

              {/* Resource Assignment Status */}
              <div className="grid grid-cols-3 gap-2 text-xs border-t pt-3 text-gray-700">
                <div><strong>Driver:</strong> <br />{load.driver ? `${load.driver.first_name} ${load.driver.last_name}` : <span className="text-amber-600">Unassigned</span>}</div>
                <div><strong>Truck:</strong> <br />{load.truck ? `#${load.truck.unit_number}` : <span className="text-amber-600">Unassigned</span>}</div>
                <div><strong>Trailer:</strong> <br />{load.trailer ? `#${load.trailer.unit_number}` : 'None'}</div>
              </div>

              {/* Revenue & Action Footer */}
              <div className="flex justify-between items-center pt-3 border-t">
                <span className="font-bold text-sm text-gray-900">${revenue.toFixed(2)}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setDispatchingLoad(load);
                      setSelectedDriver(load.driver_id || '');
                      setSelectedTruck(load.truck_id || '');
                      setSelectedTrailer(load.trailer_id || '');
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium shadow"
                  >
                    {load.driver_id ? 'Reassign' : 'Assign'}
                  </button>
                  {load.status === 'Assigned' && (
                    <button
                      onClick={() => handleQuickStatusChange(load.id, 'Dispatched')}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium"
                    >
                      Dispatch
                    </button>
                  )}
                  {load.status === 'Dispatched' && (
                    <button
                      onClick={() => handleQuickStatusChange(load.id, 'In Transit')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium"
                    >
                      In Transit
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filteredLoads.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-sm text-gray-500 bg-white rounded-lg border">
            No loads found in this view category.
          </div>
        )}
      </div>

      {/* Assignment & Conflict Detection Modal */}
      {dispatchingLoad && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900">Manage Assignment for Load #{dispatchingLoad.load_number}</h3>

            {/* Conflict Warnings Box */}
            {conflictWarnings.length > 0 && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded space-y-1">
                <p className="text-xs font-bold text-red-800 uppercase">Conflict & Compliance Warnings:</p>
                {conflictWarnings.map((warn, i) => (
                  <p key={i} className="text-xs text-red-700 font-medium">• {warn}</p>
                ))}
              </div>
            )}

            <form onSubmit={handleAssignEquipment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Assigned Driver</label>
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="w-full border p-2 rounded text-sm bg-white"
                >
                  <option value="">-- Choose Driver --</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>{d.first_name} {d.last_name} (#{d.driver_number}) - {d.status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Assigned Truck Unit</label>
                <select
                  value={selectedTruck}
                  onChange={(e) => setSelectedTruck(e.target.value)}
                  className="w-full border p-2 rounded text-sm bg-white"
                >
                  <option value="">-- Choose Truck --</option>
                  {trucks.map((t) => (
                    <option key={t.id} value={t.id}>Truck #{t.unit_number} ({t.make || 'General'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Assigned Trailer Unit</label>
                <select
                  value={selectedTrailer}
                  onChange={(e) => setSelectedTrailer(e.target.value)}
                  className="w-full border p-2 rounded text-sm bg-white"
                >
                  <option value="">-- None / Bobtail --</option>
                  {trailers.map((tr) => (
                    <option key={tr.id} value={tr.id}>Trailer #{tr.unit_number} ({tr.type})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setDispatchingLoad(null)}
                  className="px-4 py-2 border rounded text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-medium shadow"
                >
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};