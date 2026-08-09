import React from 'react';

interface LandingPageProps {
  onOpenAuth?: (region: 'US (FMCSA)' | 'EU (561/2006)') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  return (
    /* Force min-h-screen and visible vertical overflow so parent layouts scroll freely */
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 font-sans relative overflow-y-visible pb-24">
      {/* Navigation Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
            🚛
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Trucking Edge
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#portals" className="hover:text-white transition-colors">Portals</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </nav>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => onOpenAuth?.('US (FMCSA)')}
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={() => onOpenAuth?.('US (FMCSA)')}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all shadow-md shadow-indigo-600/20"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-800/50 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-8">
          ⚡ Next-Gen Carrier OS v2.0
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight mb-6">
          Global Freight & Dispatch <br className="hidden md:block" />
          Management for <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">US & EU Fleets</span>
        </h1>

        <p className="max-w-2xl mx-auto text-slate-400 text-base md:text-lg mb-10 leading-relaxed">
          Automate dispatches, calculate real-time Rate Per Mile / Kilometer, manage driver HOS compliance, and handle tax reporting in one unified platform.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12">
          <button
            onClick={() => onOpenAuth?.('US (FMCSA)')}
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Enter US Portal (FMCSA) →
          </button>
          <button
            onClick={() => onOpenAuth?.('EU (561/2006)')}
            className="w-full sm:w-auto px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Enter EU Portal (561/2006) →
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> No credit card required</span>
          <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> FMCSA & EU 561/2006 Compliant</span>
        </div>
      </section>

      {/* Feature Section Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-16 border-t border-slate-800/80">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="w-12 h-12 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl mb-6">
              📊
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Rate & RPM Analytics</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Calculate exact profit margins per load across miles or kilometers before confirming dispatches.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-xl mb-6">
              🛡️
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Dual-Region Compliance</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Native support for US FMCSA 70-hour cycles and EU 561/2006 driving time limits.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl mb-6">
              🧾
            </div>
            <h3 className="text-xl font-bold text-white mb-3">IFTA & Tax Reporting</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Automatically track jurisdiction miles and fuel logs for simple end-of-quarter tax filings.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;