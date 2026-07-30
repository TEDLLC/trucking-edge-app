import React, { useState, useEffect, useRef } from 'react';
import './App.css';

import LoginPage from './LoginPage';
import McSearchWidget from './McSearchWidget';

import InsuranceCalculator from './InsuranceCalculator';
import IftaAndDocuments from './IftaAndDocuments';
import EldComparison from './EldComparison';

// --- LEAFLET TYPING OVERRIDE ---
declare global {
  interface Window {
    L: any;
  }
}

// --- INTERFACES ---
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
  brokerName?: string;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  truck: string;
  payPerMile: number;
  status: 'Available' | 'On Route' | 'Off Duty';
  drivingHoursLeft?: number;
  shiftHoursLeft?: number;
  cycleHoursLeft?: number;
}

interface FuelEntry {
  id: string;
  driverName: string;
  truck: string;
  gallons: number;
  cost: number;
  location: string;
  date: string;
}

interface ELDRecord {
  driverId: string;
  driverName: string;
  status: 'Driving' | 'On Duty' | 'Sleeper' | 'Off Duty';
  driveTimeRemaining: number; 
  dutyTimeRemaining: number;  
  cycleRemaining: number;     
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Dispatcher' | 'Driver';
  status: 'Active' | 'Inactive';
}

interface FuelStation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  dieselPrice: number;
  distanceMiles: number;
}

interface Invoice {
  id: string;
  carrierName: string;
  loadReference: string;
  loadRate: number;
  feePercentage: number;
  invoiceAmount: number;
  status: 'Unpaid' | 'Paid';
  created_at: string;
}

interface CustomerClient {
  id: string;
  companyName: string;
  contactName: string;
  mcNumber: string;
  phone: string;
  email: string;
  dispatchFeePercent: number;
  needsMcLease: boolean;
  mcLeaseFeePercent: number;
  status: 'Active' | 'Pending Verification';
  created_at: string;
}

// --- DEFAULT DATA ---
const DEFAULT_LOADS: Load[] = [
  { id: 'TED-1001', origin: 'Chicago, IL', destination: 'Dallas, TX', driver: 'Marcus Vance', rate: 2400, miles: 925, fuelCost: 450, status: 'In Transit', date: '2026-07-15', brokerName: 'TQL Logistics' },
  { id: 'TED-1002', origin: 'Atlanta, GA', destination: 'Miami, FL', driver: 'Sarah Jenkins', rate: 1850, miles: 660, fuelCost: 310, status: 'Delivered', date: '2026-07-18', brokerName: 'CH Robinson' },
  { id: 'TED-1003', origin: 'Seattle, WA', destination: 'Denver, CO', driver: 'Unassigned', rate: 3100, miles: 1300, fuelCost: 620, status: 'Pending', date: '2026-07-20', brokerName: 'Landstar' },
];

const DEFAULT_DRIVERS: Driver[] = [
  { id: 'DRV-101', name: 'Marcus Vance', phone: '(555) 234-5678', truck: 'Truck #402', payPerMile: 0.65, status: 'On Route', drivingHoursLeft: 8.5, shiftHoursLeft: 11.0, cycleHoursLeft: 45.0 },
  { id: 'DRV-102', name: 'Sarah Jenkins', phone: '(555) 876-5432', truck: 'Truck #108', payPerMile: 0.60, status: 'Available', drivingHoursLeft: 11.0, shiftHoursLeft: 14.0, cycleHoursLeft: 60.0 },
  { id: 'DRV-103', name: 'David Miller', phone: '(555) 345-6789', truck: 'Truck #205', payPerMile: 0.58, status: 'Off Duty', drivingHoursLeft: 11.0, shiftHoursLeft: 14.0, cycleHoursLeft: 52.0 },
];

const DEFAULT_FUEL: FuelEntry[] = [
  { id: 'FL-501', driverName: 'Marcus Vance', truck: 'Truck #402', gallons: 120, cost: 450, location: 'Love\'s #310 - St. Louis, MO', date: '2026-07-16' },
  { id: 'FL-502', driverName: 'Sarah Jenkins', truck: 'Truck #108', gallons: 85, cost: 310, location: 'Pilot #142 - Macon, GA', date: '2026-07-18' },
];

