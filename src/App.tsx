import React, { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import './App.css';

type Role = 'Owner' | 'Admin' | 'Dispatcher' | 'Driver';
type Plan = 'Starter' | 'Professional' | 'Business' | 'Enterprise';
type SubscriptionStatus = 'Active' | 'Trialing' | 'Past Due' | 'Canceled';

type Tab =
  | 'overview'
  | 'loads'
  | 'board'
  | 'drivers'
  | 'eld-integration'
  | 'fuel'
  | 'financials'
  | 'tax'
  | 'invoices'
  | 'users'
  | 'billing'
  | 'settings';

interface Load {
  id: string;
  origin: string;
  destination: string;
  driver: string;
  rate: number;
  miles: number;
  fuelCost: number;
  status: 'Pending' | 'In Transit' | 'Delivered';
  date: string;
}

interface BoardLoad {
  id: string;
  origin: string;
  destination: string;
  equipment: string;
  weight: string;
  rate: number;
  miles: number;
  rpm: number;
  broker: string;
  pickupDate: string;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  truck: string;
  payPerMile: number;
  status: 'Available' | 'On Route' | 'Off Duty';
}

interface FuelEntry {
  id: string;
  driverName: string;
  truck: string;
  gallons: number;
  cost: number;
  state: string;
  location: string;
  date: string;
}

interface ELDIntegrationConnection {
  id: string;
  provider: 'Motive (KeepTruckin)' | 'Samsara' | 'Geotab' | 'Garmin eLog' | 'Omnitracs';
  status: 'Connected' | 'Disconnected' | 'Sync Error';
  apiKey: string;
  lastSynced: string;
  activeUnits: number;
}

interface Invoice {
  id: string;
  loadId: string;
  client: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: 'Paid' | 'Sent' | 'Draft';
}

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'Active' | 'Inactive';
}

interface Organization {
  name: string;
  mcNumber: string;
  dotNumber: string;
  phone: string;
  email: string;
  address: string;
  timezone: string;
  taxId: string;
  currency: string;
  autoDispatch: boolean;
  twoFactorRequired: boolean;
  dataRetentionMonths: number;
  webhookUrl: string;
}

interface Subscription {
  plan: Plan;
  status: SubscriptionStatus;
  monthlyPrice: number;
  renewalDate: string;
  seats: number;
  maxSeats: number;
  loadsThisMonth: number;
  loadLimit: number | null;
}

const STORAGE = {
  loads: 'ted_enterprise_loads',
  board: 'ted_enterprise_board',
  drivers: 'ted_enterprise_drivers',
  fuel: 'ted_enterprise_fuel',
  eldIntegrations: 'ted_enterprise_eld_integrations',
  invoices: 'ted_enterprise_invoices',
  users: 'ted_enterprise_users',
  org: 'ted_enterprise_org',
  subscription: 'ted_enterprise_subscription',
  session: 'ted_enterprise_session',
};

const DEFAULT_ORG: Organization = {
  name: 'Trucking Edge Logistics LLC',
  mcNumber: 'MC-928341',
  dotNumber: 'DOT-2847195',
  phone: '(800) 555-0199',
  email: 'billing@truckingedge.com',
  address: '100 Logistics Way, Suite 400, Chicago, IL 60601',
  timezone: 'America/Chicago (CST)',
  taxId: 'XX-XXX4819',
  currency: 'USD ($)',
  autoDispatch: true,
  twoFactorRequired: true,
  dataRetentionMonths: 36,
  webhookUrl: 'https://api.truckingedge.com/v1/webhook/dispatch-events',
};

const DEFAULT_LOADS: Load[] = [
  { id: 'TED-1001', origin: 'Chicago, IL', destination: 'Dallas, TX', driver: 'Marcus Vance', rate: 2800, miles: 925, fuelCost: 450, status: 'In Transit', date: '2026-08-01' },
  { id: 'TED-1002', origin: 'Atlanta, GA', destination: 'Miami, FL', driver: 'Sarah Jenkins', rate: 1950, miles: 660, fuelCost: 310, status: 'Delivered', date: '2026-07-28' },
  { id: 'TED-1003', origin: 'Seattle, WA', destination: 'Denver, CO', driver: 'Unassigned', rate: 3400, miles: 1300, fuelCost: 620, status: 'Pending', date: '2026-08-02' },
];

const DEFAULT_BOARD_LOADS: BoardLoad[] = [
  { id: 'BLD-501', origin: 'Memphis, TN', destination: 'Charlotte, NC', equipment: 'Dry Van 53ft', weight: '42,000 lbs', rate: 1850, miles: 540, rpm: 3.43, broker: 'Apex Freight Solutions', pickupDate: '2026-08-03' },
  { id: 'BLD-502', origin: 'Houston, TX', destination: 'Kansas City, MO', equipment: 'Reefer 53ft', weight: '38,500 lbs', rate: 2600, miles: 860, rpm: 3.02, broker: 'Lone Star Logistics', pickupDate: '2026-08-03' },
  { id: 'BLD-503', origin: 'Los Angeles, CA', destination: 'Phoenix, AZ', equipment: 'Dry Van', weight: '31,000 lbs', rate: 1400, miles: 370, rpm: 3.78, broker: 'Pacific Coast Express', pickupDate: '2026-08-04' },
];

const DEFAULT_DRIVERS: Driver[] = [
  { id: 'DRV-101', name: 'Marcus Vance', phone: '(555) 234-5678', truck: 'Truck #402', payPerMile: 0.65, status: 'On Route' },
  { id: 'DRV-102', name: 'Sarah Jenkins', phone: '(555) 876-5432', truck: 'Truck #108', payPerMile: 0.60, status: 'Available' },
  { id: 'DRV-103', name: 'David Miller', phone: '(555) 345-6789', truck: 'Truck #205', payPerMile: 0.58, status: 'Off Duty' },
];

