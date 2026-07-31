import React, { useState, useEffect, useRef } from 'react';
import './App.css';

import LoginPage from './LoginPage';
import McSearchWidget from './McSearchWidget';

import InsuranceCalculator from './InsuranceCalculator';
import IftaAndDocuments from './IftaAndDocuments';
import EldComparison from './EldComparison';
import LandingPage from './LandingPage';

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
  status: 'Pending' | 'In Transit' | 'Delivered' | 'Dispatched';
  date: string;
  brokerName?: string;
  assignedDriver?: string;
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
  id: number | string;
  name: string;
  email: string;
  role: 'Admin' | 'Dispatcher' | 'Driver' | string;
  status: 'Active' | 'Inactive' | string;
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
  { id: 1, name: 'John Dispatcher', email: 'john@truckingedgedispatchers.com', role: 'Dispatcher', status: 'Active' },
  { id: 2, name: 'Sarah Admin', email: 'sarah@truckingedgedispatchers.com', role: 'Admin', status: 'Active' },
  { id: 3, name: 'Marcus Vance', email: 'marcus@truckingedgedispatchers.com', role: 'Driver', status: 'Active' }
];

const DEFAULT_INVOICES: Invoice[] = [
  { id: 'INV-3001', carrierName: 'TQL Logistics', loadReference: 'TED-1001', loadRate: 2400, feePercentage: 7, invoiceAmount: 168, status: 'Unpaid', created_at: '2026-07-15' },
  { id: 'INV-3002', carrierName: 'CH Robinson', loadReference: 'TED-1002', loadRate: 1850, feePercentage: 7, invoiceAmount: 129.5, status: 'Paid', created_at: '2026-07-18' },
];

const DEFAULT_CUSTOMERS: CustomerClient[] = [
  { id: 'CUST-501', companyName: 'Apex Transport LLC', contactName: 'Dmitri Petrov', mcNumber: 'MC-883921', phone: '(555) 432-8765', email: 'dispatch@apextransport.com', dispatchFeePercent: 7, needsMcLease: false, mcLeaseFeePercent: 0, status: 'Active', created_at: '2026-06-10' },
  { id: 'CUST-502', companyName: 'Lone Star Freight Inc', contactName: 'Jessica Taylor', mcNumber: 'MC-992104', phone: '(555) 789-1234', email: 'jessica@lonestarfreight.net', dispatchFeePercent: 7, needsMcLease: true, mcLeaseFeePercent: 20, status: 'Active', created_at: '2026-07-01' },
];

const MARKETING_BANNERS = [
  {
    id: 1,
    title: '🔥 High-RPM Dedicated Lanes Available',
    description: 'Midwest to Texas dry van lanes averaging $2.85/mile. Claim your slots before open distribution.',
    badge: 'Limited Slots',
    bgColor: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
    borderColor: '#3b82f6'
  },
  {
    id: 2,
    title: '⚡ Zero-Fee Factoring Referral Bonus',
    description: 'Invite carrier partners to Trucking Edge Dispatch and unlock 30 days of zero-percent quick pay.',
    badge: 'Referral Program',
    bgColor: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
    borderColor: '#10b981'
  },
  {
    id: 3,
    title: '🛡️ Exclusive Fleet Insurance Discount',
    description: 'Save up to 15% on commercial auto liability through our newly partnered carrier insurance alliance.',
    badge: 'Partner Perk',
    bgColor: 'linear-gradient(135deg, #581c87 0%, #6b21a8 100%)',
    borderColor: '#a855f7'
  }
];

