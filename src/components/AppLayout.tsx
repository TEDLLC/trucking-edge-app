import React from 'react';
import { RegionToggle } from './RegionToggle';

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function AppLayout({ children, activeTab, setActiveTab }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* Primary Sidebar Navigation */}
      <aside className="w-64 bg-slate-900/80 border-r border-slate-800/80 flex flex-col justify-between shrink-0 hidden lg:flex backdrop-blur-md">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/30">
              TE
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-wide text-white uppercase">Trucking Edge</h1>
              <p className="text-[11px] text-slate-400 font-medium">Dispatch Operations</p>
            </div>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'dispatch', label: 'Dispatch & RPM', icon: '📊' },
              { id: 'roster', label: 'Driver Roster & HOS', icon: '👤' },
              { id: 'eld', label: 'ELD / HOS Logs', icon: '🕒' },
              { id: 'fuel', label: 'Fuel Map & Logs', icon: '⛽' },
              { id: 'finance', label: 'Profit & Loss / Invoices', icon: '💰' },
              { id: 'tax', label: 'Admin Tax & IFTA', icon: '🏛️' },
              { id: 'roles', label: 'Fleet Access Roles', icon: '🔒' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 border-t border-slate-800/80">
          <button className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-medium py-2 px-3 rounded-lg transition-all">
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-slate-400">Carrier Portal & Tools Hub</span>
          </div>
          
          <div className="flex items-center gap-3 text-xs">
            <RegionToggle />
            <div className="bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300 flex items-center gap-2">
              <span className="text-slate-500">Fleet Time Zone:</span>
              <span className="font-medium text-white">Central Time (CT)</span>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-[1400px] w-full mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}