const DEFAULT_FUEL: FuelEntry[] = [
  { id: 'FL-501', driverName: 'Marcus Vance', truck: 'Truck #402', gallons: 140, cost: 485, state: 'IL', location: "Love's #310 - Effingham, IL", date: '2026-08-01' },
];

const DEFAULT_ELD_INTEGRATIONS: ELDIntegrationConnection[] = [
  { id: 'ELD-INT-1', provider: 'Motive (KeepTruckin)', status: 'Connected', apiKey: 'mot_live_******************89a2', lastSynced: '2 mins ago', activeUnits: 12 },
  { id: 'ELD-INT-2', provider: 'Samsara', status: 'Disconnected', apiKey: '', lastSynced: 'Never', activeUnits: 0 },
];

const DEFAULT_INVOICES: Invoice[] = [
  { id: 'INV-2026-101', loadId: 'TED-1001', client: 'Swift Global Freight', amount: 2800, issueDate: '2026-08-01', dueDate: '2026-08-31', status: 'Sent' },
];

const DEFAULT_USERS: User[] = [
  { id: 'USR-01', name: 'Sarah Admin', email: 'sarah@truckingedge.com', role: 'Owner', status: 'Active' },
  { id: 'USR-02', name: 'Michael Dispatch', email: 'michael@truckingedge.com', role: 'Dispatcher', status: 'Active' },
];

const DEFAULT_SUBSCRIPTION: Subscription = {
  plan: 'Professional',
  status: 'Active',
  monthlyPrice: 149,
  renewalDate: '2026-09-01',
  seats: 3,
  maxSeats: 10,
  loadsThisMonth: 42,
  loadLimit: null,
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    const parsed = value ? (JSON.parse(value) as T) : null;
    return Array.isArray(fallback) && !Array.isArray(parsed) ? fallback : (parsed ?? fallback);
  } catch {
    return fallback;
  }
}

function currency(val: number): string {
  return val.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
}