const DEFAULT_ELD: ELDRecord[] = [
  { driverId: 'DRV-101', driverName: 'Marcus Vance', status: 'Driving', driveTimeRemaining: 8.5, dutyTimeRemaining: 11.0, cycleRemaining: 45.0 },
  { driverId: 'DRV-102', driverName: 'Sarah Jenkins', status: 'Off Duty', driveTimeRemaining: 11.0, dutyTimeRemaining: 14.0, cycleRemaining: 60.0 },
  { driverId: 'DRV-103', driverName: 'David Miller', status: 'Sleeper', driveTimeRemaining: 11.0, dutyTimeRemaining: 14.0, cycleRemaining: 52.0 },
];

const DEFAULT_USERS: User[] = [
  { id: 'USR-01', name: 'John Dispatcher', email: 'john@truckingedgedispatchers.com', role: 'Dispatcher', status: 'Active' },
  { id: 'USR-02', name: 'Sarah Admin', email: 'sarah@truckingedgedispatchers.com', role: 'Admin', status: 'Active' },
  { id: 'USR-03', name: 'Marcus Vance', email: 'marcus@truckingedgedispatchers.com', role: 'Driver', status: 'Active' },
];

const DEFAULT_INVOICES: Invoice[] = [
  { id: 'INV-3001', carrierName: 'TQL Logistics', loadReference: 'TED-1001', loadRate: 2400, feePercentage: 7, invoiceAmount: 168, status: 'Unpaid', created_at: '2026-07-15' },
  { id: 'INV-3002', carrierName: 'CH Robinson', loadReference: 'TED-1002', loadRate: 1850, feePercentage: 7, invoiceAmount: 129.5, status: 'Paid', created_at: '2026-07-18' },
];

const DEFAULT_CUSTOMERS: CustomerClient[] = [
  { id: 'CUST-501', companyName: 'Apex Transport LLC', contactName: 'Dmitri Petrov', mcNumber: 'MC-883921', phone: '(555) 432-8765', email: 'dispatch@apextransport.com', dispatchFeePercent: 7, needsMcLease: false, mcLeaseFeePercent: 0, status: 'Active', created_at: '2026-06-10' },
  { id: 'CUST-502', companyName: 'Lone Star Freight Inc', contactName: 'Jessica Taylor', mcNumber: 'MC-992104', phone: '(555) 789-1234', email: 'jessica@lonestarfreight.net', dispatchFeePercent: 7, needsMcLease: true, mcLeaseFeePercent: 20, status: 'Active', created_at: '2026-07-01' },
];

