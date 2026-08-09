import React, { useEffect } from 'react';
import { useRegionStore } from '../services/useRegion';

export function RegionGateway({ children }: { children: React.ReactNode }) {
  const { region, setRegion } = useRegionStore();

  // Auto-detect region on mount if not already set
  useEffect(() => {
    if (!region) {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (tz.includes('Europe') || tz.includes('London') || tz.includes('Paris') || tz.includes('Berlin')) {
        setRegion('EU');
      } else {
        setRegion('US');
      }
    }
  }, [region, setRegion]);

  // If region hasn't been explicitly locked or selected, show the Enterprise Gateway Landing Page
  if (!region) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6 text-center">
          <div className="space-y-2">
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold rounded-full">
              Enterprise Fleet Gateway
            </span>
            <h1 className="text-2xl font-bold text-white">Select Your Operating Region</h1>
            <p className="text-xs text-slate-400">Choose your compliance framework to load the dedicated regulatory engine.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              onClick={() => setRegion('US')}
              className="p-4 bg-slate-950 hover:bg-indigo-600/20 border border-slate-800 hover:border-indigo-500 rounded-xl transition-all group text-left space-y-2"
            >
              <div className="text-2xl">🇺🇸</div>
              <div className="font-bold text-sm text-white group-hover:text-indigo-400">United States</div>
              <div className="text-[11px] text-slate-400">FMCSA & HOS Compliance</div>
            </button>

            <button
              onClick={() => setRegion('EU')}
              className="p-4 bg-slate-950 hover:bg-blue-600/20 border border-slate-800 hover:border-blue-500 rounded-xl transition-all group text-left space-y-2"
            >
              <div className="text-2xl">🇪🇺</div>
              <div className="font-bold text-sm text-white group-hover:text-blue-400">European Union</div>
              <div className="text-[11px] text-slate-400">Regulation 561/2006 & ESG</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}