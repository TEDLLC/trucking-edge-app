import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

interface SafetyComplianceViewProps {
  organizationId: string;
}

export const SafetyComplianceView: React.FC<SafetyComplianceViewProps> = ({ organizationId }) => {
  const [activeTab, setActiveTab] = useState<'eld' | 'safety'>('eld');
  const [eldLogs, setEldLogs] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // ELD Form State
  const [driverId, setDriverId] = useState('');
  const [dutyStatus, setDutyStatus] = useState('Off-Duty');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  // Incident Form State
  const [incidentDriverId, setIncidentDriverId] = useState('');
  const [incidentType, setIncidentType] = useState('Inspection');
  const [severity, setSeverity] = useState('Low');
  const [description, setDescription] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch Drivers
      const { data: driversData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('organization_id', organizationId);
      setDrivers(driversData || []);

      // Fetch ELD Logs
      const { data: eldData } = await supabase
        .from('eld_logs')
        .select(`*, user_profiles(name)`)
        .eq('organization_id', organizationId)
        .order('start_time', { ascending: false });
      setEldLogs(eldData || []);

      // Fetch Safety Incidents
      const { data: safetyData } = await supabase
        .from('safety_incidents')
        .select(`*, user_profiles(name)`)
        .eq('organization_id', organizationId)
        .order('incident_date', { ascending: false });
      setIncidents(safetyData || []);

    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) {
      fetchData();
    }
  }, [organizationId]);

  const handleCreateEld = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverId) return;

    try {
      const { error } = await supabase.from('eld_logs').insert([
        {
          organization_id: organizationId,
          driver_id: driverId,
          duty_status: dutyStatus,
          location_description: location,
          notes,
        },
      ]);
      if (error) throw error;

      setDriverId('');
      setLocation('');
      setNotes('');
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to log HOS entry');
    }
  };

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('safety_incidents').insert([
        {
          organization_id: organizationId,
          driver_id: incidentDriverId || null,
          incident_type: incidentType,
          severity,
          description,
        },
      ]);
      if (error) throw error;

      setIncidentDriverId('');
      setDescription('');
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to record incident');
    }
  };

  if (loading) return <div className="p-4 text-gray-600">Loading Compliance Data...</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-xl font-bold text-gray-800">Safety & ELD Compliance</h2>
        <div className="space-x-2">
          <button
            onClick={() => setActiveTab('eld')}
            className={`px-3 py-1.5 rounded text-sm font-medium ${activeTab === 'eld' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            HOS / ELD Logs ({eldLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('safety')}
            className={`px-3 py-1.5 rounded text-sm font-medium ${activeTab === 'safety' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Safety Incidents & Inspections ({incidents.length})
          </button>
        </div>
      </div>

      {/* Tab 1: ELD / HOS Logs */}
      {activeTab === 'eld' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateEld} className="bg-gray-50 p-4 rounded border space-y-4 max-w-2xl">
            <h3 className="font-semibold text-sm text-gray-700">Record Duty Status Update</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
                <select
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value)}
                  required
                  className="w-full border rounded p-2 text-sm"
                >
                  <option value="">-- Choose Driver --</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>{d.name || d.id.slice(0, 8)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duty Status</label>
                <select
                  value={dutyStatus}
                  onChange={(e) => setDutyStatus(e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                >
                  <option value="Off-Duty">Off-Duty</option>
                  <option value="Sleeper Berth">Sleeper Berth</option>
                  <option value="Driving">Driving</option>
                  <option value="On-Duty (Not Driving)">On-Duty (Not Driving)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Chicago, IL"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="Optional remarks"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                />
              </div>
            </div>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium">
              Save HOS Entry
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {eldLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{log.user_profiles?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-indigo-600">{log.duty_status}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{log.location_description || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(log.start_time).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Safety Incidents */}
      {activeTab === 'safety' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateIncident} className="bg-gray-50 p-4 rounded border space-y-4 max-w-2xl">
            <h3 className="font-semibold text-sm text-gray-700">Record Inspection or Incident</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Driver (Optional)</label>
                <select
                  value={incidentDriverId}
                  onChange={(e) => setIncidentDriverId(e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                >
                  <option value="">-- None / General --</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>{d.name || d.id.slice(0, 8)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                >
                  <option value="Inspection">Inspection</option>
                  <option value="Violation">Violation</option>
                  <option value="Accident">Accident</option>
                  <option value="Warning">Warning</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                placeholder="Details of inspection or incident"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full border rounded p-2 text-sm"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium">
              Log Incident Record
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {incidents.map((inc) => (
                  <tr key={inc.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{inc.incident_type}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-red-600">{inc.severity}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{inc.description}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(inc.incident_date).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};