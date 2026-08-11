import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

interface AdminDashboardProps {
  organizationId: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ organizationId }) => {
  const [activeTab, setActiveTab] = useState<'org' | 'terminals' | 'users' | 'audit'>('org');
  const [orgDetails, setOrgDetails] = useState<any>({});
  const [terminals, setTerminals] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // New Terminal Form State
  const [termName, setTermName] = useState('');
  const [termAddress, setTermAddress] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Organization Details
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single();
      if (orgError) throw orgError;
      setOrgDetails(orgData || {});

      // 2. Fetch Terminals
      const { data: termData, error: termError } = await supabase
        .from('terminals')
        .select('*')
        .eq('organization_id', organizationId);
      if (termError) throw termError;
      setTerminals(termData || []);

      // 3. Fetch Users
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select(`*, roles(name), terminals(name)`)
        .eq('organization_id', organizationId);
      if (userError) throw userError;
      setUsers(userData || []);

      // 4. Fetch Audit Logs
      const { data: auditData, error: auditError } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('organization_id', organizationId)
        .order('timestamp', { ascending: false })
        .limit(50);
      if (auditError) throw auditError;
      setAuditLogs(auditData || []);

    } catch (err: any) {
      setError(err.message || 'Failed to load administration data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) {
      fetchAdminData();
    }
  }, [organizationId]);

  const handleUpdateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          legal_name: orgDetails.legal_name,
          dot_number: orgDetails.dot_number,
          mc_number: orgDetails.mc_number,
          address: orgDetails.address,
          timezone: orgDetails.timezone,
          default_currency: orgDetails.default_currency,
        })
        .eq('id', organizationId);

      if (error) throw error;
      alert('Organization profile updated successfully!');
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update organization');
    }
  };

  const handleCreateTerminal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termName) return;

    try {
      const { error } = await supabase.from('terminals').insert([
        {
          organization_id: organizationId,
          name: termName,
          address: termAddress,
          status: 'Active',
        },
      ]);
      if (error) throw error;

      setTermName('');
      setTermAddress('');
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to create terminal');
    }
  };

  if (loading) return <div className="p-4 text-gray-600">Loading Administration...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-xl font-bold text-gray-800">Administration & Settings</h2>
        <div className="space-x-2">
          <button
            onClick={() => setActiveTab('org')}
            className={`px-3 py-1.5 rounded text-sm font-medium ${activeTab === 'org' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Organization Profile
          </button>
          <button
            onClick={() => setActiveTab('terminals')}
            className={`px-3 py-1.5 rounded text-sm font-medium ${activeTab === 'terminals' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Terminals ({terminals.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded text-sm font-medium ${activeTab === 'users' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Users & Roles ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded text-sm font-medium ${activeTab === 'audit' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {/* Tab 1: Organization Profile */}
      {activeTab === 'org' && (
        <form onSubmit={handleUpdateOrg} className="space-y-4 max-w-2xl">
          <h3 className="text-lg font-semibold text-gray-700">Company & Regulatory Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Legal Company Name</label>
              <input
                type="text"
                value={orgDetails.legal_name || ''}
                onChange={(e) => setOrgDetails({ ...orgDetails, legal_name: e.target.value })}
                className="w-full border rounded p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">DOT Number</label>
              <input
                type="text"
                value={orgDetails.dot_number || ''}
                onChange={(e) => setOrgDetails({ ...orgDetails, dot_number: e.target.value })}
                className="w-full border rounded p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MC Number</label>
              <input
                type="text"
                value={orgDetails.mc_number || ''}
                onChange={(e) => setOrgDetails({ ...orgDetails, mc_number: e.target.value })}
                className="w-full border rounded p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
              <input
                type="text"
                value={orgDetails.timezone || 'UTC'}
                onChange={(e) => setOrgDetails({ ...orgDetails, timezone: e.target.value })}
                className="w-full border rounded p-2 text-sm"
              />
            </div>
          </div>
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700">
            Save Changes
          </button>
        </form>
      )}

      {/* Tab 2: Terminals */}
      {activeTab === 'terminals' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateTerminal} className="bg-gray-50 p-4 rounded border space-y-3 max-w-xl">
            <h4 className="font-semibold text-sm text-gray-700">Add New Terminal / Location</h4>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Terminal Name"
                value={termName}
                onChange={(e) => setTermName(e.target.value)}
                required
                className="border rounded p-2 text-sm"
              />
              <input
                type="text"
                placeholder="Address"
                value={termAddress}
                onChange={(e) => setTermAddress(e.target.value)}
                className="border rounded p-2 text-sm"
              />
            </div>
            <button type="submit" className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm font-medium">
              Create Terminal
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {terminals.map((t) => (
                  <tr key={t.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{t.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{t.address || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{t.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Users & Roles */}
      {activeTab === 'users' && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Terminal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.name || 'Unnamed User'}</td>
                  <td className="px-6 py-4 text-sm text-indigo-600 font-semibold">{u.roles?.name || 'No Role Assigned'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{u.terminals?.name || 'All Terminals'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{u.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actor ID</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-indigo-600">{log.action}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{log.entity}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{log.actor_id ? log.actor_id.slice(0, 8) + '...' : 'System'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};