import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

export default function EnterpriseDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state for inviting new users
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Dispatcher');

  // Fetch users from Supabase on component load
  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase.from('users').select('*');
      if (error) {
        console.error('Error fetching users:', error);
      } else {
        setUsers(data || []);
      }
      setLoading(false);
    }

    fetchUsers();
  }, []);

  // Handle inviting a new user
  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) {
      alert('Please fill out all fields.');
      return;
    }

    const { data, error } = await supabase.from('users').insert([
      { name: fullName, email: email, role: role, status: 'Active' }
    ]).select();

    if (error) {
      console.error('Error adding user:', error);
      alert('Failed to add user.');
    } else if (data) {
      setUsers([...users, data[0]]);
      setFullName('');
      setEmail('');
      alert('User invited successfully!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">System Administration</h1>
            <p className="text-sm text-slate-400">Manage global financial metrics, access control, and team permissions.</p>
          </div>
        </div>

        {/* 1. Unified 4-Column Financial KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 backdrop-blur-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Gross Revenue</p>
            <p className="text-2xl font-semibold text-white mt-2">$7,350</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 backdrop-blur-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Avg Fleet Rate/Mile</p>
            <p className="text-2xl font-semibold text-white mt-2">$2.55</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 backdrop-blur-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Miles Logged</p>
            <p className="text-2xl font-semibold text-white mt-2">2,885 mi</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 backdrop-blur-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Net Profit</p>
            <p className="text-2xl font-semibold text-emerald-400 mt-2">$1,112.75</p>
          </div>
        </div>

        {/* Main Content Grid: Table & Invite Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: User Access Table (Spans 2 columns) */}
          <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-xl overflow-hidden backdrop-blur-sm">
            <div className="p-6 border-b border-slate-800/80">
              <h2 className="text-base font-semibold text-white">System Access & Roles</h2>
              <p className="text-xs text-slate-400 mt-1">Manage administrators, dispatchers, and drivers accessing the portal.</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/60 text-xs font-medium text-slate-400 uppercase tracking-wider bg-slate-900/20">
                    <th className="py-3 px-6">User Name</th>
                    <th className="py-3 px-6">Email Address</th>
                    <th className="py-3 px-6">Role</th>
                    <th className="py-3 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400">Loading team members...</td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400">No users found in database.</td>
                    </tr>
                  ) : (
                    users.map((user, index) => (
                      <tr key={user.id || index} className="hover:bg-slate-800/20 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-medium text-white">{user.name}</div>
                          <div className="text-xs text-slate-400">USR-0{index + 1}</div>
                        </td>
                        <td className="py-4 px-6 text-slate-300">{user.email}</td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            {user.status || 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Invite User Form Card */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 backdrop-blur-sm flex flex-col justify-between">
            <form onSubmit={handleInviteUser}>
              <div>
                <h2 className="text-base font-semibold text-white">Invite New System User</h2>
                <p className="text-xs text-slate-400 mt-1">Send secure onboarding credentials to a new team member.</p>
                
                <div className="space-y-4 mt-6">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jane Dispatcher" 
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@truckingedge.com" 
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Role</label>
                    <select 
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    >
                      <option value="Dispatcher">Dispatcher</option>
                      <option value="Admin">Admin</option>
                      <option value="Driver">Driver</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm py-2.5 px-4 rounded-lg shadow-lg shadow-indigo-600/20 transition-all cursor-pointer">
                  Send Invitation
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}