import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

interface DriverPortalProps {
  organizationId: string;
}

export const DriverPortal: React.FC<DriverPortalProps> = ({ organizationId }) => {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [driverLoads, setDriverLoads] = useState<any[]>([]);
  const [activeLoad, setActiveLoad] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Exception modal state
  const [showExceptionModal, setShowExceptionModal] = useState<boolean>(false);
  const [exceptionType, setExceptionType] = useState<string>('Delay');
  const [exceptionNotes, setExceptionNotes] = useState<string>('');

  // POD / Document upload state
  const [podFile, setPodFile] = useState<File | null>(null);
  const [uploadingPod, setUploadingPod] = useState<boolean>(false);

  const fetchDrivers = async () => {
    const { data } = await supabase.from('drivers').select('*').eq('organization_id', organizationId);
    setDrivers(data || [] );
    if (data && data.length > 0 && !selectedDriverId) {
      setSelectedDriverId(data[0].id);
    }
  };

  const fetchDriverLoads = async (driverId: string) => {
    if (!driverId) return;
    setLoading(true);
    const { data } = await supabase
      .from('loads')
      .select('*, load_stops(*), truck:trucks(unit_number), trailer:trailers(unit_number)')
      .eq('driver_id', driverId)
      .order('created_at', { ascending: false });

    setDriverLoads(data || []);
    // Default active load to the first non-delivered load, or just the first load
    const active = (data || []).find(l => !['Delivered', 'Paid', 'Cancelled'].includes(l.status)) || data?.[0] || null;
    setActiveLoad(active);
    setLoading(false);
  };

  useEffect(() => {
    if (organizationId) fetchDrivers();
  }, [organizationId]);

  useEffect(() => {
    if (selectedDriverId) {
      fetchDriverLoads(selectedDriverId);
    }
  }, [selectedDriverId]);

  const handleUpdateLoadStatus = async (newStatus: string, eventDescription: string) => {
    if (!activeLoad) return;

    try {
      const { error } = await supabase
        .from('loads')
        .update({ status: newStatus })
        .eq('id', activeLoad.id);

      if (error) throw error;

      // Log operational event
      await supabase.from('load_activity').insert([
        {
          load_id: activeLoad.id,
          event_type: `Driver Update: ${newStatus}`,
          description: eventDescription
        }
      ]);

      fetchDriverLoads(selectedDriverId);
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleReportException = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLoad) return;

    try {
      await supabase.from('load_activity').insert([
        {
          load_id: activeLoad.id,
          event_type: `Exception Reported: ${exceptionType}`,
          description: exceptionNotes || `Driver reported a ${exceptionType.toLowerCase()} exception.`
        }
      ]);

      // Optionally set load status to Delayed if it's a delay/breakdown
      if (['Delay', 'Breakdown', 'Damage'].includes(exceptionType)) {
        await supabase.from('loads').update({ status: 'Delayed' }).eq('id', activeLoad.id);
      }

      setShowExceptionModal(false);
      setExceptionNotes('');
      fetchDriverLoads(selectedDriverId);
      alert('Exception successfully reported to dispatch.');
    } catch (err: any) {
      alert(err.message || 'Failed to submit exception');
    }
  };

  const handleUploadPOD = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLoad || !podFile) return;

    setUploadingPod(true);
    try {
      // Simulate file upload or store record in load documents / activity
      await supabase.from('load_activity').insert([
        {
          load_id: activeLoad.id,
          event_type: 'POD Uploaded',
          description: `Driver uploaded document: ${podFile.name}`
        }
      ]);

      await supabase
        .from('loads')
        .update({ status: 'POD Received' })
        .eq('id', activeLoad.id);

      setPodFile(null);
      setUploadingPod(false);
      fetchDriverLoads(selectedDriverId);
      alert('POD successfully uploaded and load status updated to POD Received!');
    } catch (err: any) {
      setUploadingPod(false);
      alert(err.message || 'Failed to upload POD');
    }
  };

  const currentDriver = drivers.find(d => d.id === selectedDriverId);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Driver Simulation / Switcher Bar */}
      <div className="bg-slate-900 text-white p-4 rounded-lg shadow-lg flex justify-between items-center">
        <div>
          <span className="text-xs uppercase tracking-wider text-indigo-400 font-bold">Driver Mobile Portal Simulation</span>
          <h2 className="text-lg font-bold">Viewing as: {currentDriver ? `${currentDriver.first_name} ${currentDriver.last_name}` : 'Select Driver'}</h2>
        </div>
        <div>
          <select
            value={selectedDriverId}
            onChange={(e) => setSelectedDriverId(e.target.value)}
            className="bg-slate-800 text-white border border-slate-700 p-2 rounded text-sm"
          >
            {drivers.map(d => (
              <option key={d.id} value={d.id}>{d.first_name} {d.last_name} (#{d.driver_number})</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading driver workspace...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Load Queue for Driver */}
          <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
            <h3 className="font-bold text-gray-800 text-sm border-b pb-2">Assigned Shipments ({driverLoads.length})</h3>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {driverLoads.map(load => (
                <div
                  key={load.id}
                  onClick={() => setActiveLoad(load)}
                  className={`p-3 rounded-lg border cursor-pointer transition ${
                    activeLoad?.id === load.id ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-xs text-indigo-600">#{load.load_number}</span>
                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded font-semibold text-gray-700">{load.status}</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-900 mt-1">{load.customer}</p>
                </div>
              ))}
              {driverLoads.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-6">No loads currently assigned to this driver.</p>
              )}
            </div>
          </div>

          {/* Right: Active Load Workflow & Actions */}
          <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6 space-y-6">
            {activeLoad ? (
              <>
                <div className="flex justify-between items-start border-b pb-4">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 uppercase">Current Assignment</span>
                    <h3 className="text-xl font-bold text-gray-900">Load #{activeLoad.load_number}</h3>
                    <p className="text-sm text-gray-600">Customer: {activeLoad.customer}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded">
                    {activeLoad.status}
                  </span>
                </div>

                {/* Stops Timeline */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-700 uppercase">Route Stops</h4>
                  <div className="space-y-2">
                    {activeLoad.load_stops?.map((stop: any, idx: number) => (
                      <div key={stop.id || idx} className="p-3 bg-gray-50 rounded border text-xs space-y-1">
                        <div className="flex justify-between font-bold text-gray-900">
                          <span>Stop #{stop.stop_sequence}: {stop.stop_type}</span>
                          <span className="text-indigo-600">{stop.appointment_date || 'TBD'}</span>
                        </div>
                        <p className="text-gray-600">{stop.location_name} — {stop.city}, {stop.state}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Driver Workflow Action Buttons */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-gray-700 uppercase">Milestone Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleUpdateLoadStatus('At Pickup', 'Driver arrived at pickup location.')}
                      className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-bold transition"
                    >
                      📍 Arrived at Pickup
                    </button>
                    <button
                      onClick={() => handleUpdateLoadStatus('Picked Up', 'Freight loaded and secured.')}
                      className="p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded text-xs font-bold transition"
                    >
                      📦 Marked Loaded
                    </button>
                    <button
                      onClick={() => handleUpdateLoadStatus('In Transit', 'Departed origin, in transit to delivery.')}
                      className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded text-xs font-bold transition"
                    >
                      🚚 Departed / In Transit
                    </button>
                    <button
                      onClick={() => handleUpdateLoadStatus('At Delivery', 'Driver arrived at delivery destination.')}
                      className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-bold transition"
                    >
                      📍 Arrived at Delivery
                    </button>
                    <button
                      onClick={() => handleUpdateLoadStatus('Delivered', 'Freight successfully delivered.')}
                      className="col-span-2 p-3 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-bold transition shadow"
                    >
                      ✅ Mark Delivered
                    </button>
                  </div>
                </div>

                {/* POD & Exception Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  {/* POD Upload */}
                  <div className="p-4 bg-gray-50 rounded border space-y-3">
                    <h5 className="text-xs font-bold text-gray-800 uppercase">Upload POD / Documents</h5>
                    <form onSubmit={handleUploadPOD} className="space-y-2">
                      <input
                        type="file"
                        onChange={(e) => setPodFile(e.target.files?.[0] || null)}
                        className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                      <button
                        type="submit"
                        disabled={!podFile || uploadingPod}
                        className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded text-xs font-medium shadow"
                      >
                        {uploadingPod ? 'Uploading...' : 'Submit POD'}
                      </button>
                    </form>
                  </div>

                  {/* Exception Reporting */}
                  <div className="p-4 bg-gray-50 rounded border space-y-3">
                    <h5 className="text-xs font-bold text-gray-800 uppercase">Report Exception</h5>
                    <p className="text-xs text-gray-500">Report delays, breakdowns, or damaged freight directly to dispatch.</p>
                    <button
                      onClick={() => setShowExceptionModal(true)}
                      className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-medium shadow"
                    >
                      ⚠️ Report Issue / Delay
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-24 text-center text-sm text-gray-500">
                Select an assigned shipment from the queue to view details and execute workflow.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Exception Modal */}
      {showExceptionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900">Report Operational Exception</h3>
            <form onSubmit={handleReportException} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Exception Type</label>
                <select
                  value={exceptionType}
                  onChange={(e) => setExceptionType(e.target.value)}
                  className="w-full border p-2 rounded text-sm bg-white"
                >
                  <option value="Delay">Traffic / Schedule Delay</option>
                  <option value="Breakdown">Truck / Equipment Breakdown</option>
                  <option value="Damage">Freight Damage</option>
                  <option value="Detention">Shipper / Receiver Detention</option>
                  <option value="Missing Freight">Missing / Short Freight</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Details / Notes</label>
                <textarea
                  value={exceptionNotes}
                  onChange={(e) => setExceptionNotes(e.target.value)}
                  rows={3}
                  placeholder="Describe the issue..."
                  className="w-full border p-2 rounded text-sm"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowExceptionModal(false)}
                  className="px-4 py-2 border rounded text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded text-sm font-medium shadow"
                >
                  Send to Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};