const HUB_WEATHER_DATA: Record<string, { temp: string; condition: string; wind: string }> = {
  'Chicago Hub': { temp: '78°F', condition: 'Clear Roads', wind: '8 mph NW' },
  'Dallas Hub': { temp: '92°F', condition: 'Sunny & Dry', wind: '6 mph S' },
  'Atlanta Hub': { temp: '86°F', condition: 'Partly Cloudy', wind: '9 mph E' },
  'Seattle Hub': { temp: '68°F', condition: 'Light Mist', wind: '11 mph W' }
};

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'app'>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'dashboard' | 'loads' | 'drivers' | 'eld' | 'fuel' | 'financials' | 'tax' | 'users' | 'customers'>('dashboard');

  const [selectedTimeZone, setSelectedTimeZone] = useState<string>('America/Chicago');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [selectedWeatherHub, setSelectedWeatherHub] = useState<string>('Chicago Hub');

  // Marketing Banner Carousel Index State
  const [currentBannerIndex, setCurrentBannerIndex] = useState<number>(0);

  // Dispatch Calculator State for RPM and Fuel
  const [calcRate, setCalcRate] = useState<string>('2400');
  const [calcMiles, setCalcMiles] = useState<string>('850');
  const [calcMpg, setCalcMpg] = useState<string>('6.5');
  const [calcFuelPrice, setCalcFuelPrice] = useState<string>('3.85');
  const [calcOtherCosts, setCalcOtherCosts] = useState<string>('150');

  // Manual Invoice Creation Form State
  const [invCarrierName, setInvCarrierName] = useState<string>('');
  const [invLoadRef, setInvLoadRef] = useState<string>('');
  const [invLoadRate, setInvLoadRate] = useState<string>('');
  const [invFeePercent, setInvFeePercent] = useState<string>('7');

  // Manual Customer Creation Form State
  const [custCompanyName, setCustCompanyName] = useState<string>('');
  const [custContactName, setCustContactName] = useState<string>('');
  const [custMcNumber, setCustMcNumber] = useState<string>('');
  const [custPhone, setCustPhone] = useState<string>('');
  const [custEmail, setCustEmail] = useState<string>('');
  const [custDispatchFee, setCustDispatchFee] = useState<string>('7');
  const [custNeedsMcLease, setCustNeedsMcLease] = useState<boolean>(false);
  const [custMcLeaseFee, setCustMcLeaseFee] = useState<string>('20');

  // Guest Service Signup & Agreement Form State
  const [signupCompanyName, setSignupCompanyName] = useState<string>('');
  const [signupContactName, setSignupContactName] = useState<string>('');
  const [signupMcNumber, setSignupMcNumber] = useState<string>('');
  const [signupPhone, setSignupPhone] = useState<string>('');
  const [signupEmail, setSignupEmail] = useState<string>('');
  const [signupTruckCount, setSignupTruckCount] = useState<string>('1');
  const [signupServiceTier, setSignupServiceTier] = useState<'dispatch_only' | 'mc_lease_only' | 'mc_lease_dispatch'>('dispatch_only');
  const [signupSignature, setSignupSignature] = useState<string>('');
  const [signupSubmitted, setSignupSubmitted] = useState<boolean>(false);

  // User Table Management State (Add, Edit, Delete)
  const [editingUserId, setEditingUserId] = useState<number | string | null>(null);
  const [editUserName, setEditUserName] = useState<string>('');
  const [editUserEmail, setEditUserEmail] = useState<string>('');
  const [editUserRole, setEditUserRole] = useState<string>('Dispatcher');
  const [editUserStatus, setEditUserStatus] = useState<string>('Active');

  const [newUserName, setNewUserName] = useState<string>('');
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [newUserRole, setNewUserRole] = useState<string>('Dispatcher');
  const [newUserStatus, setNewUserStatus] = useState<string>('Active');

  useEffect(() => {
    const bannerTimer = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % MARKETING_BANNERS.length);
    }, 6000);
    return () => clearInterval(bannerTimer);
  }, []);

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

  const [newOrigin, setNewOrigin] = useState('');
  const [newDestination, setNewDestination] = useState('');
  const [newDriver, setNewDriver] = useState('Unassigned');
  const [newRate, setNewRate] = useState('');
  const [newMiles, setNewMiles] = useState('');
  const [newBroker, setNewBroker] = useState('');

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

  // Helper function to calculate percentage fee based on rules
  const calculateSignupFeePercentage = () => {
    const tCount = parseInt(signupTruckCount) || 1;
    if (signupServiceTier === 'dispatch_only') {
      if (tCount === 1) return 8;
      if (tCount > 5) return 5;
      return 6; // >2 trucks
    }
    if (signupServiceTier === 'mc_lease_only') return 14;
    if (signupServiceTier === 'mc_lease_dispatch') return 17;
    return 7;
  };

  const currentWeatherObj = HUB_WEATHER_DATA[selectedWeatherHub] || HUB_WEATHER_DATA['Chicago Hub'];
  const activeBanner = MARKETING_BANNERS[currentBannerIndex];

  // Calculations for Dispatcher Tool
  const numRate = parseFloat(calcRate) || 0;
  const numMiles = parseFloat(calcMiles) || 1;
  const numMpg = parseFloat(calcMpg) || 6.5;
  const numFuelPrice = parseFloat(calcFuelPrice) || 3.85;
  const numOther = parseFloat(calcOtherCosts) || 0;

  const calculatedRpm = (numRate / numMiles).toFixed(2);
  const totalFuelGallons = numMiles / numMpg;
  const totalFuelCostCalc = totalFuelGallons * numFuelPrice;
  const totalExpenses = totalFuelCostCalc + numOther;
  const netProfitCalc = numRate - totalExpenses;
  const profitPerMile = (netProfitCalc / numMiles).toFixed(2);

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
  
  if (currentView === 'landing') {
    return (
      <LandingPage 
        onGuestLogin={() => {
          setIsAuthenticated(true);
          setIsGuest(true);
          setCurrentView('app');
        }}
        onAccessCommandCenter={() => {
          setIsAuthenticated(false);
          setIsGuest(false);
          setCurrentView('app');
        }}
      />
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
              { id: 'customers', label: 'Customer & MC Lease', icon: '🤝' },
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
        
        {/* Sidebar Footer Section (Marketing Banner + Sign Out) */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Sidebar Marketing Banner */}
          <div style={{ 
            background: activeBanner.bgColor, 
            border: `1px solid ${activeBanner.borderColor}`,
            borderRadius: '8px', 
            padding: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            transition: 'all 0.5s ease-in-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.65rem', background: 'rgba(255, 255, 255, 0.2)', color: '#fff', fontWeight: '700', padding: '2px 6px', borderRadius: '10px', textTransform: 'uppercase' }}>
                {activeBanner.badge}
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {MARKETING_BANNERS.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentBannerIndex(idx)}
                    style={{ 
                      width: '5px', 
                      height: '5px', 
                      borderRadius: '50%', 
                      border: 'none', 
                      background: currentBannerIndex === idx ? '#ffffff' : 'rgba(255, 255, 255, 0.4)', 
                      cursor: 'pointer', 
                      padding: 0 
                    }}
                  />
                ))}
              </div>
            </div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '0.8rem', fontWeight: '600', color: '#fff', lineHeight: '1.2' }}>{activeBanner.title}</h5>
            <p style={{ margin: 0, fontSize: '0.7rem', color: '#cbd5e1', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {activeBanner.description}
            </p>
          </div>

          <button onClick={() => { setIsAuthenticated(false); setIsGuest(false); setCurrentView('landing'); }} style={{ background: '#ef4444', color: '#fff', border: 'none', width: '100%', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem', transition: 'background 0.2s' }}>
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
                    }} 
                  /> 
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
              
              {/* Load & Fuel Calculator Widget for Dispatchers */}
              <div style={{ background: '#111827', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0, color: '#f8fafc' }}>🧮 Live Load RPM & Fuel Profit Calculator</h3>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Evaluate load profitability before booking</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Gross Rate ($)</label>
                    <input type="number" value={calcRate} onChange={e => setCalcRate(e.target.value)} style={{ width: '100%', background: '#1f2937', border: '1px solid #374151', padding: '8px', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Total Miles</label>
                    <input type="number" value={calcMiles} onChange={e => setCalcMiles(e.target.value)} style={{ width: '100%', background: '#1f2937', border: '1px solid #374151', padding: '8px', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Truck MPG</label>
                    <input type="number" step="0.1" value={calcMpg} onChange={e => setCalcMpg(e.target.value)} style={{ width: '100%', background: '#1f2937', border: '1px solid #374151', padding: '8px', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Diesel Price ($/gal)</label>
                    <input type="number" step="0.01" value={calcFuelPrice} onChange={e => setCalcFuelPrice(e.target.value)} style={{ width: '100%', background: '#1f2937', border: '1px solid #374151', padding: '8px', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Other Costs / Tolls ($)</label>
                    <input type="number" value={calcOtherCosts} onChange={e => setCalcOtherCosts(e.target.value)} style={{ width: '100%', background: '#1f2937', border: '1px solid #374151', padding: '8px', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', background: '#1f2937', padding: '16px', borderRadius: '8px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Calculated RPM</span>
                    <strong style={{ fontSize: '1.25rem', color: '#38bdf8' }}>${calculatedRpm}/mi</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Total Fuel Cost</span>
                    <strong style={{ fontSize: '1.25rem', color: '#f87171' }}>${totalFuelCostCalc.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Net Profit</span>
                    <strong style={{ fontSize: '1.25rem', color: '#4ade80' }}>${netProfitCalc.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Net Profit / Mile</span>
                    <strong style={{ fontSize: '1.25rem', color: '#facc15' }}>${profitPerMile}/mi</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'drivers' && (
            <div style={{ background: '#111827', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 16px 0', color: '#f8fafc' }}>Driver Roster & HOS Status</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Monitor active driver statuses, contact details, and remaining hours of service.</p>
              
              <div style={{ overflowX: 'auto', marginTop: '16px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #374151', color: '#94a3b8' }}>
                      <th style={{ padding: '10px' }}>Driver Name</th>
                      <th style={{ padding: '10px' }}>Truck</th>
                      <th style={{ padding: '10px' }}>Phone</th>
                      <th style={{ padding: '10px' }}>Status</th>
                      <th style={{ padding: '10px' }}>Drive Hours Left</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.map(drv => (
                      <tr key={drv.id} style={{ borderBottom: '1px solid #1f2937' }}>
                        <td style={{ padding: '12px 10px', color: '#fff', fontWeight: '500' }}>{drv.name}</td>
                        <td style={{ padding: '12px 10px', color: '#cbd5e1' }}>{drv.truck}</td>
                        <td style={{ padding: '12px 10px', color: '#cbd5e1' }}>{drv.phone}</td>
                        <td style={{ padding: '12px 10px' }}>
                          <span style={{ 
                            background: drv.status === 'Available' ? 'rgba(74, 222, 128, 0.1)' : drv.status === 'On Route' ? 'rgba(56, 189, 248, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                            color: drv.status === 'Available' ? '#4ade80' : drv.status === 'On Route' ? '#38bdf8' : '#94a3b8',
                            padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600'
                          }}>
                            {drv.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 10px', color: '#38bdf8', fontWeight: '600' }}>{drv.drivingHoursLeft} hrs</td>
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
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Real-time electronic logging device tracking for FMCSA compliance.</p>
              
              <div style={{ overflowX: 'auto', marginTop: '16px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #374151', color: '#94a3b8' }}>
                      <th style={{ padding: '10px' }}>Driver</th>
                      <th style={{ padding: '10px' }}>Current Duty Status</th>
                      <th style={{ padding: '10px' }}>Drive Time Rem.</th>
                      <th style={{ padding: '10px' }}>Duty Time Rem.</th>
                      <th style={{ padding: '10px' }}>Cycle Rem.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eldRecords.map((eld, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #1f2937' }}>
                        <td style={{ padding: '12px 10px', color: '#fff', fontWeight: '500' }}>{eld.driverName}</td>
                        <td style={{ padding: '12px 10px' }}>
                          <span style={{ 
                            background: eld.status === 'Driving' ? 'rgba(56, 189, 248, 0.1)' : eld.status === 'On Duty' ? 'rgba(250, 204, 21, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                            color: eld.status === 'Driving' ? '#38bdf8' : eld.status === 'On Duty' ? '#facc15' : '#94a3b8',
                            padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600'
                          }}>
                            {eld.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 10px', color: '#cbd5e1' }}>{eld.driveTimeRemaining} hrs</td>
                        <td style={{ padding: '12px 10px', color: '#cbd5e1' }}>{eld.dutyTimeRemaining} hrs</td>
                        <td style={{ padding: '12px 10px', color: '#cbd5e1' }}>{eld.cycleRemaining} hrs</td>
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
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 16px 0', color: '#f8fafc' }}>⛽ Live Fuel Stops & Station Finder</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '16px' }}>Interactive map displaying nearby truck stops with live diesel prices.</p>
                <div id="fuel-map-container" style={{ width: '100%', height: '350px', borderRadius: '8px', zIndex: 1 }}></div>
              </div>

              <div style={{ background: '#111827', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 16px 0', color: '#f8fafc' }}>Fuel Purchase Logs</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #374151', color: '#94a3b8' }}>
                        <th style={{ padding: '10px' }}>Date</th>
                        <th style={{ padding: '10px' }}>Driver</th>
                        <th style={{ padding: '10px' }}>Truck</th>
                        <th style={{ padding: '10px' }}>Location</th>
                        <th style={{ padding: '10px' }}>Gallons</th>
                        <th style={{ padding: '10px' }}>Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fuelEntries.map(fl => (
                        <tr key={fl.id} style={{ borderBottom: '1px solid #1f2937' }}>
                          <td style={{ padding: '12px 10px', color: '#cbd5e1' }}>{fl.date}</td>
                          <td style={{ padding: '12px 10px', color: '#fff', fontWeight: '500' }}>{fl.driverName}</td>
                          <td style={{ padding: '12px 10px', color: '#cbd5e1' }}>{fl.truck}</td>
                          <td style={{ padding: '12px 10px', color: '#cbd5e1' }}>{fl.location}</td>
                          <td style={{ padding: '12px 10px', color: '#38bdf8' }}>{fl.gallons} gal</td>
                          <td style={{ padding: '12px 10px', color: '#f87171', fontWeight: '600' }}>${fl.cost.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'financials' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ background: '#111827', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 16px 0', color: '#f8fafc' }}>💰 Invoices & Dispatch Fees</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '16px' }}>Generate and track carrier dispatch invoices.</p>
                
                {/* Manual Invoice Form */}
                <div style={{ background: '#1f2937', padding: '16px', borderRadius: '8px', marginBottom: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Carrier / Broker Name</label>
                    <input type="text" value={invCarrierName} onChange={e => setInvCarrierName(e.target.value)} placeholder="e.g. TQL Logistics" style={{ width: '100%', background: '#111827', border: '1px solid #374151', padding: '8px', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Load Reference ID</label>
                    <input type="text" value={invLoadRef} onChange={e => setInvLoadRef(e.target.value)} placeholder="e.g. TED-1004" style={{ width: '100%', background: '#111827', border: '1px solid #374151', padding: '8px', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Load Gross Rate ($)</label>
                    <input type="number" value={invLoadRate} onChange={e => setInvLoadRate(e.target.value)} placeholder="2500" style={{ width: '100%', background: '#111827', border: '1px solid #374151', padding: '8px', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Dispatch Fee (%)</label>
                    <input type="number" value={invFeePercent} onChange={e => setInvFeePercent(e.target.value)} style={{ width: '100%', background: '#111827', border: '1px solid #374151', padding: '8px', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} />
                  </div>
                  <button 
                    onClick={() => {
                      if (!invCarrierName || !invLoadRate) {
                        alert('Please fill out carrier name and load rate.');
                        return;
                      }
                      const rateNum = parseFloat(invLoadRate) || 0;
                      const feePctNum = parseFloat(invFeePercent) || 7;
                      const calculatedAmount = rateNum * (feePctNum / 100);
                      const newInv: Invoice = {
                        id: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
                        carrierName: invCarrierName,
                        loadReference: invLoadRef || 'TED-GENERAL',
                        loadRate: rateNum,
                        feePercentage: feePctNum,
                        invoiceAmount: calculatedAmount,
                        status: 'Unpaid',
                        created_at: new Date().toISOString().split('T')[0]
                      };
                      setInvoices([newInv, ...invoices]);
                      setInvCarrierName('');
                      setInvLoadRef('');
                      setInvLoadRate('');
                    }}
                    style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem' }}
                  >
                    Create Invoice
                  </button>
                </div>

                {/* Invoices Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #374151', color: '#94a3b8' }}>
                        <th style={{ padding: '10px' }}>Invoice ID</th>
                        <th style={{ padding: '10px' }}>Carrier / Broker</th>
                        <th style={{ padding: '10px' }}>Load Ref</th>
                        <th style={{ padding: '10px' }}>Load Rate</th>
                        <th style={{ padding: '10px' }}>Fee Amount</th>
                        <th style={{ padding: '10px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map(inv => (
                        <tr key={inv.id} style={{ borderBottom: '1px solid #1f2937' }}>
                          <td style={{ padding: '12px 10px', color: '#38bdf8', fontWeight: '600' }}>{inv.id}</td>
                          <td style={{ padding: '12px 10px', color: '#fff', fontWeight: '500' }}>{inv.carrierName}</td>
                          <td style={{ padding: '12px 10px', color: '#cbd5e1' }}>{inv.loadReference}</td>
                          <td style={{ padding: '12px 10px', color: '#cbd5e1' }}>${inv.loadRate.toFixed(2)}</td>
                          <td style={{ padding: '12px 10px', color: '#4ade80', fontWeight: '600' }}>${inv.invoiceAmount.toFixed(2)} ({inv.feePercentage}%)</td>
                          <td style={{ padding: '12px 10px' }}>
                            <span style={{ 
                              background: inv.status === 'Paid' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(250, 204, 21, 0.1)',
                              color: inv.status === 'Paid' ? '#4ade80' : '#facc15',
                              padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600'
                            }}>
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tax' && (
            <div>
              <IftaAndDocuments />
            </div>
          )}

          {activeTab === 'users' && (
            <div style={{ background: '#111827', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 16px 0', color: '#f8fafc' }}>👥 Fleet Access Users & Roles Management</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '16px' }}>Manage dispatchers, admins, and drivers with full CRUD capabilities.</p>

              {/* Add User Form */}
              <div style={{ background: '#1f2937', padding: '16px', borderRadius: '8px', marginBottom: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Full Name</label>
                  <input type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="e.g. Alex Smith" style={{ width: '100%', background: '#111827', border: '1px solid #374151', padding: '8px', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Email Address</label>
                  <input type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} placeholder="alex@truckingedge.com" style={{ width: '100%', background: '#111827', border: '1px solid #374151', padding: '8px', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Role</label>
                  <select value={newUserRole} onChange={e => setNewUserRole(e.target.value)} style={{ width: '100%', background: '#111827', border: '1px solid #374151', padding: '8px', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }}>
                    <option value="Dispatcher">Dispatcher</option>
                    <option value="Admin">Admin</option>
                    <option value="Driver">Driver</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Status</label>
                  <select value={newUserStatus} onChange={e => setNewUserStatus(e.target.value)} style={{ width: '100%', background: '#111827', border: '1px solid #374151', padding: '8px', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <button 
                  onClick={() => {
                    if (!newUserName || !newUserEmail) {
                      alert('Please enter user name and email.');
                      return;
                    }
                    const newUserObj: User = {
                      id: Date.now(),
                      name: newUserName,
                      email: newUserEmail,
                      role: newUserRole,
                      status: newUserStatus
                    };
                    setUsers([...users, newUserObj]);
                    setNewUserName('');
                    setNewUserEmail('');
                  }}
                  style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem' }}
                >
                  Add User
                </button>
              </div>

              {/* Users Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #374151', color: '#94a3b8' }}>
                      <th style={{ padding: '10px' }}>Name</th>
                      <th style={{ padding: '10px' }}>Email</th>
                      <th style={{ padding: '10px' }}>Role</th>
                      <th style={{ padding: '10px' }}>Status</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => {
                      const isEditing = editingUserId === u.id;
                      return (
                        <tr key={u.id} style={{ borderBottom: '1px solid #1f2937' }}>
                          <td style={{ padding: '12px 10px', color: '#fff' }}>
                            {isEditing ? (
                              <input type="text" value={editUserName} onChange={e => setEditUserName(e.target.value)} style={{ background: '#111827', border: '1px solid #374151', color: '#fff', padding: '4px 6px', borderRadius: '4px', width: '100%' }} />
                            ) : (
                              <strong>{u.name}</strong>
                            )}
                          </td>
                          <td style={{ padding: '12px 10px', color: '#cbd5e1' }}>
                            {isEditing ? (
                              <input type="email" value={editUserEmail} onChange={e => setEditUserEmail(e.target.value)} style={{ background: '#111827', border: '1px solid #374151', color: '#fff', padding: '4px 6px', borderRadius: '4px', width: '100%' }} />
                            ) : (
                              u.email
                            )}
                          </td>
                          <td style={{ padding: '12px 10px', color: '#cbd5e1' }}>
                            {isEditing ? (
                              <select value={editUserRole} onChange={e => setEditUserRole(e.target.value)} style={{ background: '#111827', border: '1px solid #374151', color: '#fff', padding: '4px 6px', borderRadius: '4px' }}>
                                <option value="Dispatcher">Dispatcher</option>
                                <option value="Admin">Admin</option>
                                <option value="Driver">Driver</option>
                              </select>
                            ) : (
                              u.role
                            )}
                          </td>
                          <td style={{ padding: '12px 10px' }}>
                            {isEditing ? (
                              <select value={editUserStatus} onChange={e => setEditUserStatus(e.target.value)} style={{ background: '#111827', border: '1px solid #374151', color: '#fff', padding: '4px 6px', borderRadius: '4px' }}>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                              </select>
                            ) : (
                              <span style={{ 
                                background: u.status === 'Active' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                                color: u.status === 'Active' ? '#4ade80' : '#94a3b8',
                                padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600'
                              }}>
                                {u.status}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                            {isEditing ? (
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                <button 
                                  onClick={() => {
                                    setUsers(users.map(item => item.id === u.id ? { ...item, name: editUserName, email: editUserEmail, role: editUserRole, status: editUserStatus } : item));
                                    setEditingUserId(null);
                                  }}
                                  style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}
                                >
                                  Save
                                </button>
                                <button 
                                  onClick={() => setEditingUserId(null)}
                                  style={{ background: '#4b5563', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                <button 
                                  onClick={() => {
                                    setEditingUserId(u.id);
                                    setEditUserName(u.name);
                                    setEditUserEmail(u.email);
                                    setEditUserRole(u.role);
                                    setEditUserStatus(u.status);
                                  }}
                                  style={{ background: '#374151', color: '#38bdf8', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete ${u.name}?`)) {
                                      setUsers(users.filter(item => item.id !== u.id));
                                    }
                                  }}
                                  style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'customers' && (
            <div style={{ background: '#111827', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 16px 0', color: '#f8fafc' }}>🤝 Customer & MC Lease Client Management</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '16px' }}>Manage motor carrier clients, dispatch service agreements, and MC leasing programs.</p>

              {/* Conditional View for Guest vs Admin */}
              {isGuest ? (
                <div style={{ background: '#1f2937', padding: '24px', borderRadius: '8px', border: '1px solid #374151', marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#38bdf8', fontWeight: '600' }}>📋 Professional Service Signup & Agreement Form</h4>
                  <p style={{ margin: '0 0 20px 0', fontSize: '0.813rem', color: '#94a3b8' }}>
                    Select your preferred service tier and fleet size below. Your service fee is calculated automatically according to our tiered rate structure. Note: ELD and insurance charges are paid separately.
                  </p>

                  {signupSubmitted ? (
                    <div style={{ background: 'rgba(74, 222, 128, 0.1)', border: '1px solid #4ade80', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                      <h4 style={{ color: '#4ade80', margin: '0 0 8px 0' }}>🎉 Agreement Submitted Successfully!</h4>
                      <p style={{ color: '#cbd5e1', fontSize: '0.875rem', margin: '0 0 16px 0' }}>
                        Thank you, {signupCompanyName}. Your agreement for <strong>{signupServiceTier === 'dispatch_only' ? 'Dispatch Only' : signupServiceTier === 'mc_lease_only' ? 'MC Lease Only' : 'MC Lease + Dispatch'}</strong> has been registered at a rate of <strong>{calculateSignupFeePercentage()}%</strong>. Our onboarding team will contact you shortly.
                      </p>
                      <button 
                        onClick={() => setSignupSubmitted(false)}
                        style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '0.813rem', fontWeight: '600', cursor: 'pointer' }}
                      >
                        Submit Another Agreement
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Company Name</label>
                          <input type="text" value={signupCompanyName} onChange={e => setSignupCompanyName(e.target.value)} placeholder="Apex Transport" style={{ width: '100%', background: '#111827', border: '1px solid #374151', padding: '9px', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Contact Name</label>
                          <input type="text" value={signupContactName} onChange={e => setSignupContactName(e.target.value)} placeholder="John Doe" style={{ width: '100%', background: '#111827', border: '1px solid #374151', padding: '9px', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>MC Number</label>
                          <input type="text" value={signupMcNumber} onChange={e => setSignupMcNumber(e.target.value)} placeholder="MC-123456" style={{ width: '100%', background: '#111827', border: '1px solid #374151', padding: '9px', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Phone Number</label>
                          <input type="text" value={signupPhone} onChange={e => setSignupPhone(e.target.value)} placeholder="(555) 000-0000" style={{ width: '100%', background: '#111827', border: '1px solid #374151', padding: '9px', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Email Address</label>
                          <input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} placeholder="dispatch@client.com" style={{ width: '100%', background: '#111827', border: '1px solid #374151', padding: '9px', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Fleet Size (Number of Trucks)</label>
                          <input type="number" min="1" value={signupTruckCount} onChange={e => setSignupTruckCount(e.target.value)} style={{ width: '100%', background: '#111827', border: '1px solid #374151', padding: '9px', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '4px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Preferred Service Tier</label>
                          <select value={signupServiceTier} onChange={e => setSignupServiceTier(e.target.value as any)} style={{ width: '100%', background: '#111827', border: '1px solid #374151', padding: '9px', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }}>
                            <option value="dispatch_only">Dispatch Only (Truck-based tier)</option>
                            <option value="mc_lease_only">MC Lease Only (14%)</option>
                            <option value="mc_lease_dispatch">MC Lease + Dispatch Included (17%)</option>
                          </select>
                        </div>
                        <div style={{ background: '#111827', padding: '12px 16px', borderRadius: '6px', border: '1px solid #374151', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600' }}>Automatically Calculated Percentage</span>
                          <strong style={{ fontSize: '1.4rem', color: '#4ade80', marginTop: '2px' }}>{calculateSignupFeePercentage()}% Fee</strong>
                        </div>
                      </div>

                      <div style={{ marginTop: '8px' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Authorized Signature (Type Full Legal Name)</label>
                        <input type="text" value={signupSignature} onChange={e => setSignupSignature(e.target.value)} placeholder="e.g. John Doe (Authorized Officer)" style={{ width: '100%', background: '#111827', border: '1px solid #374151', padding: '9px', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                        <button 
                          onClick={() => {
                            if (!signupCompanyName || !signupMcNumber || !signupSignature) {
                              alert('Please fill out your company name, MC number, and authorized signature.');
                              return;
                            }
                            const newCust: CustomerClient = {
                              id: `CUST-${Math.floor(100 + Math.random() * 900)}`,
                              companyName: signupCompanyName,
                              contactName: signupContactName || 'Authorized Signatory',
                              mcNumber: signupMcNumber,
                              phone: signupPhone || '(555) 000-0000',
                              email: signupEmail || 'carrier@client.com',
                              dispatchFeePercent: calculateSignupFeePercentage(),
                              needsMcLease: signupServiceTier !== 'dispatch_only',
                              mcLeaseFeePercent: signupServiceTier !== 'dispatch_only' ? calculateSignupFeePercentage() : 0,
                              status: 'Pending Verification',
                              created_at: new Date().toISOString().split('T')[0]
                            };
                            setCustomers([newCust, ...customers]);
                            setSignupSubmitted(true);
                          }}
                          style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '11px 24px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem' }}
                        >
                          Sign & Submit Service Agreement
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Add Customer Form for Admins */
                <div style={{ background: '#1f2937', padding: '16px', borderRadius: '8px', marginBottom: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Company Name</label>
                    <input type="text" value={custCompanyName} onChange={e => setCustCompanyName(e.target.value)} placeholder="Apex Transport" style={{ width: '100%', background: '#111827', border: '1px solid #374151', padding: '8px', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Contact Name</label>
                    <input type="text" value={custContactName} onChange={e => setCustContactName(e.target.value)} placeholder="John Doe" style={{ width: '100%', background: '#111827', border: '1px solid #374151', padding: '8px', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>MC Number</label>
                    <input type="text" value={custMcNumber} onChange={e => setCustMcNumber(e.target.value)} placeholder="MC-123456" style={{ width: '100%', background: '#111827', border: '1px solid #374151', padding: '8px', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Phone</label>
                    <input type="text" value={custPhone} onChange={e => setCustPhone(e.target.value)} placeholder="(555) 000-0000" style={{ width: '100%', background: '#111827', border: '1px solid #374151', padding: '8px', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Email</label>
                    <input type="email" value={custEmail} onChange={e => setCustEmail(e.target.value)} placeholder="dispatch@client.com" style={{ width: '100%', background: '#111827', border: '1px solid #374151', padding: '8px', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Dispatch Fee (%)</label>
                    <input type="number" value={custDispatchFee} onChange={e => setCustDispatchFee(e.target.value)} style={{ width: '100%', background: '#111827', border: '1px solid #374151', padding: '8px', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '8px' }}>
                    <input type="checkbox" id="mcLeaseCheck" checked={custNeedsMcLease} onChange={e => setCustNeedsMcLease(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                    <label htmlFor="mcLeaseCheck" style={{ fontSize: '0.75rem', color: '#cbd5e1', cursor: 'pointer' }}>Needs MC Lease Program</label>
                  </div>
                  {custNeedsMcLease && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>MC Lease Fee (%)</label>
                      <input type="number" value={custMcLeaseFee} onChange={e => setCustMcLeaseFee(e.target.value)} style={{ width: '100%', background: '#111827', border: '1px solid #374151', padding: '8px', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} />
                    </div>
                  )}
                  <button 
                    onClick={() => {
                      if (!custCompanyName || !custMcNumber) {
                        alert('Please provide company name and MC number.');
                        return;
                      }
                      const newCust: CustomerClient = {
                        id: `CUST-${Math.floor(100 + Math.random() * 900)}`,
                        companyName: custCompanyName,
                        contactName: custContactName || 'Primary Contact',
                        mcNumber: custMcNumber,
                        phone: custPhone || '(555) 000-0000',
                        email: custEmail || 'client@domain.com',
                        dispatchFeePercent: parseFloat(custDispatchFee) || 7,
                        needsMcLease: custNeedsMcLease,
                        mcLeaseFeePercent: custNeedsMcLease ? parseFloat(custMcLeaseFee) || 20 : 0,
                        status: 'Active',
                        created_at: new Date().toISOString().split('T')[0]
                      };
                      setCustomers([newCust, ...customers]);
                      setCustCompanyName('');
                      setCustContactName('');
                      setCustMcNumber('');
                      setCustPhone('');
                      setCustEmail('');
                      setCustNeedsMcLease(false);
                    }}
                    style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem' }}
                  >
                    Add Customer
                  </button>
                </div>
              )}

              {/* Customers Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #374151', color: '#94a3b8' }}>
                      <th style={{ padding: '10px' }}>Company Name</th>
                      <th style={{ padding: '10px' }}>MC Number</th>
                      <th style={{ padding: '10px' }}>Contact</th>
                      <th style={{ padding: '10px' }}>Dispatch Fee</th>
                      <th style={{ padding: '10px' }}>MC Lease Status</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map(c => (
                      <tr key={c.id} style={{ borderBottom: '1px solid #1f2937' }}>
                        <td style={{ padding: '12px 10px', color: '#fff', fontWeight: '600' }}>{c.companyName}</td>
                        <td style={{ padding: '12px 10px', color: '#38bdf8' }}>{c.mcNumber}</td>
                        <td style={{ padding: '12px 10px', color: '#cbd5e1' }}>{c.contactName} ({c.phone})</td>
                        <td style={{ padding: '12px 10px', color: '#4ade80' }}>{c.dispatchFeePercent}%</td>
                        <td style={{ padding: '12px 10px' }}>
                          {c.needsMcLease ? (
                            <span style={{ background: 'rgba(250, 204, 21, 0.1)', color: '#facc15', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>
                              Leased ({c.mcLeaseFeePercent}%)
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Own MC</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                          <button 
                            onClick={() => {
                              if (confirm(`Remove customer ${c.companyName}?`)) {
                                setCustomers(customers.filter(item => item.id !== c.id));
                              }
                            }}
                            style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}