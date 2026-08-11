import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

interface FleetManagementProps {
  organizationId: string;
}

export const FleetManagement: React.FC<FleetManagementProps> = ({ organizationId }) => {
  const [activeTab, setActiveTab] = useState<'drivers' | 'trucks' | 'trailers'>('drivers');
  
  // Data States
  const [drivers, setDrivers] = useState<any[]>([]);
  const [trucks, setTrucks] = useState<any[]>([]);
  const [trailers, setTrailers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 360 & Modal States
  const [selectedDriver, setSelectedDriver] = useState<any | null>(null);
  const [selectedTruck, setSelectedTruck] = useState<any | null>(null);
  const [showDriverModal, setShowDriverModal] = useState<boolean>(false);
  const [showTruckModal, setShowTruckModal] = useState<boolean>(false);
  const [showTrailerModal, setShowTrailerModal] = useState<boolean>(false);

  // Driver 360 Sub-tabs
  const [driverSubTab, setDriverSubTab] = useState<'profile' | 'documents' | 'assignments' | 'loads' | 'safety' | 'pay' | 'activity'>('profile');
  const [assignmentHistory, setAssignmentHistory] = useState<any[]>([]);

  // New Driver Form State
  const [driverNum, setDriverNum] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [cdlNum, setCdlNum] = useState('');
  const [cdlState, setCdlState] = useState('');
  const [cdlExp, setCdlExp] = useState('');
  const [medExp, setMedExp] = useState('');
  const [driverType, setDriverType] = useState('Company Driver');

  // New Truck Form State
  const [unitNum, setUnitNum] = useState('');
  const [vin, setVin] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [status, setStatus] = useState('Available');

  // New Trailer Form State
  const [trailerNum, setTrailerNum] = useState('');
  const [trailerVin, setTrailerVin] = useState('');
  const [trailerType, setTrailerType] = useState('Dry Van');
  const [trailerYear, setTrailerYear] = useState('');

  const fetchFleetData = async () => {
    try {
      setLoading(true);
      const [dRes, tRes, trRes] = await Promise.all([
        supabase.from('drivers').select('*, current_truck:trucks(unit_number), current_trailer:trailers(unit_number)').eq('organization_id', organizationId),
        supabase.from('trucks').select('*, current_driver:drivers(first_name, last_name)').eq('organization_id', organizationId),
        supabase.from('trailers').select('*').eq('organization_id', organizationId),
      ]);

      setDrivers(dRes.data || []);
      setTrucks(tRes.data || []);
      setTrailers(trRes.data || []);
    } catch (err) {
      console.error('Error fetching fleet data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) {
      fetchFleetData();
    }
  }, [organizationId]);

  useEffect(() => {
    if (selectedDriver) {
      fetchDriverAssignments(selectedDriver.id);
    }
  }, [selectedDriver]);

  const fetchDriverAssignments = async (driverId: string) => {
    const { data } = await supabase
      .from('driver_truck_assignments')
      .select('*, truck:trucks(unit_number, make, model)')
      .eq('driver_id', driverId)
      .order('assigned_at', { ascending: false });
    setAssignmentHistory(data || []);
  };

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('drivers').insert([
        {
          organization_id: organizationId,
          driver_number: driverNum,
          first_name: firstName,
          last_name: lastName,
          phone,
          email,
          cdl_number: cdlNum,
          cdl_state: cdlState,
          cdl_expiration: cdlExp || null,
          medical_card_expiration: medExp || null,
          driver_type: driverType,
        }
      ]);
      if (error) throw error;
      setShowDriverModal(false);
      setDriverNum(''); setFirstName(''); setLastName(''); setPhone(''); setEmail('');
      setCdlNum(''); setCdlState(''); setCdlExp(''); setMedExp('');
      await fetchFleetData();
    } catch (err: any) {
      alert(err.message || 'Failed to create driver');
    }
  };

  const handleCreateTruck = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('trucks').insert([
        {
          organization_id: organizationId,
          unit_number: unitNum,
          vin,
          make,
          model,
          year: parseInt(year) || 2024,
          status,
        }
      ]);
      if (error) throw error;
      setShowTruckModal(false);
      setUnitNum(''); setVin(''); setMake(''); setModel(''); setYear('');
      await fetchFleetData();
    } catch (err: any) {
      alert(err.message || 'Failed to create truck');
    }
  };

  const handleCreateTrailer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('trailers').insert([
        {
          organization_id: organizationId,
          unit_number: trailerNum,
          vin: trailerVin,
          trailer_type: trailerType,
          year: parseInt(trailerYear) || 2024,
        }
      ]);
      if (error) throw error;
      setShowTrailerModal(false);
      setTrailerNum(''); setTrailerVin(''); setTrailerYear('');
      await fetchFleetData();
    } catch (err: any) {
      alert(err.message || 'Failed to create trailer');
    }
  };

  const assignTruckToDriver = async (driverId: string, truckId: string) => {
    try {
      await supabase
        .from('driver_truck_assignments')
        .update({ status: 'Ended', unassigned_at: new Date() })
        .eq('driver_id', driverId)
        .eq('status', 'Active');

      if (truckId) {
        await supabase.from('driver_truck_assignments').insert([
          { organization_id: organizationId, driver_id: driverId, truck_id: truckId, status: 'Active' }
        ]);
      }

      await supabase.from('drivers').update({ current_truck_id: truckId || null }).eq('id', driverId);
      if (truckId) {
        await supabase.from('trucks').update({ current_driver_id: driverId, status: 'Assigned' }).eq('id', truckId);
      }

      await fetchFleetData();
      if (selectedDriver) {
        const updated = drivers.find(d => d.id === driverId);
        if (updated) setSelectedDriver({ ...updated, current_truck_id: truckId });
      }
      alert('Truck assignment updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Assignment failed');
    }
  };

  // --- RENDER DRIVER 360 ---
  if (selectedDriver) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-md">
          <div>
            <button onClick={() => setSelectedDriver(null)} className="text-sm text-indigo-600 font-medium hover:underline mb-2 inline-block">
              ← Back to Drivers Directory
            </button>
            <h2 className="text-2xl font-bold text-gray-900">{selectedDriver.first_name} {selectedDriver.last_name}</h2>
            <p className="text-xs text-gray-500 font-mono mt-0.5">Driver # {selectedDriver.driver_number} • CDL: {selectedDriver.cdl_number || 'N/A'} ({selectedDriver.cdl_state})</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            selectedDriver.employment_status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {selectedDriver.employment_status}
          </span>
        </div>

        {/* Sub-Tabs */}
        <div className="flex border-b bg-white rounded-t-lg shadow-sm px-4 space-x-4 overflow-x-auto">
          {(['profile', 'documents', 'assignments', 'loads', 'safety', 'pay', 'activity'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setDriverSubTab(tab)}
              className={`py-3 text-sm font-medium border-b-2 capitalize whitespace-nowrap transition ${
                driverSubTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-white p-6 rounded-b-lg shadow-md">
          {driverSubTab === 'profile' && (
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800 border-b pb-2">Personal & Contact Info</h3>
                <p><span className="text-gray-500 text-sm">Phone:</span> <span className="font-medium">{selectedDriver.phone || 'N/A'}</span></p>
                <p><span className="text-gray-500 text-sm">Email:</span> <span className="font-medium">{selectedDriver.email || 'N/A'}</span></p>
                <p><span className="text-gray-500 text-sm">Address:</span> <span className="font-medium">{selectedDriver.address || 'N/A'}</span></p>
                <p><span className="text-gray-500 text-sm">Driver Type:</span> <span className="font-medium">{selectedDriver.driver_type}</span></p>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800 border-b pb-2">Compliance & Certifications</h3>
                <p><span className="text-gray-500 text-sm">CDL Expiration:</span> <span className="font-medium">{selectedDriver.cdl_expiration || 'N/A'}</span></p>
                <p><span className="text-gray-500 text-sm">Medical Card Expiration:</span> <span className="font-medium text-amber-600">{selectedDriver.medical_card_expiration || 'N/A'}</span></p>
                <p><span className="text-gray-500 text-sm">Hire Date:</span> <span className="font-medium">{selectedDriver.hire_date || 'N/A'}</span></p>
                <div className="pt-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Assign Truck:</label>
                  <select
                    value={selectedDriver.current_truck_id || ''}
                    onChange={(e) => assignTruckToDriver(selectedDriver.id, e.target.value)}
                    className="border p-2 rounded text-sm w-full"
                  >
                    <option value="">Unassigned</option>
                    {trucks.map((t) => (
                      <option key={t.id} value={t.id}>Unit #{t.unit_number} ({t.make} {t.model})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {driverSubTab === 'documents' && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">Driver Qualification Documents (CDL, Medical Card)</h3>
              <p className="text-sm text-gray-500">No documents uploaded yet.</p>
            </div>
          )}

          {driverSubTab === 'assignments' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Time-Aware Truck Assignment History</h3>
              <div className="space-y-2">
                {assignmentHistory.map((ah) => (
                  <div key={ah.id} className="p-3 border rounded bg-gray-50 flex justify-between items-center text-sm">
                    <div>
                      <p className="font-bold text-indigo-600">Truck Unit #{ah.truck?.unit_number} ({ah.truck?.make} {ah.truck?.model})</p>
                      <p className="text-xs text-gray-500">Assigned: {new Date(ah.assigned_at).toLocaleDateString()} {ah.unassigned_at ? `— Unassigned: ${new Date(ah.unassigned_at).toLocaleDateString()}` : '(Current)'}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded ${ah.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                      {ah.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {driverSubTab === 'loads' && <div><h3 className="font-semibold text-gray-800 mb-2">Assigned Loads</h3><p className="text-sm text-gray-500">No active or past loads linked.</p></div>}
          {driverSubTab === 'safety' && <div><h3 className="font-semibold text-gray-800 mb-2">Safety & Violations</h3><p className="text-sm text-gray-500">Clean safety record.</p></div>}
          {driverSubTab === 'pay' && <div><h3 className="font-semibold text-gray-800 mb-2">Pay Configuration</h3><p className="text-sm text-gray-500">Percentage split: 75% linehaul.</p></div>}
          {driverSubTab === 'activity' && <div><h3 className="font-semibold text-gray-800 mb-2">Driver Activity Log</h3><p className="text-sm text-gray-500">Profile created.</p></div>}
        </div>
      </div>
    );
  }

  // --- RENDER MAIN DIRECTORY ---
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-md">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Fleet & Driver Management</h2>
          <p className="text-sm text-gray-500">Manage drivers, power units, trailers, and assignments</p>
        </div>
        <div className="space-x-3">
          <button onClick={() => setShowDriverModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700">+ Add Driver</button>
          <button onClick={() => setShowTruckModal(true)} className="px-4 py-2 bg-gray-800 text-white rounded text-sm font-medium hover:bg-gray-900">+ Add Truck</button>
          <button onClick={() => setShowTrailerModal(true)} className="px-4 py-2 bg-gray-600 text-white rounded text-sm font-medium hover:bg-gray-700">+ Add Trailer</button>
        </div>
      </div>

      {/* Primary Tabs */}
      <div className="flex border-b bg-white rounded-t-lg shadow-sm px-4 space-x-6">
        {(['drivers', 'trucks', 'trailers'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 text-sm font-bold capitalize transition border-b-2 ${
              activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab} ({tab === 'drivers' ? drivers.length : tab === 'trucks' ? trucks.length : trailers.length})
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
        {activeTab === 'drivers' && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Truck</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CDL Exp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {drivers.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono font-medium text-gray-900">{d.driver_number}</td>
                  <td className="px-6 py-4 text-sm font-bold text-indigo-600">{d.first_name} {d.last_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{d.driver_type}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-700">{d.current_truck?.unit_number ? `Unit #${d.current_truck.unit_number}` : 'Unassigned'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{d.cdl_expiration || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">{d.employment_status}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button onClick={() => setSelectedDriver(d)} className="text-indigo-600 hover:text-indigo-900 font-medium text-xs">View 360 →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'trucks' && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Make / Model / Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">VIN</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {trucks.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono font-bold text-indigo-600">Unit #{t.unit_number}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{t.year} {t.make} {t.model}</td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-500">{t.vin}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{t.current_driver ? `${t.current_driver.first_name} ${t.current_driver.last_name}` : 'Unassigned'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{t.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'trailers' && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">VIN</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {trailers.map((tr) => (
                <tr key={tr.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono font-bold text-indigo-600">Unit #{tr.unit_number}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{tr.trailer_type}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{tr.year}</td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-500">{tr.vin}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{tr.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Driver Modal */}
      {showDriverModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Add New Driver Profile</h3>
            <form onSubmit={handleCreateDriver} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Driver # (e.g. DRV-101)" value={driverNum} onChange={(e) => setDriverNum(e.target.value)} required className="border p-2 rounded text-sm" />
                <select value={driverType} onChange={(e) => setDriverType(e.target.value)} className="border p-2 rounded text-sm">
                  <option value="Company Driver">Company Driver</option>
                  <option value="Owner-Operator">Owner-Operator</option>
                  <option value="Lease Purchase">Lease Purchase</option>
                </select>
                <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="border p-2 rounded text-sm" />
                <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="border p-2 rounded text-sm" />
                <input type="text" placeholder="CDL Number" value={cdlNum} onChange={(e) => setCdlNum(e.target.value)} className="border p-2 rounded text-sm" />
                <input type="text" placeholder="CDL State" value={cdlState} onChange={(e) => setCdlState(e.target.value)} className="border p-2 rounded text-sm" />
                <div>
                  <label className="block text-xs text-gray-500">CDL Expiration</label>
                  <input type="date" value={cdlExp} onChange={(e) => setCdlExp(e.target.value)} className="border p-2 rounded text-sm w-full" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Medical Card Exp</label>
                  <input type="date" value={medExp} onChange={(e) => setMedExp(e.target.value)} className="border p-2 rounded text-sm w-full" />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-3 border-t">
                <button type="button" onClick={() => setShowDriverModal(false)} className="px-4 py-2 border rounded text-sm">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium">Save Driver</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Truck Modal */}
      {showTruckModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Add Power Unit (Truck)</h3>
            <form onSubmit={handleCreateTruck} className="space-y-3">
              <input type="text" placeholder="Unit Number (e.g. TRK-501)" value={unitNum} onChange={(e) => setUnitNum(e.target.value)} required className="border p-2 rounded text-sm w-full" />
              <input type="text" placeholder="VIN" value={vin} onChange={(e) => setVin(e.target.value)} required className="border p-2 rounded text-sm w-full" />
              <div className="grid grid-cols-3 gap-2">
                <input type="text" placeholder="Make" value={make} onChange={(e) => setMake(e.target.value)} className="border p-2 rounded text-sm" />
                <input type="text" placeholder="Model" value={model} onChange={(e) => setModel(e.target.value)} className="border p-2 rounded text-sm" />
                <input type="number" placeholder="Year" value={year} onChange={(e) => setYear(e.target.value)} className="border p-2 rounded text-sm" />
              </div>
              <div className="flex justify-end space-x-3 pt-3 border-t">
                <button type="button" onClick={() => setShowTruckModal(false)} className="px-4 py-2 border rounded text-sm">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium">Save Truck</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Trailer Modal */}
      {showTrailerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Add Trailer</h3>
            <form onSubmit={handleCreateTrailer} className="space-y-3">
              <input type="text" placeholder="Unit Number (e.g. TRL-201)" value={trailerNum} onChange={(e) => setTrailerNum(e.target.value)} required className="border p-2 rounded text-sm w-full" />
              <input type="text" placeholder="VIN" value={trailerVin} onChange={(e) => setTrailerVin(e.target.value)} required className="border p-2 rounded text-sm w-full" />
              <div className="grid grid-cols-2 gap-2">
                <select value={trailerType} onChange={(e) => setTrailerType(e.target.value)} className="border p-2 rounded text-sm">
                  <option value="Dry Van">Dry Van</option>
                  <option value="Reefer">Reefer</option>
                  <option value="Flatbed">Flatbed</option>
                  <option value="Step Deck">Step Deck</option>
                  <option value="Tanker">Tanker</option>
                </select>
                <input type="number" placeholder="Year" value={trailerYear} onChange={(e) => setTrailerYear(e.target.value)} className="border p-2 rounded text-sm" />
              </div>
              <div className="flex justify-end space-x-3 pt-3 border-t">
                <button type="button" onClick={() => setShowTrailerModal(false)} className="px-4 py-2 border rounded text-sm">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium">Save Trailer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};