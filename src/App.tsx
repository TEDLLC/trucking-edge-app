import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { useRegionStore, type UserRegion } from './services/useRegion';
import { useUserStore, type UserRole } from './services/useUserStore';

// Page Imports
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { LoadsPage } from './pages/LoadsPage';
import { DriversPage } from './pages/DriversPage';
import { EldPage } from './pages/EldPage';
import { HosLogsDashboard } from './pages/HosLogsDashboard';
import { FuelPage } from './pages/FuelPage';
import { IftaDashboard } from './pages/IftaDashboard';
import { LoadBoardIntegrationPage } from './pages/LoadBoardIntegrationPage';
import { FinancialsPage } from './pages/FinancialsPage';
import { ProfitLossPage } from './pages/ProfitLossPage';
import { TaxPage } from './pages/TaxPage';
import { BillingPage } from './pages/BillingPage';
import { SettingsPage } from './pages/SettingsPage';
import { SupportPage } from './pages/SupportPage';

export const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState('loads');

  // Global Stores
  const { region, setUserRegion } = useRegionStore();
  const { role, setRole } = useUserStore();

  // App Level State for pages requiring props
  const [loads, setLoads] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([
    {
      id: 'DRV-101',
      name: 'Hans Müller',
      truck: 'Truck-01',
      phone: '+15550199',
      license: 'E1234567890000',
      status: 'Active'
    }
  ]);
  const [fuelLogs, setFuelLogs] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync region & role strictly from logged-in user metadata
  useEffect(() => {
    if (session?.user) {
      const userRegion = session.user.user_metadata?.region;
      const userRole = session.user.user_metadata?.role || 'admin';

      if (userRegion) setUserRegion(userRegion as UserRegion);
      if (userRole) setRole(userRole as UserRole);
    }
  }, [session, setUserRegion, setRole]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setShowAuth(false);
  };

  const handleOpenAuthWithRegion = (selectedRegion: UserRegion) => {
    setUserRegion(selectedRegion);
    setShowAuth(true);
  };

  // Shared Handlers
  const handleAddLoad = (newLoad: any) => {
    setLoads((prev) => [...prev, { ...newLoad, id: Date.now().toString() }]);
  };

  const handleUpdateLoadStatus = (id: string, status: string) => {
    setLoads((prev) =>
      prev.map((load) => (load.id === id ? { ...load, status } : load))
    );
  };

  const handleAddDriver = (newDriver: any) => {
    setDrivers((prev) => [...prev, newDriver]);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        Loading Trucking Edge...
      </div>
    );
  }

  // Helper to render the active page view
  const renderActivePage = () => {
    switch (activeTab) {
      case 'loads':
        return (
          <LoadsPage
            loads={loads}
            drivers={drivers}
            onAddLoad={handleAddLoad}
            onUpdateLoadStatus={handleUpdateLoadStatus}
          />
        );
      case 'drivers':
        return <DriversPage drivers={drivers} onAddDriver={handleAddDriver} />;
      case 'eld':
        return <EldPage drivers={drivers} />;
      case 'hos':
        return <HosLogsDashboard />;
      case 'fuel':
        return <FuelPage />;
      case 'ifta':
        return <IftaDashboard />;
      case 'loadboard':
        return <LoadBoardIntegrationPage />;
      case 'financials':
        return <FinancialsPage />;
      case 'profitloss':
        return <ProfitLossPage />;
      case 'tax':
        return <TaxPage fuelLogs={fuelLogs} />;
      case 'billing':
        return <BillingPage />;
      case 'settings':
        return <SettingsPage />;
      case 'support':
        return <SupportPage />;
      default:
        return (
          <LoadsPage
            loads={loads}
            drivers={drivers}
            onAddLoad={handleAddLoad}
            onUpdateLoadStatus={handleUpdateLoadStatus}
          />
        );
    }
  };

  // 1. Logged-in Carrier Dashboard
  if (session) {
    const isEU = region === 'EU';

    return (
      <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
        {/* Full Navigation Sidebar */}
        <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 shrink-0 h-full overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 mb-6 px-2">
              <span className="text-xl">🚛</span>
              <span className="font-bold text-base text-white tracking-wide">TRUCKING EDGE</span>
              <span className="text-[10px] bg-indigo-600 text-white font-bold px-1.5 py-0.5 rounded">PRO</span>
            </div>

            {/* Role-Filtered Navigation */}
            <nav className="flex flex-col gap-1 text-xs">
              <div className="text-slate-500 font-semibold px-2 pt-2 pb-1 text-[10px] uppercase tracking-wider">
                Operations ({role.toUpperCase()})
              </div>

              <button 
                onClick={() => setActiveTab('loads')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${activeTab === 'loads' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                📦 Dispatches & Loads
              </button>

              {role !== 'driver' && (
                <button 
                  onClick={() => setActiveTab('drivers')}
                  className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${activeTab === 'drivers' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                >
                  👥 Drivers & Roster
                </button>
              )}

              <button 
                onClick={() => setActiveTab('eld')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${activeTab === 'eld' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                📟 ELD Operations
              </button>

              <button 
                onClick={() => setActiveTab('hos')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${activeTab === 'hos' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                ⏱️ HOS Logs Dashboard
              </button>

              {role !== 'driver' && (
                <>
                  <button 
                    onClick={() => setActiveTab('loadboard')}
                    className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${activeTab === 'loadboard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                  >
                    🌐 Load Board Integrations
                  </button>

                  <div className="text-slate-500 font-semibold px-2 pt-4 pb-1 text-[10px] uppercase tracking-wider">Finance & Taxes</div>
                  <button 
                    onClick={() => setActiveTab('fuel')}
                    className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${activeTab === 'fuel' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                  >
                    ⛽ Fuel Tracking
                  </button>
                  <button 
                    onClick={() => setActiveTab('ifta')}
                    className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${activeTab === 'ifta' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                  >
                    🗺️ IFTA Tax Reporting
                  </button>
                  <button 
                    onClick={() => setActiveTab('financials')}
                    className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${activeTab === 'financials' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                  >
                    📊 Financial Overview
                  </button>
                  <button 
                    onClick={() => setActiveTab('profitloss')}
                    className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${activeTab === 'profitloss' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                  >
                    📈 Profit & Loss
                  </button>
                  <button 
                    onClick={() => setActiveTab('tax')}
                    className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${activeTab === 'tax' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                  >
                    🧾 Tax Compliance
                  </button>
                </>
              )}

              <div className="text-slate-500 font-semibold px-2 pt-4 pb-1 text-[10px] uppercase tracking-wider">Account</div>
              {role === 'admin' && (
                <button 
                  onClick={() => setActiveTab('billing')}
                  className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${activeTab === 'billing' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                >
                  💳 Subscription & Billing
                </button>
              )}
              <button 
                onClick={() => setActiveTab('settings')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                ⚙️ Settings
              </button>
              <button 
                onClick={() => setActiveTab('support')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${activeTab === 'support' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                🎧 Help & Support
              </button>
            </nav>
          </div>

          <button 
            onClick={handleLogout} 
            className="w-full py-2 px-3 mt-6 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Log Out
          </button>
        </aside>

        {/* Main Workspace Area */}
        <main className="flex-1 p-8 overflow-y-auto h-full">
          <header className="flex justify-between items-center pb-6 border-b border-slate-800 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white uppercase tracking-tight">{activeTab}</h1>
              <p className="text-xs text-slate-400 mt-1">
                Logged in as {session.user?.email} • <span className="text-indigo-400 capitalize">{role}</span>
              </p>
            </div>

            {/* Read-Only Locked Region Display */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Account Region:</span>
              <span
                className={`px-3 py-1.5 rounded-md text-xs font-bold border ${
                  isEU
                    ? 'bg-purple-900/30 text-purple-400 border-purple-600'
                    : 'bg-indigo-900/30 text-indigo-400 border-indigo-600'
                }`}
              >
                {isEU ? '🇪🇺 EU (561/2006)' : '🇺🇸 US (FMCSA)'}
              </span>
            </div>
          </header>

          {/* Active View Component */}
          {renderActivePage()}
        </main>
      </div>
    );
  }

  // 2. Auth Page Mode
  if (showAuth) {
    return (
      <div className="relative min-h-screen bg-slate-950">
        <button 
          onClick={() => setShowAuth(false)} 
          className="absolute top-5 left-5 z-10 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg border border-slate-700 transition-colors"
        >
          ← Back to Landing Page
        </button>
        <AuthPage />
      </div>
    );
  }

  // 3. Public Landing Page View
  return (
    <>
      <style>{`
        html, body, #root {
          height: auto !important;
          min-height: 100% !important;
          max-height: none !important;
          overflow: auto !important;
          overflow-y: auto !important;
          position: static !important;
        }
      `}</style>

      <div className="w-full min-h-screen bg-slate-950 flex flex-col">
        <div className="bg-slate-900 border-b border-slate-800 py-2.5 px-6 flex justify-between items-center text-xs text-slate-300 w-full">
          <span>Select Target Portal:</span>
          <div className="flex gap-2">
            <button 
              onClick={() => handleOpenAuthWithRegion('US')}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium transition-colors cursor-pointer"
            >
              US (FMCSA) Portal
            </button>
            <button 
              onClick={() => handleOpenAuthWithRegion('EU')}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded font-medium transition-colors cursor-pointer"
            >
              EU (561/2006) Portal
            </button>
          </div>
        </div>

        <LandingPage onOpenAuth={(region) => handleOpenAuthWithRegion(region as UserRegion)} />
      </div>
    </>
  );
};

export default App;