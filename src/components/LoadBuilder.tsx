import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

interface LoadBuilderProps {
  organizationId: string;
}

export const LoadBuilder: React.FC<LoadBuilderProps> = ({ organizationId }) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Load Form State
  const [customerId, setCustomerId] = useState('');
  const [rate, setRate] = useState('');
  const [commodity, setCommodity] = useState('');
  const [weight, setWeight] = useState('');
  const [totalDistance, setTotalDistance] = useState('');

  // Stops State (Minimum 1 Pickup and 1 Delivery)
  const [stops, setStops] = useState([
    { stop_sequence: 1, stop_type: 'Pickup', facility_name: '', address: '' },
    { stop_sequence: 2, stop_type: 'Delivery', facility_name: '', address: '' },
  ]);

  useEffect(() => {
    async function fetchCustomers() {
      const { data } = await supabase.from('customers').select('*').eq('organization_id', organizationId);
      setCustomers(data || []);
    }
    if (organizationId) fetchCustomers();
  }, [organizationId]);

  const handleAddStop = () => {
    setStops([...stops, { stop_sequence: stops.length + 1, stop_type: 'Delivery', facility_name: '', address: '' }]);
  };

  const handleStopChange = (index: number, field: string, value: string) => {
    const updatedStops = [...stops];
    updatedStops[index] = { ...updatedStops[index], [field]: value };
    setStops(updatedStops);
  };

  const handleCreateLoad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      alert('Please select a customer.');
      return;
    }

    try {
      setLoading(true);

      // 1. Insert Load Record
      const { data: loadData, error: loadError } = await supabase
        .from('loads')
        .insert([
          {
            organization_id: organizationId,
            customer_id: customerId,
            rate: parseFloat(rate || '0'),
            commodity,
            weight: parseFloat(weight || '0'),
            total_distance: parseFloat(totalDistance || '0'),
            status: 'Pending',
          },
        ])
        .select()
        .single();

      if (loadError) throw loadError;

      // 2. Insert Stops Records
      const stopsPayload = stops.map((s, idx) => ({
        load_id: loadData.id,
        stop_sequence: idx + 1,
        stop_type: s.stop_type,
        facility_name: s.facility_name,
        address: s.address,
        status: 'Pending',
      }));

      const { error: stopsError } = await supabase.from('load_stops').insert(stopsPayload);
      if (stopsError) throw stopsError;

      alert('Load and stop sequence successfully created!');
      setRate('');
      setCommodity('');
      setWeight('');
      setTotalDistance('');
      setStops([
        { stop_sequence: 1, stop_type: 'Pickup', facility_name: '', address: '' },
        { stop_sequence: 2, stop_type: 'Delivery', facility_name: '', address: '' },
      ]);
    } catch (err: any) {
      alert(err.message || 'Failed to create load');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Multi-Stop Load Builder</h2>

      <form onSubmit={handleCreateLoad} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer / Shipper</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
              className="w-full border rounded p-2 text-sm"
            >
              <option value="">-- Select Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.company_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rate ($)</label>
            <input
              type="number"
              step="0.01"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="0.00"
              required
              className="w-full border rounded p-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Commodity</label>
            <input
              type="text"
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              placeholder="e.g. Dry Goods, Pallets"
              className="w-full border rounded p-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (lbs)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="0"
              className="w-full border rounded p-2 text-sm"
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-700">Stop Sequences</h3>
            <button
              type="button"
              onClick={handleAddStop}
              className="px-3 py-1 bg-gray-100 text-indigo-600 rounded text-sm font-medium hover:bg-gray-200"
            >
              + Add Stop
            </button>
          </div>

          <div className="space-y-3">
            {stops.map((stop, index) => (
              <div key={index} className="flex gap-3 items-center bg-gray-50 p-3 rounded border">
                <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                  #{index + 1}
                </span>
                <select
                  value={stop.stop_type}
                  onChange={(e) => handleStopChange(index, 'stop_type', e.target.value)}
                  className="border rounded p-1.5 text-sm w-32"
                >
                  <option value="Pickup">Pickup</option>
                  <option value="Delivery">Delivery</option>
                  <option value="Stop">Stop</option>
                </select>
                <input
                  type="text"
                  placeholder="Facility Name"
                  value={stop.facility_name}
                  onChange={(e) => handleStopChange(index, 'facility_name', e.target.value)}
                  className="border rounded p-1.5 text-sm flex-1"
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={stop.address}
                  onChange={(e) => handleStopChange(index, 'address', e.target.value)}
                  className="border rounded p-1.5 text-sm flex-1"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700"
        >
          {loading ? 'Creating Load...' : 'Create Load & Stops'}
        </button>
      </form>
    </div>
  );
};