function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'green' | 'yellow' | 'red' | 'blue' | 'neutral' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function StatCard({ label, value, detail, icon, tone = 'default' }: { label: string; value: string; detail?: string; icon: string; tone?: 'default' | 'green' | 'blue' | 'amber' }) {
  return (
    <div className={`enterprise-stat ${tone}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {detail && <div className="stat-detail">{detail}</div>}
      </div>
    </div>
  );
}

export default function App() {
  const [isAuthenticated] = useState<boolean>(() => readStorage<boolean>(STORAGE.session, true));
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [bannerVisible, setBannerVisible] = useState(true);

  const [loads, setLoads] = useState<Load[]>(() => readStorage(STORAGE.loads, DEFAULT_LOADS));
  const [boardLoads] = useState<BoardLoad[]>(() => readStorage(STORAGE.board, DEFAULT_BOARD_LOADS));
  const [drivers] = useState<Driver[]>(() => readStorage(STORAGE.drivers, DEFAULT_DRIVERS));
  const [fuelEntries] = useState<FuelEntry[]>(() => readStorage(STORAGE.fuel, DEFAULT_FUEL));
  const [eldIntegrations, setEldIntegrations] = useState<ELDIntegrationConnection[]>(() => readStorage(STORAGE.eldIntegrations, DEFAULT_ELD_INTEGRATIONS));
  const [invoices, setInvoices] = useState<Invoice[]>(() => readStorage(STORAGE.invoices, DEFAULT_INVOICES));
  const [users, setUsers] = useState<User[]>(() => readStorage(STORAGE.users, DEFAULT_USERS));
  const [organization, setOrganization] = useState<Organization>(() => readStorage(STORAGE.org, DEFAULT_ORG));
  const [subscription] = useState<Subscription>(() => readStorage(STORAGE.subscription, DEFAULT_SUBSCRIPTION));

  // Form states for Loads
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [loadDriver, setLoadDriver] = useState('');
  const [rate, setRate] = useState('');
  const [miles, setMiles] = useState('');

  // ELD Form state
  const [selectedProvider, setSelectedProvider] = useState<'Motive (KeepTruckin)' | 'Samsara' | 'Geotab' | 'Garmin eLog' | 'Omnitracs'>('Samsara');
  const [integrationApiKey, setIntegrationApiKey] = useState('');

  // Manual RPM Calculator State
  const [calcTotalRevenue, setCalcTotalRevenue] = useState('');
  const [calcTotalMiles, setCalcTotalMiles] = useState('');
  const [calcDeadheadMiles, setCalcDeadheadMiles] = useState('');

  // Tax & IFTA Report Generation State
  const [reportType, setReportType] = useState<'monthly' | 'yearly'>('monthly');
  const [reportPeriod, setReportPeriod] = useState('2026-08');
  const [generatedReport, setGeneratedReport] = useState<{ type: string; period: string; totalMiles: number; totalGallons: number; totalFuelCost: number; netTaxDue: number } | null>(null);

  // Manual Invoice Creation State
  const [invClient, setInvClient] = useState('');
  const [invLoadId, setInvLoadId] = useState('');
  const [invAmount, setInvAmount] = useState('');
  const [invDueDate, setInvDueDate] = useState('');

  // Team & Roles Creation State
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<Role>('Dispatcher');

  // Settings Sub-Tab state
  const [settingsSubTab, setSettingsSubTab] = useState<'general' | 'security' | 'integrations' | 'compliance' | 'audit'>('general');

  useEffect(() => localStorage.setItem(STORAGE.loads, JSON.stringify(loads)), [loads]);
  useEffect(() => localStorage.setItem(STORAGE.board, JSON.stringify(boardLoads)), [boardLoads]);
  useEffect(() => localStorage.setItem(STORAGE.drivers, JSON.stringify(drivers)), [drivers]);
  useEffect(() => localStorage.setItem(STORAGE.fuel, JSON.stringify(fuelEntries)), [fuelEntries]);
  useEffect(() => localStorage.setItem(STORAGE.eldIntegrations, JSON.stringify(eldIntegrations)), [eldIntegrations]);
  useEffect(() => localStorage.setItem(STORAGE.invoices, JSON.stringify(invoices)), [invoices]);
  useEffect(() => localStorage.setItem(STORAGE.users, JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem(STORAGE.org, JSON.stringify(organization)), [organization]);
  useEffect(() => localStorage.setItem(STORAGE.subscription, JSON.stringify(subscription)), [subscription]);
  useEffect(() => localStorage.setItem(STORAGE.session, JSON.stringify(isAuthenticated)), [isAuthenticated]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(''), 3500);
    return () => window.clearTimeout(t);
  }, [toast]);

  const showToast = (msg: string) => setToast(msg);

  const totalGross = useMemo(() => loads.reduce((s, l) => s + l.rate, 0), [loads]);
  const totalMiles = useMemo(() => loads.reduce((s, l) => s + l.miles, 0), [loads]);
  const fleetRPM = totalMiles > 0 ? totalGross / totalMiles : 0;
  const totalFuelCost = useMemo(() => fuelEntries.reduce((s, f) => s + f.cost, 0), [fuelEntries]);
  const totalGallons = useMemo(() => fuelEntries.reduce((s, f) => s + f.gallons, 0), [fuelEntries]);
  
  const netProfit = totalGross - totalFuelCost;

  // Manual RPM Calculator computation
  const manualRevenueNum = parseFloat(calcTotalRevenue) || 0;
  const manualLoadedMilesNum = parseFloat(calcTotalMiles) || 0;
  const manualDeadheadNum = parseFloat(calcDeadheadMiles) || 0;
  const combinedMiles = manualLoadedMilesNum + manualDeadheadNum;
  const manualAllMilesRPM = combinedMiles > 0 ? manualRevenueNum / combinedMiles : 0;
  const manualLoadedRPM = manualLoadedMilesNum > 0 ? manualRevenueNum / manualLoadedMilesNum : 0;

  const handleAddLoad = (e: FormEvent) => {
    e.preventDefault();
    const r = parseFloat(rate) || 0;
    const m = parseFloat(miles) || 0;
    const newLoad: Load = {
      id: `TED-${Math.floor(1000 + Math.random() * 9000)}`,
      origin,
      destination,
      driver: loadDriver || 'Unassigned',
      rate: r,
      miles: m,
      fuelCost: Math.round(m * 0.45),
      status: 'Pending',
      date: new Date().toISOString().slice(0, 10),
    };
    setLoads([newLoad, ...loads]);
    setOrigin(''); setDestination(''); setLoadDriver(''); setRate(''); setMiles('');
    showToast(`Load ${newLoad.id} added successfully.`);
  };

  const handleConnectELD = (e: FormEvent) => {
    e.preventDefault();
    if (!integrationApiKey) {
      showToast('Please provide a valid API key/token.');
      return;
    }
    const existingIndex = eldIntegrations.findIndex(i => i.provider === selectedProvider);
    if (existingIndex >= 0) {
      const updated = [...eldIntegrations];
      updated[existingIndex] = {
        ...updated[existingIndex],
        status: 'Connected',
        apiKey: `***${integrationApiKey.slice(-4)}`,
        lastSynced: 'Just now',
        activeUnits: Math.floor(5 + Math.random() * 20),
      };
      setEldIntegrations(updated);
    } else {
      const newConn: ELDIntegrationConnection = {
        id: `ELD-INT-${Date.now()}`,
        provider: selectedProvider,
        status: 'Connected',
        apiKey: `***${integrationApiKey.slice(-4)}`,
        lastSynced: 'Just now',
        activeUnits: Math.floor(5 + Math.random() * 20),
      };
      setEldIntegrations([...eldIntegrations, newConn]);
    }
    setIntegrationApiKey('');
    showToast(`Successfully connected to ${selectedProvider}!`);
  };

  const handleDisconnectELD = (id: string) => {
    setEldIntegrations(eldIntegrations.map(item => item.id === id ? { ...item, status: 'Disconnected', activeUnits: 0 } : item));
    showToast('ELD integration disconnected.');
  };

  const handleGenerateTaxReport = (e: FormEvent) => {
    e.preventDefault();
    const multiplier = reportType === 'yearly' ? 12 : 1;
    setGeneratedReport({
      type: reportType.toUpperCase(),
      period: reportPeriod,
      totalMiles: totalMiles * multiplier,
      totalGallons: totalGallons * multiplier,
      totalFuelCost: totalFuelCost * multiplier,
      netTaxDue: Math.round((totalMiles * multiplier * 0.05) - (totalFuelCost * multiplier * 0.02)),
    });
    showToast(`Successfully generated ${reportType} IFTA report for ${reportPeriod}!`);
  };

  const handleCreateInvoice = (e: FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(invAmount) || 0;
    const newInv: Invoice = {
      id: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      loadId: invLoadId || 'TED-MANUAL',
      client: invClient,
      amount: amt,
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: invDueDate || new Date().toISOString().slice(0, 10),
      status: 'Sent',
    };
    setInvoices([newInv, ...invoices]);
    setInvClient(''); setInvLoadId(''); setInvAmount(''); setInvDueDate('');
    showToast(`Invoice ${newInv.id} generated and sent successfully.`);
  };

  const handleAddUser = (e: FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      name: userName,
      email: userEmail,
      role: userRole,
      status: 'Active',
    };
    setUsers([...users, newUser]);
    setUserName(''); setUserEmail(''); setUserRole('Dispatcher');
    showToast(`Team member ${newUser.name} added successfully.`);
  };

  const handleRemoveUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
    showToast('Team member removed.');
  };

  const handleToggleUserStatus = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u));
    showToast('User status updated.');
  };

  const handleSaveOrgSettings = (e: FormEvent) => {
    e.preventDefault();
    showToast('Enterprise organization settings updated successfully.');
  };

  const navItems: Array<{ id: Tab; label: string; icon: string; group?: string }> = [
    { id: 'overview', label: 'Overview', icon: '⌂' },
    { id: 'loads', label: 'Dispatch & Loads', icon: '▤', group: 'Operations' },
    { id: 'board', label: 'Free Load Board', icon: '🔍', group: 'Operations' },
    { id: 'drivers', label: 'Drivers & Performance', icon: '◉', group: 'Operations' },
    { id: 'eld-integration', label: 'ELD Integration', icon: '🔌', group: 'Operations' },
    { id: 'fuel', label: 'Fuel Map & IFTA', icon: '⛽', group: 'Operations' },
    { id: 'financials', label: 'Financial P&L', icon: '📊', group: 'Finance' },
    { id: 'tax', label: 'Tax & IFTA Reports', icon: '📄', group: 'Finance' },
    { id: 'invoices', label: 'Invoice Generator', icon: '💳', group: 'Finance' },
    { id: 'users', label: 'Team & Permissions', icon: '👥', group: 'Administration' },
    { id: 'billing', label: 'Subscription', icon: '⭐', group: 'Administration' },
    { id: 'settings', label: 'Enterprise Settings', icon: '⚙', group: 'Administration' },
  ];

  const titleMap: Record<Tab, string> = {
    overview: 'Fleet Operations Overview',
    loads: 'Dispatch & Load Management',
    board: 'Free Integrated Load Board',
    drivers: 'Driver Roster & Performance Analytics',
    'eld-integration': 'ELD API Webhooks & Partner Integration',
    fuel: 'Fuel Purchases & Interactive Map',
    financials: 'Financial P&L & RPM Analysis',
    tax: 'IFTA & Tax Center (Monthly/Yearly)',
    invoices: 'Automated Invoice Generator',
    users: 'Team & Permissions',
    billing: 'Subscription & Billing',
    settings: 'Enterprise Administration & Security Settings',
  };

  return (
    <div className={`enterprise-app theme-dark ${sidebarCollapsed ? 'sidebar-is-collapsed' : ''}`}>
      {bannerVisible && (
        <div style={{ background: 'linear-gradient(90deg, #1d4ed8, #2563eb, #3b82f6)', color: '#fff', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: '500', width: '100%', flexShrink: 0, zIndex: 1000, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🚀</span>
            <span><strong>Special Enterprise Promo:</strong> Unlock advanced AI dispatch matching & automated factoring for Q3.</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={() => { setActiveTab('billing'); setBannerVisible(false); }} style={{ background: '#ffffff', color: '#1d4ed8', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Upgrade Now</button>
            <button onClick={() => setBannerVisible(false)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '16px', cursor: 'pointer' }}>×</button>
          </div>
        </div>
      )}

      <div className="enterprise-layout-body" style={{ display: 'flex', flex: 1, width: '100%', height: bannerVisible ? 'calc(100vh - 43px)' : '100vh', overflow: 'hidden' }}>
        <aside className={`enterprise-sidebar ${mobileNavOpen ? 'mobile-open' : ''}`}>
          <div className="sidebar-brand">
            <div className="brand-mark">TE</div>
            {!sidebarCollapsed && (
              <div>
                <div className="brand-title">TRUCKING EDGE</div>
                <div className="brand-subtitle">FLEET OS</div>
              </div>
            )}
          </div>

          <div className="workspace-switcher">
            <div className="workspace-avatar">{organization.name.charAt(0)}</div>
            {!sidebarCollapsed && (
              <div className="workspace-info">
                <strong>{organization.name}</strong>
                <span>MC: {organization.mcNumber}</span>
              </div>
            )}
          </div>

          <nav className="enterprise-nav">
            {(['Operations', 'Finance', 'Administration'] as const).map(group => {
              const items = navItems.filter(i => i.group === group);
              return (
                <React.Fragment key={group}>
                  {!sidebarCollapsed && <div className="nav-group-label">{group}</div>}
                  {items.map(item => (
                    <button
                      key={item.id}
                      className={`enterprise-nav-item ${activeTab === item.id ? 'active' : ''}`}
                      onClick={() => { setActiveTab(item.id); setMobileNavOpen(false); }}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </button>
                  ))}
                </React.Fragment>
              );
            })}
          </nav>

          <div className="sidebar-bottom">
            {!sidebarCollapsed && (
              <div className="plan-mini-card">
                <div className="plan-mini-top">
                  <span>Plan</span>
                  <Badge tone="green">{subscription.plan}</Badge>
                </div>
                <strong>{currency(subscription.monthlyPrice)}/mo</strong>
                <button onClick={() => setActiveTab('billing')}>Manage Plan →</button>
              </div>
            )}
            <button className="collapse-button" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
              {sidebarCollapsed ? '→' : '←'} {!sidebarCollapsed && <span>Collapse</span>}
            </button>
          </div>
        </aside>

        <div className="enterprise-main">
          <header className="enterprise-header">
            <div className="header-left">
              <button className="mobile-menu-button" onClick={() => setMobileNavOpen(true)}>☰</button>
              <div>
                <div className="breadcrumb">Workspace / {titleMap[activeTab]}</div>
                <h1>{titleMap[activeTab]}</h1>
              </div>
            </div>
            <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#f8fafc' }}>
                <span>🌤️</span>
                <div>
                  <strong>Chicago, IL</strong> <span style={{ color: '#38bdf8' }}>78°F, Clear</span>
                </div>
              </div>
              <div className="global-search">
                <span>🔍</span>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search loads, drivers, trucks..." />
              </div>
              <div className="profile-button">
                <span className="profile-avatar">SA</span>
                <span className="profile-copy">
                  <strong>Sarah Admin</strong>
                  <small>Owner</small>
                </span>
              </div>
            </div>
          </header>

          <main className="enterprise-content">
            {activeTab === 'overview' && (
              <div className="dashboard-grid">
                <div className="stats-grid">
                  <StatCard label="YTD Gross Revenue" value={currency(totalGross)} detail="All active & delivered loads" icon="💵" tone="green" />
                  <StatCard label="Average RPM" value={currency(fleetRPM)} detail="Fleet rate per mile" icon="📈" tone="blue" />
                  <StatCard label="Total Fuel Spent" value={currency(totalFuelCost)} detail={`${totalGallons} gallons purchased`} icon="⛽" tone="amber" />
                  <StatCard label="Estimated Net P&L" value={currency(netProfit)} detail="After pay & overhead" icon="💰" tone="green" />
                </div>
                <div className="card">
                  <h2>Operations Command Center</h2>
                  <p>Welcome back, Sarah. All systems are operating normally. Use the <strong>Financial P&L</strong> tab to evaluate custom rate-per-mile scenarios or the <strong>Tax & IFTA</strong> tab to generate monthly/yearly reports.</p>
                </div>
              </div>
            )}

            {activeTab === 'loads' && (
              <div className="dashboard-grid">
                <div className="card">
                  <h2>Add New Dispatch Load</h2>
                  <form onSubmit={handleAddLoad} className="enterprise-inline-form">
                    <input placeholder="Origin (e.g. Chicago, IL)" value={origin} onChange={e => setOrigin(e.target.value)} required />
                    <input placeholder="Destination (e.g. Dallas, TX)" value={destination} onChange={e => setDestination(e.target.value)} required />
                    <select value={loadDriver} onChange={e => setLoadDriver(e.target.value)}>
                      <option value="">Assign Driver...</option>
                      {drivers.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                    <input type="number" placeholder="Rate ($)" value={rate} onChange={e => setRate(e.target.value)} required />
                    <input type="number" placeholder="Miles" value={miles} onChange={e => setMiles(e.target.value)} required />
                    <button type="submit" className="btn-primary">Create Dispatch</button>
                  </form>
                </div>

                <div className="card">
                  <h2>Active Fleet Dispatches & RPM Tracking</h2>
                  <table>
                    <thead>
                      <tr>
                        <th>Load ID</th>
                        <th>Route</th>
                        <th>Driver</th>
                        <th>Miles</th>
                        <th>Rate</th>
                        <th>RPM</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loads.map(load => {
                        const rpm = load.miles > 0 ? load.rate / load.miles : 0;
                        return (
                          <tr key={load.id}>
                            <td><strong>{load.id}</strong></td>
                            <td>{load.origin} → {load.destination}</td>
                            <td>{load.driver}</td>
                            <td>{load.miles} mi</td>
                            <td>{currency(load.rate)}</td>
                            <td><Badge tone={rpm >= 3.0 ? 'green' : 'blue'}>{currency(rpm)}/mi</Badge></td>
                            <td><Badge tone={load.status === 'Delivered' ? 'green' : 'blue'}>{load.status}</Badge></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'board' && (
              <div className="card">
                <h2>Free Integrated Load Board</h2>
                <p>Direct broker loads updated in real-time.</p>
                <table>
                  <thead>
                    <tr>
                      <th>Broker</th>
                      <th>Route</th>
                      <th>Equipment</th>
                      <th>Weight</th>
                      <th>Miles</th>
                      <th>Rate</th>
                      <th>RPM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boardLoads.map(b => (
                      <tr key={b.id}>
                        <td><strong>{b.broker}</strong></td>
                        <td>{b.origin} → {b.destination}</td>
                        <td>{b.equipment}</td>
                        <td>{b.weight}</td>
                        <td>{b.miles} mi</td>
                        <td>{currency(b.rate)}</td>
                        <td><Badge tone="green">{currency(b.rpm)}/mi</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'drivers' && (
              <div className="card">
                <h2>Driver Roster & Performance Analytics</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Driver Name</th>
                      <th>Phone</th>
                      <th>Assigned Truck</th>
                      <th>Pay / Mile</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.map(drv => (
                      <tr key={drv.id}>
                        <td><strong>{drv.name}</strong></td>
                        <td>{drv.phone}</td>
                        <td>{drv.truck}</td>
                        <td>{currency(drv.payPerMile)}/mi</td>
                        <td><Badge tone={drv.status === 'Available' ? 'green' : 'neutral'}>{drv.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'eld-integration' && (
              <div className="dashboard-grid">
                <div className="card">
                  <h2>Connect Your ELD Provider</h2>
                  <p>Link your telematics account via API key or webhook to automate HOS tracking, vehicle diagnostics, and automated location pings.</p>
                  
                  <form onSubmit={handleConnectELD} className="enterprise-inline-form" style={{ marginTop: '16px' }}>
                    <select value={selectedProvider} onChange={e => setSelectedProvider(e.target.value as any)}>
                      <option value="Motive (KeepTruckin)">Motive (KeepTruckin)</option>
                      <option value="Samsara">Samsara</option>
                      <option value="Geotab">Geotab</option>
                      <option value="Garmin eLog">Garmin eLog</option>
                      <option value="Omnitracs">Omnitracs</option>
                    </select>
                    <input 
                      type="password" 
                      placeholder="Enter Provider API Key / Access Token" 
                      value={integrationApiKey} 
                      onChange={e => setIntegrationApiKey(e.target.value)} 
                      required 
                    />
                    <button type="submit" className="btn-primary">Connect ELD</button>
                  </form>
                </div>

                <div className="card">
                  <h2>Active ELD API Connections</h2>
                  <table>
                    <thead>
                      <tr>
                        <th>Provider Partner</th>
                        <th>Connection Status</th>
                        <th>API Key Identifier</th>
                        <th>Active Units Linked</th>
                        <th>Last Synced</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eldIntegrations.map(item => (
                        <tr key={item.id}>
                          <td><strong>{item.provider}</strong></td>
                          <td>
                            <Badge tone={item.status === 'Connected' ? 'green' : 'red'}>
                              {item.status}
                            </Badge>
                          </td>
                          <td><code>{item.apiKey || 'Not Configured'}</code></td>
                          <td>{item.activeUnits} trucks</td>
                          <td>{item.lastSynced}</td>
                          <td>
                            {item.status === 'Connected' ? (
                              <button className="btn-small" style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handleDisconnectELD(item.id)}>Disconnect</button>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '13px' }}>Offline</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'fuel' && (
              <div className="card">
                <h2>Fuel Purchases & IFTA Log</h2>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Driver</th>
                      <th>Truck</th>
                      <th>Gallons</th>
                      <th>Cost</th>
                      <th>State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fuelEntries.map(f => (
                      <tr key={f.id}>
                        <td><strong>{f.id}</strong></td>
                        <td>{f.driverName}</td>
                        <td>{f.truck}</td>
                        <td>{f.gallons} gal</td>
                        <td>{currency(f.cost)}</td>
                        <td><Badge tone="blue">{f.state}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'financials' && (
              <div className="dashboard-grid">
                <div className="card">
                  <h2>Financial P&L Summary</h2>
                  <div className="stats-grid">
                    <StatCard label="Total Revenue" value={currency(totalGross)} icon="💵" tone="green" />
                    <StatCard label="Total Fuel Costs" value={currency(totalFuelCost)} icon="⛽" tone="amber" />
                    <StatCard label="Net Profit" value={currency(netProfit)} icon="💰" tone="green" />
                  </div>
                </div>

                <div className="card">
                  <h2>Manual Rate-Per-Mile (RPM) Calculator</h2>
                  <p>Input custom revenue and mileage values to instantly calculate your loaded and all-miles RPM break-downs.</p>
                  
                  <div className="enterprise-inline-form" style={{ marginTop: '16px' }}>
                    <input 
                      type="number" 
                      placeholder="Total Revenue ($)" 
                      value={calcTotalRevenue} 
                      onChange={e => setCalcTotalRevenue(e.target.value)} 
                    />
                    <input 
                      type="number" 
                      placeholder="Loaded Miles" 
                      value={calcTotalMiles} 
                      onChange={e => setCalcTotalMiles(e.target.value)} 
                    />
                    <input 
                      type="number" 
                      placeholder="Deadhead / Empty Miles" 
                      value={calcDeadheadMiles} 
                      onChange={e => setCalcDeadheadMiles(e.target.value)} 
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '20px' }}>
                    <div style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', border: '1px solid #334155' }}>
                      <div style={{ fontSize: '13px', color: '#94a3b8' }}>Loaded RPM</div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#38bdf8', marginTop: '4px' }}>
                        {currency(manualLoadedRPM)}/mi
                      </div>
                    </div>
                    <div style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', border: '1px solid #334155' }}>
                      <div style={{ fontSize: '13px', color: '#94a3b8' }}>All-Miles RPM (incl. deadhead)</div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4ade80', marginTop: '4px' }}>
                        {currency(manualAllMilesRPM)}/mi
                      </div>
                    </div>
                    <div style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', border: '1px solid #334155' }}>
                      <div style={{ fontSize: '13px', color: '#94a3b8' }}>Total Combined Miles</div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f8fafc', marginTop: '4px' }}>
                        {combinedMiles.toLocaleString()} mi
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tax' && (
              <div className="dashboard-grid">
                <div className="card">
                  <h2>Generate Tax & IFTA Reports</h2>
                  <p>Select your report scope (Monthly or Yearly) and period to calculate mileage totals, fuel tax liabilities, and export statements.</p>
                  
                  <form onSubmit={handleGenerateTaxReport} className="enterprise-inline-form" style={{ marginTop: '16px' }}>
                    <select value={reportType} onChange={e => setReportType(e.target.value as 'monthly' | 'yearly')}>
                      <option value="monthly">Monthly Report</option>
                      <option value="yearly">Yearly Report</option>
                    </select>
                    <input 
                      type="text" 
                      placeholder={reportType === 'monthly' ? 'Period (e.g. 2026-08)' : 'Year (e.g. 2026)'} 
                      value={reportPeriod} 
                      onChange={e => setReportPeriod(e.target.value)} 
                      required 
                    />
                    <button type="submit" className="btn-primary">Generate Report</button>
                  </form>
                </div>

                {generatedReport && (
                  <div className="card" style={{ border: '1px solid #3b82f6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h2>Generated {generatedReport.type} Report ({generatedReport.period})</h2>
                      <Badge tone="green">Ready for Filing</Badge>
                    </div>
                    <div className="stats-grid">
                      <StatCard label="Total Calculated Miles" value={`${generatedReport.totalMiles.toLocaleString()} mi`} icon="🛣️" tone="blue" />
                      <StatCard label="Total Fuel Purchased" value={`${generatedReport.totalGallons.toLocaleString()} gal`} icon="⛽" tone="amber" />
                      <StatCard label="Total Fuel Expenses" value={currency(generatedReport.totalFuelCost)} icon="💵" tone="amber" />
                      <StatCard label="Estimated Net IFTA Tax Due" value={currency(generatedReport.netTaxDue)} icon="📄" tone="green" />
                    </div>
                    <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                      <button className="btn-primary" onClick={() => showToast('Report successfully exported as PDF!')}>Export PDF</button>
                      <button className="btn-secondary" style={{ background: '#334155', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }} onClick={() => showToast('Report exported as CSV!')}>Export CSV</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'invoices' && (
              <div className="dashboard-grid">
                <div className="card">
                  <h2>Create Manual Invoice</h2>
                  <p>Manually enter client details, load reference, and invoice parameters to generate and dispatch new billing records.</p>
                  
                  <form onSubmit={handleCreateInvoice} className="enterprise-inline-form" style={{ marginTop: '16px' }}>
                    <input 
                      type="text" 
                      placeholder="Client Name / Broker (e.g. Swift Logistics)" 
                      value={invClient} 
                      onChange={e => setInvClient(e.target.value)} 
                      required 
                    />
                    <input 
                      type="text" 
                      placeholder="Load ID Reference (e.g. TED-1001)" 
                      value={invLoadId} 
                      onChange={e => setInvLoadId(e.target.value)} 
                    />
                    <input 
                      type="number" 
                      placeholder="Invoice Amount ($)" 
                      value={invAmount} 
                      onChange={e => setInvAmount(e.target.value)} 
                      required 
                    />
                    <input 
                      type="date" 
                      value={invDueDate} 
                      onChange={e => setInvDueDate(e.target.value)} 
                      required 
                    />
                    <button type="submit" className="btn-primary">Generate Invoice</button>
                  </form>
                </div>

                <div className="card">
                  <h2>Generated Invoices Roster</h2>
                  <table>
                    <thead>
                      <tr>
                        <th>Invoice ID</th>
                        <th>Load ID</th>
                        <th>Client</th>
                        <th>Amount</th>
                        <th>Issue Date</th>
                        <th>Due Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map(inv => (
                        <tr key={inv.id}>
                          <td><strong>{inv.id}</strong></td>
                          <td>{inv.loadId}</td>
                          <td>{inv.client}</td>
                          <td>{currency(inv.amount)}</td>
                          <td>{inv.issueDate}</td>
                          <td>{inv.dueDate}</td>
                          <td><Badge tone="blue">{inv.status}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="dashboard-grid">
                <div className="card">
                  <h2>Add Team Member</h2>
                  <p>Invite or register new team members and assign operational permissions.</p>
                  
                  <form onSubmit={handleAddUser} className="enterprise-inline-form" style={{ marginTop: '16px' }}>
                    <input 
                      type="text" 
                      placeholder="Full Name (e.g. John Doe)" 
                      value={userName} 
                      onChange={e => setUserName(e.target.value)} 
                      required 
                    />
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      value={userEmail} 
                      onChange={e => setUserEmail(e.target.value)} 
                      required 
                    />
                    <select value={userRole} onChange={e => setUserRole(e.target.value as Role)}>
                      <option value="Owner">Owner</option>
                      <option value="Admin">Admin</option>
                      <option value="Dispatcher">Dispatcher</option>
                      <option value="Driver">Driver</option>
                    </select>
                    <button type="submit" className="btn-primary">Add Team Member</button>
                  </form>
                </div>

                <div className="card">
                  <h2>Team & Permissions Roster</h2>
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id}>
                          <td><strong>{u.name}</strong></td>
                          <td>{u.email}</td>
                          <td><Badge tone="blue">{u.role}</Badge></td>
                          <td>
                            <Badge tone={u.status === 'Active' ? 'green' : 'neutral'}>
                              {u.status}
                            </Badge>
                          </td>
                          <td style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              className="btn-small" 
                              style={{ background: '#334155', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }} 
                              onClick={() => handleToggleUserStatus(u.id)}
                            >
                              {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button 
                              className="btn-small" 
                              style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }} 
                              onClick={() => handleRemoveUser(u.id)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="card">
                <h2>Subscription & Billing</h2>
                <p>Current Plan: <strong>{subscription.plan}</strong> ({currency(subscription.monthlyPrice)}/mo)</p>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="card">
                <h2>Enterprise Administration & Security Settings</h2>
                <p style={{ color: '#94a3b8', marginBottom: '20px' }}>
                  Manage global company profiles, security policies, webhook integrations, compliance retention, and audit logs.
                </p>

                {/* Sub-Navigation for Settings */}
                <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #334155', paddingBottom: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'general', label: '🏢 General & Profile' },
                    { id: 'security', label: '🔒 Security & Access' },
                    { id: 'integrations', label: '🔗 Webhooks & API' },
                    { id: 'compliance', label: '📋 Compliance & Retention' },
                    { id: 'audit', label: '📜 Enterprise Audit Logs' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setSettingsSubTab(tab.id as any)}
                      style={{
                        background: settingsSubTab === tab.id ? '#2563eb' : '#1e293b',
                        color: '#fff',
                        border: '1px solid #334155',
                        padding: '8px 14px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500',
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {settingsSubTab === 'general' && (
                  <form onSubmit={handleSaveOrgSettings} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Company Legal Name</label>
                        <input 
                          type="text" 
                          value={organization.name} 
                          onChange={e => setOrganization({ ...organization, name: e.target.value })} 
                          style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>MC Number</label>
                        <input 
                          type="text" 
                          value={organization.mcNumber} 
                          onChange={e => setOrganization({ ...organization, mcNumber: e.target.value })} 
                          style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>US DOT Number</label>
                        <input 
                          type="text" 
                          value={organization.dotNumber} 
                          onChange={e => setOrganization({ ...organization, dotNumber: e.target.value })} 
                          style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Federal Tax ID (EIN)</label>
                        <input 
                          type="text" 
                          value={organization.taxId} 
                          onChange={e => setOrganization({ ...organization, taxId: e.target.value })} 
                          style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Primary Phone</label>
                        <input 
                          type="text" 
                          value={organization.phone} 
                          onChange={e => setOrganization({ ...organization, phone: e.target.value })} 
                          style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Billing Contact Email</label>
                        <input 
                          type="email" 
                          value={organization.email} 
                          onChange={e => setOrganization({ ...organization, email: e.target.value })} 
                          style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Headquarters Address</label>
                      <input 
                        type="text" 
                        value={organization.address} 
                        onChange={e => setOrganization({ ...organization, address: e.target.value })} 
                        style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                      <button type="submit" className="btn-primary">Save General Settings</button>
                    </div>
                  </form>
                )}

                {settingsSubTab === 'security' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>Enforce Two-Factor Authentication (2FA)</strong>
                        <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>Require all team members and drivers to authenticate via TOTP or SMS.</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={organization.twoFactorRequired} 
                        onChange={e => {
                          setOrganization({ ...organization, twoFactorRequired: e.target.checked });
                          showToast('Security policy updated.');
                        }}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                      />
                    </div>

                    <div style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>Automatic Load Dispatch Rules</strong>
                        <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>Allow automated AI matching for freight dispatches based on driver proximity.</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={organization.autoDispatch} 
                        onChange={e => {
                          setOrganization({ ...organization, autoDispatch: e.target.checked });
                          showToast('Dispatch policy updated.');
                        }}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                      />
                    </div>

                    <div style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', border: '1px solid #334155' }}>
                      <strong>Single Sign-On (SSO / SAML 2.0)</strong>
                      <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 12px 0' }}>Integrate enterprise identity providers such as Okta, Azure AD, or Google Workspace.</p>
                      <button className="btn-secondary" style={{ background: '#334155', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }} onClick={() => showToast('SSO Configuration metadata generated.')}>Configure SAML SSO</button>
                    </div>
                  </div>
                )}

                {settingsSubTab === 'integrations' && (
                  <form onSubmit={e => { e.preventDefault(); showToast('Webhook configurations saved.'); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Global Enterprise Webhook Payload URL</label>
                      <input 
                        type="url" 
                        value={organization.webhookUrl} 
                        onChange={e => setOrganization({ ...organization, webhookUrl: e.target.value })} 
                        style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }}
                      />
                    </div>
                    <div style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', border: '1px solid #334155' }}>
                      <strong>API Access Tokens & Rate Limits</strong>
                      <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 12px 0' }}>Your current enterprise tier allows up to 10,000 API requests per hour.</p>
                      <button type="button" className="btn-primary" onClick={() => showToast('New API Secret Token generated successfully.')}>Generate New API Secret</button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button type="submit" className="btn-primary">Save Webhook Settings</button>
                    </div>
                  </form>
                )}

                {settingsSubTab === 'compliance' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>FMCSA / DOT Data Retention Period (Months)</label>
                      <select 
                        value={organization.dataRetentionMonths} 
                        onChange={e => {
                          setOrganization({ ...organization, dataRetentionMonths: parseInt(e.target.value) });
                          showToast('Data retention policy updated.');
                        }}
                        style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }}
                      >
                        <option value={12}>12 Months (Standard)</option>
                        <option value={36}>36 Months (Recommended for IFTA/DOT)</option>
                        <option value={60}>60 Months (Extended Enterprise)</option>
                      </select>
                    </div>
                    <div style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', border: '1px solid #334155' }}>
                      <strong>Automated IFTA Archival & Backup</strong>
                      <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 12px 0' }}>All state-by-state fuel tax receipts and GPS pings are cryptographically hashed and backed up daily.</p>
                      <button className="btn-primary" onClick={() => showToast('Full compliance archive downloaded as encrypted ZIP.')}>Download Compliance Archive</button>
                    </div>
                  </div>
                )}

                {settingsSubTab === 'audit' && (
                  <div>
                    <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>Complete cryptographic ledger of all user actions, security modifications, and dispatches.</p>
                    <table>
                      <thead>
                        <tr>
                          <th>Timestamp</th>
                          <th>User</th>
                          <th>Action Performed</th>
                          <th>IP Address</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>2026-08-01 17:42:01</td>
                          <td>Sarah Admin (Owner)</td>
                          <td>Updated Enterprise Security Policy (2FA)</td>
                          <td>192.168.1.45</td>
                          <td><Badge tone="green">Success</Badge></td>
                        </tr>
                        <tr>
                          <td>2026-08-01 14:10:18</td>
                          <td>Michael Dispatch</td>
                          <td>Created Dispatch Load TED-1001</td>
                          <td>192.168.1.88</td>
                          <td><Badge tone="green">Success</Badge></td>
                        </tr>
                        <tr>
                          <td>2026-07-31 09:15:33</td>
                          <td>Sarah Admin (Owner)</td>
                          <td>Connected Samsara ELD Webhook</td>
                          <td>192.168.1.45</td>
                          <td><Badge tone="green">Success</Badge></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
      {toast && <div className="enterprise-toast">{toast}</div>}
    </div>
  );
}