const HUB_WEATHER_DATA: Record<string, { temp: string; condition: string; wind: string }> = {
  'Chicago Hub': { temp: '78°F', condition: 'Clear Roads', wind: '8 mph NW' },
  'Dallas Hub': { temp: '92°F', condition: 'Sunny & Dry', wind: '6 mph S' },
  'Atlanta Hub': { temp: '86°F', condition: 'Partly Cloudy', wind: '9 mph E' },
  'Seattle Hub': { temp: '68°F', condition: 'Light Mist', wind: '11 mph W' }
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'dashboard' | 'loads' | 'drivers' | 'eld' | 'fuel' | 'financials' | 'tax' | 'users' | 'customers'>('dashboard');

  const [selectedTimeZone, setSelectedTimeZone] = useState<string>('America/Chicago');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [selectedWeatherHub, setSelectedWeatherHub] = useState<string>('Chicago Hub');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { timeZone: selectedTimeZone, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, [selectedTimeZone]);

  const [loads, setLoads] = useState<Load[]>(() => JSON.parse(localStorage.getItem('ted_loads') || 'null') || DEFAULT_LOADS);
  const [drivers, setDrivers] = useState<Driver[]>(() => JSON.parse(localStorage.getItem('ted_drivers') || 'null') || DEFAULT_DRIVERS);
  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>(() => JSON.parse(localStorage.getItem('ted_fuel') || 'null') || DEFAULT_FUEL);
  const [eldRecords, setEldRecords] = useState<ELDRecord[]>(() => JSON.parse(localStorage.getItem('ted_eld') || 'null') || DEFAULT_ELD);
  const [users, setUsers] = useState<User[]>(() => JSON.parse(localStorage.getItem('ted_users') || 'null') || DEFAULT_USERS);
  const [invoices, setInvoices] = useState<Invoice[]>(() => JSON.parse(localStorage.getItem('ted_invoices') || 'null') || DEFAULT_INVOICES);
  const [customers, setCustomers] = useState<CustomerClient[]>(() => JSON.parse(localStorage.getItem('ted_customers') || 'null') || DEFAULT_CUSTOMERS);

  useEffect(() => localStorage.setItem('ted_loads', JSON.stringify(loads)), [loads]);
  useEffect(() => localStorage.setItem('ted_drivers', JSON.stringify(drivers)), [drivers]);
  useEffect(() => localStorage.setItem('ted_fuel', JSON.stringify(fuelEntries)), [fuelEntries]);
  useEffect(() => localStorage.setItem('ted_eld', JSON.stringify(eldRecords)), [eldRecords]);
  useEffect(() => localStorage.setItem('ted_users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('ted_invoices', JSON.stringify(invoices)), [invoices]);
  useEffect(() => localStorage.setItem('ted_customers', JSON.stringify(customers)), [customers]);

  const [loadSearch] = useState<string>('');
  const [statusFilter] = useState<string>('All');

  // New load form state
  const [newOrigin, setNewOrigin] = useState('');
  const [newDestination, setNewDestination] = useState('');
  const [newDriver, setNewDriver] = useState('Unassigned');
  const [newRate, setNewRate] = useState('');
  const [newMiles, setNewMiles] = useState('');
  const [newBroker, setNewBroker] = useState('');

  const [maintenanceCost] = useState('1200');
  const [fixedOverhead] = useState('2500');

  const mapRef = useRef<any>(null);
  const [mapCenter] = useState({ lat: 41.8781, lng: -87.6298 });
  const [nearbyStations] = useState<FuelStation[]>([
    { id: 'ST-01', name: "Love's Travel Stop #410", lat: 41.8900, lng: -87.6500, address: "I-90 Exit 12, Chicago, IL", dieselPrice: 3.79, distanceMiles: 2.4 },
    { id: 'ST-02', name: "Pilot Travel Center #112", lat: 41.8600, lng: -87.6100, address: "US-41 South, Chicago, IL", dieselPrice: 3.84, distanceMiles: 4.1 },
    { id: 'ST-03', name: "TA Petro Stopping Center", lat: 41.9200, lng: -87.6800, address: "I-294 Exit 4, Cicero, IL", dieselPrice: 3.75, distanceMiles: 7.8 },
  ]);

  useEffect(() => {
    if (activeTab === 'fuel' && isAuthenticated) {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      const initMap = () => {
        if (!window.L) return;
        const container = document.getElementById('fuel-map-container');
        if (!container) return;

        if (mapRef.current) mapRef.current.remove();

        const map = window.L.map('fuel-map-container').setView([mapCenter.lat, mapCenter.lng], 11);
        mapRef.current = map;

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        nearbyStations.forEach(st => {
          const marker = window.L.marker([st.lat, st.lng]).addTo(map);
          marker.bindPopup(`
            <div style="font-family: inherit; font-size: 13px; color: #1e293b;">
              <strong style="font-size: 14px; color: #d97706;">${st.name}</strong><br/>
              <span>${st.address}</span><br/>
              <strong style="color: #16a34a;">Diesel: $${st.dieselPrice.toFixed(2)}/gal</strong><br/>
              <small>${st.distanceMiles} miles away</small>
            </div>
          `);
        });
      };

      if (!window.L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        script.onload = initMap;
        document.body.appendChild(script);
      } else {
        setTimeout(initMap, 100);
      }
    }
  }, [activeTab, mapCenter, nearbyStations, isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail.trim() && loginPassword.trim()) {
      setIsGuest(false);
      setIsAuthenticated(true);
    } else {
      alert('Please enter valid credentials.');
    }
  };

  const handleGuestLogin = () => {
    setIsGuest(true);
    setIsAuthenticated(true);
    setActiveTab('dashboard');
  };

  const currentWeatherObj = HUB_WEATHER_DATA[selectedWeatherHub] || HUB_WEATHER_DATA['Chicago Hub'];

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#090d16', color: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <div style={{ background: '#111827', padding: '40px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', width: '100%', maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.025em', margin: '0 0 8px 0' }}>🚛 TRUCKING EDGE</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>Secure Enterprise Dispatch Login</p>
          </div>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1' }}>Email Address</label>
              <input 
                type="email" 
                value={loginEmail} 
                onChange={(e) => setLoginEmail(e.target.value)} 
                placeholder="dispatcher@truckingedge.com" 
                required 
                style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #374151', background: '#1f2937', color: '#fff', fontSize: '0.875rem', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1' }}>Password</label>
              <input 
                type="password" 
                value={loginPassword} 
                onChange={(e) => setLoginPassword(e.target.value)} 
                placeholder="••••••••" 
                required 
                style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #374151', background: '#1f2937', color: '#fff', fontSize: '0.875rem', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>
            <button type="submit" style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '11px', borderRadius: '6px', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer', marginBottom: '12px', transition: 'background 0.2s' }}>
              Sign In to Dashboard
            </button>
          </form>
          <button 
            type="button" 
            onClick={handleGuestLogin}
            style={{ width: '100%', background: '#374151', color: '#fff', border: 'none', padding: '11px', borderRadius: '6px', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer' }}
          >
            Continue as Guest
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: '#090d16', color: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', overflow: 'hidden', boxSizing: 'border-box' }}>
      
      {/* 1. Left Sidebar Navigation */}
      <aside style={{ width: '260px', flexShrink: 0, height: '100vh', background: '#111827', color: '#f8fafc', padding: '24px 16px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div>
          <div style={{ padding: '0 8px 16px 8px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', letterSpacing: '-0.025em', margin: 0 }}>TRUCKING EDGE</h2>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '4px 0 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{isGuest ? 'Guest Portal' : 'Enterprise TMS'}</p>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 0 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { id: 'dashboard', label: 'Portal Hub & Tools', icon: '📊' },
              ...(isGuest ? [{ id: 'customers', label: 'Customer & MC Lease', icon: '🤝' }] : []),
              ...(!isGuest ? [
                { id: 'loads', label: 'Dispatch & RPM', icon: '📋' },
                { id: 'drivers', label: 'Driver Roster & HOS', icon: '👨‍✈️' },
                { id: 'eld', label: 'ELD / HOS Logs', icon: '📟' },
                { id: 'fuel', label: 'Fuel Map & Logs', icon: '⛽' },
                { id: 'financials', label: 'Profit & Loss / Invoices', icon: '💰' },
                { id: 'tax', label: 'Admin Tax & IFTA', icon: '🏛️' },
                { id: 'users', label: 'Fleet Access Roles', icon: '👥' },
              ] : [])
            ].map(item => (
              <li 
                key={item.id}
                style={{ 
                  padding: '10px 12px', 
                  cursor: 'pointer', 
                  background: activeTab === item.id ? '#2563eb' : 'transparent', 
                  color: activeTab === item.id ? '#fff' : '#cbd5e1',
                  borderRadius: '6px', 
                  fontSize: '0.875rem',
                  fontWeight: activeTab === item.id ? '600' : '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'background 0.15s, color 0.15s'
                }} 
                onClick={() => setActiveTab(item.id as any)}
              >
                <span>{item.icon}</span> {item.label}
              </li>
            ))}
          </ul>
        </div>
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px' }}>
          <button onClick={() => { setIsAuthenticated(false); setIsGuest(false); }} style={{ background: '#ef4444', color: '#fff', border: 'none', width: '100%', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem', transition: 'background 0.2s' }}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Right Side App Wrapper (Header + Main Content) */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto', minWidth: 0, background: '#090d16' }}>
        
        {/* 2. Top Header Bar */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111827', padding: '16px 32px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', flexWrap: 'wrap', gap: '16px', position: 'sticky', top: 0, zIndex: 10 }}>
          <h1 style={{ color: '#f8fafc', fontSize: '1.15rem', fontWeight: '600', margin: 0 }}>
            Carrier Portal & Tools Hub
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {/* Timezone & Clock */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#1f2937', padding: '6px 12px', borderRadius: '6px', border: '1px solid #374151' }}>
              <div>
                <label style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', marginBottom: '2px', textTransform: 'uppercase', fontWeight: '600' }}>Time Zone</label>
                <select 
                  value={selectedTimeZone} 
                  onChange={(e) => setSelectedTimeZone(e.target.value)}
                  style={{ background: '#111827', color: '#fff', border: '1px solid #374151', padding: '3px 6px', borderRadius: '4px', fontSize: '0.75rem', outline: 'none' }}
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="UTC">UTC / Zulu</option>
                </select>
              </div>
              <div style={{ borderLeft: '1px solid #374151', paddingLeft: '12px' }}>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Local Time</span>
                <strong style={{ fontSize: '0.9rem', color: '#38bdf8', fontFamily: 'monospace', fontWeight: '600' }}>{currentTime}</strong>
              </div>
            </div>

            {/* Weather Widget */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#1f2937', padding: '6px 12px', borderRadius: '6px', border: '1px solid #374151' }}>
              <span style={{ fontSize: '1.1rem' }}>🌤️</span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <select 
                    value={selectedWeatherHub} 
                    onChange={(e) => setSelectedWeatherHub(e.target.value)}
                    style={{ background: '#111827', color: '#fff', border: '1px solid #374151', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', outline: 'none' }}
                  >
                    {Object.keys(HUB_WEATHER_DATA).map(hub => (
                      <option key={hub} value={hub}>{hub}</option>
                    ))}
                  </select>
                  <strong style={{ fontSize: '0.8rem', color: '#38bdf8' }}>{currentWeatherObj.temp}</strong>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#4ade80', marginTop: '2px', fontWeight: '500' }}>
                  {currentWeatherObj.condition} • {currentWeatherObj.wind}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* 3. Main Body Content Area */}
        <main style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', boxSizing: 'border-box', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
          
          {/* TAB CONTENT IMPLEMENTATIONS */}
          {activeTab === 'dashboard' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              <div style={{ background: '#111827', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 16px 0', color: '#f8fafc' }}>Quick Tools Navigation</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                 <McSearchWidget 
  onImportLoad={(newLoad) => {
    setLoads((prev: any[]) => [
      { ...newLoad, status: 'Dispatched', assignedDriver: 'Unassigned' },
      ...prev
    ]);
  }} /> 



                  <InsuranceCalculator />
                </div>
              </div>
              <div style={{ background: '#111827', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 16px 0', color: '#f8fafc' }}>Compliance & ELD Resources</h3>
                <EldComparison />
              </div>
            </div>
          )}

          {activeTab === 'loads' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ background: '#111827', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 16px 0', color: '#f8fafc' }}>Add New Load / Dispatch</h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!newOrigin || !newDestination || !newRate || !newMiles) return;
                  const newLoadItem: Load = {
                    id: `TED-${Math.floor(1000 + Math.random() * 9000)}`,
                    origin: newOrigin,
                    destination: newDestination,
                    driver: newDriver,
                    rate: parseFloat(newRate),
                    miles: parseFloat(newMiles),
                    fuelCost: Math.round(parseFloat(newMiles) * 0.45),
                    status: 'Pending',
                    date: new Date().toISOString().split('T')[0],
                    brokerName: newBroker || 'Direct Shipper'
                  };
                  setLoads([newLoadItem, ...loads]);
                  setNewOrigin('');
                  setNewDestination('');
                  setNewRate('');
                  setNewMiles('');
                  setNewBroker('');
                }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <input type="text" placeholder="Origin (City, ST)" value={newOrigin} onChange={e => setNewOrigin(e.target.value)} required style={{ background: '#1f2937', border: '1px solid #374151', padding: '10px', borderRadius: '6px', color: '#fff' }} />
                  <input type="text" placeholder="Destination (City, ST)" value={newDestination} onChange={e => setNewDestination(e.target.value)} required style={{ background: '#1f2937', border: '1px solid #374151', padding: '10px', borderRadius: '6px', color: '#fff' }} />
                  <input type="number" placeholder="Rate ($)" value={newRate} onChange={e => setNewRate(e.target.value)} required style={{ background: '#1f2937', border: '1px solid #374151', padding: '10px', borderRadius: '6px', color: '#fff' }} />
                  <input type="number" placeholder="Miles" value={newMiles} onChange={e => setNewMiles(e.target.value)} required style={{ background: '#1f2937', border: '1px solid #374151', padding: '10px', borderRadius: '6px', color: '#fff' }} />
                  <input type="text" placeholder="Broker / Shipper Name" value={newBroker} onChange={e => setNewBroker(e.target.value)} style={{ background: '#1f2937', border: '1px solid #374151', padding: '10px', borderRadius: '6px', color: '#fff' }} />
                  <select value={newDriver} onChange={e => setNewDriver(e.target.value)} style={{ background: '#1f2937', border: '1px solid #374151', padding: '10px', borderRadius: '6px', color: '#fff' }}>
                    <option value="Unassigned">Unassigned</option>
                    {drivers.map(d => <option key={d.id} value={d.name}>{d.name} ({d.truck})</option>)}
                  </select>
                  <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Create Load</button>
                </form>
              </div>

              <div style={{ background: '#111827', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 16px 0', color: '#f8fafc' }}>Active Loads & RPM Tracker</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #374151', color: '#94a3b8' }}>
                        <th style={{ padding: '10px' }}>Load ID</th>
                        <th style={{ padding: '10px' }}>Broker / Shipper</th>
                        <th style={{ padding: '10px' }}>Origin → Destination</th>
                        <th style={{ padding: '10px' }}>Driver</th>
                        <th style={{ padding: '10px' }}>Rate / Miles</th>
                        <th style={{ padding: '10px' }}>RPM</th>
                        <th style={{ padding: '10px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loads.filter(l => loadSearch === '' || l.id.toLowerCase().includes(loadSearch.toLowerCase())).map(load => {
                        const rpm = (load.rate / (load.miles || 1)).toFixed(2);
                        return (
                          <tr key={load.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '12px 10px', fontWeight: '600', color: '#38bdf8' }}>{load.id}</td>
                            <td style={{ padding: '12px 10px' }}>{load.brokerName || 'Direct'}</td>
                            <td style={{ padding: '12px 10px' }}>{load.origin} → {load.destination}</td>
                            <td style={{ padding: '12px 10px' }}>{load.driver}</td>
                            <td style={{ padding: '12px 10px' }}>${load.rate} / {load.miles}mi</td>
                            <td style={{ padding: '12px 10px', color: Number(rpm) >= 2.5 ? '#4ade80' : '#facc15' }}>${rpm}/mi</td>
                            <td style={{ padding: '12px 10px' }}>
                              <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', background: load.status === 'Delivered' ? 'rgba(74, 222, 128, 0.15)' : load.status === 'In Transit' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(234, 179, 8, 0.15)', color: load.status === 'Delivered' ? '#4ade80' : load.status === 'In Transit' ? '#38bdf8' : '#facc15' }}>
                                {load.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'drivers' && (
            <div style={{ background: '#111827', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 16px 0', color: '#f8fafc' }}>Driver Roster & Hours of Service (HOS)</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #374151', color: '#94a3b8' }}>
                      <th style={{ padding: '10px' }}>Driver Name</th>
                      <th style={{ padding: '10px' }}>Phone</th>
                      <th style={{ padding: '10px' }}>Assigned Truck</th>
                      <th style={{ padding: '10px' }}>Pay Rate</th>
                      <th style={{ padding: '10px' }}>Status</th>
                      <th style={{ padding: '10px' }}>Drive Time Left</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.map(drv => (
                      <tr key={drv.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px 10px', fontWeight: '600', color: '#fff' }}>{drv.name}</td>
                        <td style={{ padding: '12px 10px', color: '#94a3b8' }}>{drv.phone}</td>
                        <td style={{ padding: '12px 10px' }}>{drv.truck}</td>
                        <td style={{ padding: '12px 10px' }}>${drv.payPerMile}/mi</td>
                        <td style={{ padding: '12px 10px' }}>
                          <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', background: drv.status === 'Available' ? 'rgba(74, 222, 128, 0.15)' : drv.status === 'On Route' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(148, 163, 184, 0.15)', color: drv.status === 'Available' ? '#4ade80' : drv.status === 'On Route' ? '#38bdf8' : '#94a3b8' }}>
                            {drv.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 10px', fontFamily: 'monospace', color: '#38bdf8' }}>{drv.drivingHoursLeft} hrs</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'eld' && (
            <div style={{ background: '#111827', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 16px 0', color: '#f8fafc' }}>ELD & Compliance Logs</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #374151', color: '#94a3b8' }}>
                      <th style={{ padding: '10px' }}>Driver</th>
                      <th style={{ padding: '10px' }}>Current Duty Status</th>
                      <th style={{ padding: '10px' }}>Drive Time Rem.</th>
                      <th style={{ padding: '10px' }}>Shift Time Rem.</th>
                      <th style={{ padding: '10px' }}>Cycle Rem. (70hr)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eldRecords.map(rec => (
                      <tr key={rec.driverId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px 10px', fontWeight: '600' }}>{rec.driverName}</td>
                        <td style={{ padding: '12px 10px' }}>
                          <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', background: rec.status === 'Driving' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(234, 179, 8, 0.15)', color: rec.status === 'Driving' ? '#38bdf8' : '#facc15' }}>
                            {rec.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 10px', fontFamily: 'monospace' }}>{rec.driveTimeRemaining} hrs</td>
                        <td style={{ padding: '12px 10px', fontFamily: 'monospace' }}>{rec.dutyTimeRemaining} hrs</td>
                        <td style={{ padding: '12px 10px', fontFamily: 'monospace' }}>{rec.cycleRemaining} hrs</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'fuel' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ background: '#111827', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 16px 0', color: '#f8fafc' }}>Live Fuel Finder & Map</h3>
                <div id="fuel-map-container" style={{ width: '100%', height: '350px', borderRadius: '8px', zIndex: 1, border: '1px solid #374151' }}></div>
              </div>
              <div style={{ background: '#111827', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 16px 0', color: '#f8fafc' }}>Fuel Purchase Logs</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #374151', color: '#94a3b8' }}>
                      <th style={{ padding: '10px' }}>Entry ID</th>
                      <th style={{ padding: '10px' }}>Driver / Truck</th>
                      <th style={{ padding: '10px' }}>Gallons</th>
                      <th style={{ padding: '10px' }}>Total Cost</th>
                      <th style={{ padding: '10px' }}>Location</th>
                      <th style={{ padding: '10px' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fuelEntries.map(f => (
                      <tr key={f.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px 10px', fontWeight: '600', color: '#38bdf8' }}>{f.id}</td>
                        <td style={{ padding: '12px 10px' }}>{f.driverName} ({f.truck})</td>
                        <td style={{ padding: '12px 10px' }}>{f.gallons} gal</td>
                        <td style={{ padding: '12px 10px', color: '#4ade80' }}>${f.cost}</td>
                        <td style={{ padding: '12px 10px' }}>{f.location}</td>
                        <td style={{ padding: '12px 10px', color: '#94a3b8' }}>{f.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'financials' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div style={{ background: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '600' }}>Gross Revenue</span>
                  <h3 style={{ fontSize: '1.5rem', margin: '8px 0 0 0', color: '#4ade80' }}>
                    ${loads.reduce((acc, l) => acc + l.rate, 0).toLocaleString()}
                  </h3>
                </div>
                <div style={{ background: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '600' }}>Fuel Expenses</span>
                  <h3 style={{ fontSize: '1.5rem', margin: '8px 0 0 0', color: '#f87171' }}>
                    ${fuelEntries.reduce((acc, f) => acc + f.cost, 0).toLocaleString()}
                  </h3>
                </div>
                <div style={{ background: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '600' }}>Fixed Overheads</span>
                  <h3 style={{ fontSize: '1.5rem', margin: '8px 0 0 0', color: '#facc15' }}>
                    ${Number(fixedOverhead) + Number(maintenanceCost)}
                  </h3>
                </div>
              </div>

              <div style={{ background: '#111827', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 16px 0', color: '#f8fafc' }}>Invoices & Dispatch Fees</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #374151', color: '#94a3b8' }}>
                      <th style={{ padding: '10px' }}>Invoice ID</th>
                      <th style={{ padding: '10px' }}>Carrier / Broker</th>
                      <th style={{ padding: '10px' }}>Load Ref</th>
                      <th style={{ padding: '10px' }}>Load Rate</th>
                      <th style={{ padding: '10px' }}>Fee %</th>
                      <th style={{ padding: '10px' }}>Invoice Amount</th>
                      <th style={{ padding: '10px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(inv => (
                      <tr key={inv.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px 10px', fontWeight: '600', color: '#38bdf8' }}>{inv.id}</td>
                        <td style={{ padding: '12px 10px' }}>{inv.carrierName}</td>
                        <td style={{ padding: '12px 10px' }}>{inv.loadReference}</td>
                        <td style={{ padding: '12px 10px' }}>${inv.loadRate}</td>
                        <td style={{ padding: '12px 10px' }}>{inv.feePercentage}%</td>
                        <td style={{ padding: '12px 10px', color: '#4ade80', fontWeight: '600' }}>${inv.invoiceAmount}</td>
                        <td style={{ padding: '12px 10px' }}>
                          <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', background: inv.status === 'Paid' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(234, 179, 8, 0.15)', color: inv.status === 'Paid' ? '#4ade80' : '#facc15' }}>
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'tax' && <IftaAndDocuments />}

          {activeTab === 'users' && (
            <div style={{ background: '#111827', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 16px 0', color: '#f8fafc' }}>Fleet Access Roles & Permissions</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #374151', color: '#94a3b8' }}>
                    <th style={{ padding: '10px' }}>User Name</th>
                    <th style={{ padding: '10px' }}>Email</th>
                    <th style={{ padding: '10px' }}>Role</th>
                    <th style={{ padding: '10px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px 10px', fontWeight: '600' }}>{u.name}</td>
                      <td style={{ padding: '12px 10px', color: '#94a3b8' }}>{u.email}</td>
                      <td style={{ padding: '12px 10px', color: '#38bdf8' }}>{u.role}</td>
                      <td style={{ padding: '12px 10px' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80' }}>
                          {u.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'customers' && (
            <div style={{ background: '#111827', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 16px 0', color: '#f8fafc' }}>Customer & MC Lease Management</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #374151', color: '#94a3b8' }}>
                    <th style={{ padding: '10px' }}>Company Name</th>
                    <th style={{ padding: '10px' }}>Contact</th>
                    <th style={{ padding: '10px' }}>MC Number</th>
                    <th style={{ padding: '10px' }}>Dispatch Fee</th>
                    <th style={{ padding: '10px' }}>MC Lease On</th>
                    <th style={{ padding: '10px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px 10px', fontWeight: '600', color: '#fff' }}>{c.companyName}</td>
                      <td style={{ padding: '12px 10px' }}>{c.contactName} ({c.phone})</td>
                      <td style={{ padding: '12px 10px', color: '#38bdf8' }}>{c.mcNumber}</td>
                      <td style={{ padding: '12px 10px' }}>{c.dispatchFeePercent}%</td>
                      <td style={{ padding: '12px 10px' }}>{c.needsMcLease ? `Yes (${c.mcLeaseFeePercent}%)` : 'No'}</td>
                      <td style={{ padding: '12px 10px' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80' }}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
