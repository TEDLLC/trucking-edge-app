import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

interface ELDComplianceProps {
  organizationId: string;
}

export const ELDCompliance: React.FC<ELDComplianceProps> = ({ organizationId }) => {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [currentStatus, setCurrentStatus] = useState<string>('Off Duty');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // FMCSA HOS Counter Simulation States (Remaining Hours)
  const [breakRemaining, setBreakRemaining] = useState<number>(8.0); // hrs until mandatory 30-min break
  const [driveRemaining, setDriveRemaining] = useState<number>(11.0); // max 11 hrs driving
  const [shiftRemaining, setShiftRemaining] = useState<number>(14.0); // max 14 hr shift window
  const [cycleRemaining, setCycleRemaining] = useState<number>(70.0); // 70hr / 8day cycle

  const fetchDrivers = async () => {
    const { data } = await supabase
      .from('drivers')
      .select('id, first_name, last_name, driver_number')
      .eq('organization_id', organizationId);
    setDrivers(data || []);
    if (data && data.length > 0 && !selectedDriverId) {
      setSelectedDriverId(data[0].id);
    }
  };

  const fetchLogs = async (driverId: string) => {
    if (!driverId) return;
    setLoading(true);
    const { data } = await supabase
      .from('eld_logs')
      .select('*')
      .eq('driver_id', driverId)
      .order('timestamp', { ascending: false })
      .limit(20);
    setLogs(data || []);
    if (data && data.length > 0) {
      setCurrentStatus(data[0].status);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (organizationId) {
      fetchDrivers();
    }
  }, [organizationId]);

  useEffect(() => {
    if (selectedDriverId) {
      fetchLogs(selectedDriverId);
    }
  }, [selectedDriverId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedDriverId) return;
    try {
      const { error } = await supabase.from('eld_logs').insert([
        {
          organization_id: organizationId,
          driver_id: selectedDriverId,
          status: newStatus,
          location: 'Terminal / Hub',
          notes: `Manual status update to ${newStatus}`,
          timestamp: new Date().toISOString(),
        }
      ]);
      if (error) throw error;
      setCurrentStatus(newStatus);
      await fetchLogs(selectedDriverId);
    } catch (err: any) {
      alert(err.message || 'Failed to update ELD status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-md">
        <div>
          <h2 className="text-xl font-bold text-gray-900">ELD & Hours of Service (HOS) Compliance</h2>
          <p className="text-sm text-gray-500">FMCSA compliant electronic logging and real-time duty status management</p>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Select Driver:</label>
          <select
            value={selectedDriverId}
            onChange={(e) => setSelectedDriverId(e.target.value)}
            className="border p-2 rounded text-sm w-64 bg-white"
          >
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.first_name} {d.last_name} (#{d.driver_number})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* HOS Clock Dials */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg shadow-md border-t-4 border-blue-500">
          <p className="text-xs font-semibold text-gray-500 uppercase">Break Time</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{breakRemaining.toFixed(1)} <span className="text-sm font-normal text-gray-500">hrs</span></p>
          <p className="text-xs text-blue-600 mt-2 font-medium">Until 30-min break required</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-md border-t-4 border-green-500">
          <p className="text-xs font-semibold text-gray-500 uppercase">Drive Time</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{driveRemaining.toFixed(1)} <span className="text-sm font-normal text-gray-500">hrs</span></p>
          <p className="text-xs text-green-600 mt-2 font-medium">Max 11 hours limit</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-md border-t-4 border-amber-500">
          <p className="text-xs font-semibold text-gray-500 uppercase">Shift Window</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{shiftRemaining.toFixed(1)} <span className="text-sm font-normal text-gray-500">hrs</span></p>
          <p className="text-xs text-amber-600 mt-2 font-medium">Max 14 hour shift</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-md border-t-4 border-purple-500">
          <p className="text-xs font-semibold text-gray-500 uppercase">Cycle (70 Hr / 8 Day)</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{cycleRemaining.toFixed(1)} <span className="text-sm font-normal text-gray-500">hrs</span></p>
          <p className="text-xs text-purple-600 mt-2 font-medium">Available in cycle</p>
        </div>
      </div>

      {/* Duty Status Switcher Bar */}
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <h3 className="font-semibold text-gray-800">Current Duty Status: <span className="text-indigo-600 font-bold">{currentStatus}</span></h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { status: 'Off Duty', color: 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300' },
            { status: 'Sleeper Berth', color: 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border-indigo-200' },
            { status: 'Driving', color: 'bg-green-50 text-green-800 hover:bg-green-100 border-green-200' },
            { status: 'On Duty (Not Driving)', color: 'bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200' },
          ].map((item) => (
            <button
              key={item.status}
              onClick={() => handleStatusChange(item.status)}
              className={`p-4 rounded-lg border text-center font-bold text-sm transition shadow-sm ${item.color} ${
                currentStatus === item.status ? 'ring-2 ring-indigo-600' : ''
              }`}
            >
              {item.status}
            </button>
          ))}
        </div>
      </div>

      {/* Recent ELD Log Events */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden p-6 space-y-4">
        <h3 className="font-semibold text-gray-800">Recent ELD Compliance Events</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-bold text-indigo-600">{log.status}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{log.location || 'N/A'}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{log.notes || 'N/A'}</td>
              </tr>
            ))}
            {logs.length === 0 && !loading && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">No ELD event logs recorded for this driver yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};