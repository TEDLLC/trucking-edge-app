import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

interface DispatchManagementProps {
  organizationId: string;
}

export const DispatchManagement: React.FC<DispatchManagementProps> = ({ organizationId }) => {
  const [loads, setLoads] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [trucks, setTrucks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showLoadModal, setShowLoadModal] = useState<boolean>(false);

  // New Load Form State
  const [loadNumber, setLoadNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [rate, setRate] = useState('');
  const [assignedDriverId, setAssignedDriverId] = useState('');
  const [assignedTruckId, setAssignedTruckId] = useState('');

  const fetchDispatchData = async () => {
    try {
      setLoading(true);
      const [lRes, dRes, tRes] = await Promise.all([
        supabase.from('loads').select('*, driver:drivers(first_name, last_name), truck:trucks(unit_number)').eq('organization_id', organizationId),
        supabase.from('drivers').select('id, first_name, last_name').eq('organization_id', organizationId),
        supabase.from('trucks').select('id, unit_number').eq('organization_id', organizationId),
      ]);

      setLoads(lRes.data || []);
      setDrivers(dRes.data || []);
      setTrucks(tRes.data || []);
    } catch (err) {
      console.error('Error fetching dispatch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) {
      fetchDispatchData();
    }
  }, [organizationId]);

  const handleCreateLoad = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('loads').insert([
        {
          organization_id: organizationId,
          load_number: loadNumber,
          customer_name: customerName,
          origin,
          destination,
          rate: parseFloat(rate) || 0.0,
          driver_id: assignedDriverId || null,
          truck_id: assignedTruckId || null,
          status: assignedDriverId ? 'Dispatched' : 'Booked',
        }
      ]);
      if (error) throw error;
      setShowLoadModal(false);
      setLoadNumber(''); setCustomerName(''); setOrigin(''); setDestination(''); setRate('');
      setAssignedDriverId(''); setAssignedTruckId('');
      await fetchDispatchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create load');
    }
  };

  const updateLoadStatus = async (loadId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('loads')
        .update({ status: newStatus })
        .eq('id', loadId);
      if (error) throw error;
      await fetchDispatchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-md">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Dispatch & Load Board</h2>
          <p className="text-sm text-gray-500">Manage freight orders, dispatch assignments, and live transit statuses</p>
        </div>
        <button
          onClick={() => setShowLoadModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 shadow"
        >
          + Add New Load
        </button>
      </div>

      {/* Loads Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Load #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Origin → Destination</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Driver / Truck</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loads.map((l) => (
              <tr key={l.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-mono font-bold text-indigo-600">{l.load_number}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{l.customer_name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{l.origin} → {l.destination}</td>
                <td className="px-6 py-4 text-sm font-semibold text-green-700">${Number(l.rate).toFixed(2)}</td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {l.driver ? `${l.driver.first_name} ${l.driver.last_name}` : 'Unassigned'}
                  {l.truck?.unit_number ? ` (Unit #${l.truck.unit_number})` : ''}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    l.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                    l.status === 'In Transit' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {l.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-sm space-x-2">
                  {l.status === 'Booked' && (
                    <button onClick={() => updateLoadStatus(l.id, 'Dispatched')} className="text-indigo-600 hover:underline text-xs font-bold">Dispatch</button>
                  )}
                  {l.status === 'Dispatched' && (
                    <button onClick={() => updateLoadStatus(l.id, 'In Transit')} className="text-blue-600 hover:underline text-xs font-bold">Start Transit</button>
                  )}
                  {l.status === 'In Transit' && (
                    <button onClick={() => updateLoadStatus(l.id, 'Delivered')} className="text-green-600 hover:underline text-xs font-bold">Mark Delivered</button>
                  )}
                </td>
              </tr>
            ))}
            {loads.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">No loads found. Click "+ Add New Load" to create one.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Load Modal */}
      {showLoadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Create New Load</h3>
            <form onSubmit={handleCreateLoad} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Load # (e.g. LD-9001)" value={loadNumber} onChange={(e) => setLoadNumber(e.target.value)} required className="border p-2 rounded text-sm" />
                <input type="text" placeholder="Customer / Broker Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required className="border p-2 rounded text-sm" />
                <input type="text" placeholder="Origin (City, ST)" value={origin} onChange={(e) => setOrigin(e.target.value)} required className="border p-2 rounded text-sm" />
                <input type="text" placeholder="Destination (City, ST)" value={destination} onChange={(e) => setDestination(e.target.value)} required className="border p-2 rounded text-sm" />
                <input type="number" placeholder="Rate ($)" value={rate} onChange={(e) => setRate(e.target.value)} required className="border p-2 rounded text-sm" />
                <select value={assignedDriverId} onChange={(e) => setAssignedDriverId(e.target.value)} className="border p-2 rounded text-sm">
                  <option value="">Assign Driver (Optional)</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.first_name} {d.last_name}</option>)}
                </select>
                <select value={assignedTruckId} onChange={(e) => setAssignedTruckId(e.target.value)} className="border p-2 rounded text-sm col-span-2">
                  <option value="">Assign Truck Unit (Optional)</option>
                  {trucks.map(t => <option key={t.id} value={t.id}>Unit #{t.unit_number}</option>)}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-3 border-t">
                <button type="button" onClick={() => setShowLoadModal(false)} className="px-4 py-2 border rounded text-sm">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium">Save Load</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};