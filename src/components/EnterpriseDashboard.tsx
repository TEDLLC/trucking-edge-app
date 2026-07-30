export default function EnterpriseDashboard() {
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
                  <tr className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-medium text-white">John Dispatcher</div>
                      <div className="text-xs text-slate-400">USR-01</div>
                    </td>
                    <td className="py-4 px-6 text-slate-300">john@truckingedgedispatchers.com</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        Dispatcher
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Active
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-medium text-white">Sarah Admin</div>
                      <div className="text-xs text-slate-400">USR-02</div>
                    </td>
                    <td className="py-4 px-6 text-slate-300">sarah@truckingedgedispatchers.com</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Admin
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Active
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-medium text-white">Marcus Vance</div>
                      <div className="text-xs text-slate-400">USR-03</div>
                    </td>
                    <td className="py-4 px-6 text-slate-300">marcus@truckingedgedispatchers.com</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        Driver
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Active
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Invite User Form Card */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 backdrop-blur-sm flex flex-col justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Invite New System User</h2>
              <p className="text-xs text-slate-400 mt-1">Send secure onboarding credentials to a new team member.</p>
              
              <div className="space-y-4 mt-6">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Jane Dispatcher" 
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="jane@truckingedge.com" 
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm py-2.5 px-4 rounded-lg shadow-lg shadow-indigo-600/20 transition-all">
                Send Invitation
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}