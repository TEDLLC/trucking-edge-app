import React, { useState, useEffect, useRef } from 'react';
import './App.css';

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

// --- DEFAULT DATA FOR TRUCKING EDGE DISPATCHERS ---
const DEFAULT_LOADS: Load[] = [
  { id: 'TED-1001', origin: 'Chicago, IL', destination: 'Dallas, TX', driver: 'Marcus Vance', rate: 2400, miles: 925, fuelCost: 450, status: 'In Transit', date: '2026-07-15' },
  { id: 'TED-1002', origin: 'Atlanta, GA', destination: 'Miami, FL', driver: 'Sarah Jenkins', rate: 1850, miles: 660, fuelCost: 310, status: 'Delivered', date: '2026-07-18' },
  { id: 'TED-1003', origin: 'Seattle, WA', destination: 'Denver, CO', driver: 'Unassigned', rate: 3100, miles: 1300, fuelCost: 620, status: 'Pending', date: '2026-07-20' },
];

const DEFAULT_DRIVERS: Driver[] = [
  { id: 'DRV-101', name: 'Marcus Vance', phone: '(555) 234-5678', truck: 'Truck #402', payPerMile: 0.65, status: 'On Route' },
  { id: 'DRV-102', name: 'Sarah Jenkins', phone: '(555) 876-5432', truck: 'Truck #108', payPerMile: 0.60, status: 'Available' },
  { id: 'DRV-103', name: 'David Miller', phone: '(555) 345-6789', truck: 'Truck #205', payPerMile: 0.58, status: 'Off Duty' },
];

const DEFAULT_FUEL: FuelEntry[] = [
  { id: 'FL-501', driverName: 'Marcus Vance', truck: 'Truck #402', gallons: 120, cost: 450, location: 'Love\'s #310 - St. Louis, MO', date: '2026-07-16' },
  { id: 'FL-502', driverName: 'Sarah Jenkins', truck: 'Truck #108', gallons: 85, cost: 310, location: 'Pilot #142 - Macon, GA', date: '2026-07-18' },
];

const DEFAULT_ELD: ELDRecord[] = [
  { driverId: 'DRV-101', driverName: 'Marcus Vance', status: 'Driving', driveTimeRemaining: 4.5, dutyTimeRemaining: 6.0, cycleRemaining: 32.5 },
  { driverId: 'DRV-102', driverName: 'Sarah Jenkins', status: 'Off Duty', driveTimeRemaining: 11.0, dutyTimeRemaining: 14.0, cycleRemaining: 64.0 },
  { driverId: 'DRV-103', driverName: 'David Miller', status: 'Sleeper', driveTimeRemaining: 11.0, dutyTimeRemaining: 14.0, cycleRemaining: 58.0 },
];

const DEFAULT_USERS: User[] = [
  { id: 'USR-01', name: 'John Dispatcher', email: 'john@truckingedgedispatchers.com', role: 'Dispatcher', status: 'Active' },
  { id: 'USR-02', name: 'Sarah Admin', email: 'sarah@truckingedgedispatchers.com', role: 'Admin', status: 'Active' },
  { id: 'USR-03', name: 'Marcus Vance', email: 'marcus@truckingedgedispatchers.com', role: 'Driver', status: 'Active' },
];

function App() {
  // --- AUTHENTICATION STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'loads' | 'drivers' | 'eld' | 'fuel' | 'financials' | 'tax' | 'users'>('loads');

  // --- LOCAL STORAGE NAMESPACED ---
  const [loads, setLoads] = useState<Load[]>(() => JSON.parse(localStorage.getItem('ted_loads') || 'null') || DEFAULT_LOADS);
  const [drivers, setDrivers] = useState<Driver[]>(() => JSON.parse(localStorage.getItem('ted_drivers') || 'null') || DEFAULT_DRIVERS);
  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>(() => JSON.parse(localStorage.getItem('ted_fuel') || 'null') || DEFAULT_FUEL);
  const [eldRecords, setEldRecords] = useState<ELDRecord[]>(() => JSON.parse(localStorage.getItem('ted_eld') || 'null') || DEFAULT_ELD);
  const [users, setUsers] = useState<User[]>(() => JSON.parse(localStorage.getItem('ted_users') || 'null') || DEFAULT_USERS);

  useEffect(() => localStorage.setItem('ted_loads', JSON.stringify(loads)), [loads]);
  useEffect(() => localStorage.setItem('ted_drivers', JSON.stringify(drivers)), [drivers]);
  useEffect(() => localStorage.setItem('ted_fuel', JSON.stringify(fuelEntries)), [fuelEntries]);
  useEffect(() => localStorage.setItem('ted_eld', JSON.stringify(eldRecords)), [eldRecords]);
  useEffect(() => localStorage.setItem('ted_users', JSON.stringify(users)), [users]);

  // --- MANUAL RPM CALCULATOR STATE (FOR P&L TAB) ---
  const [manualRate, setManualRate] = useState<string>('');
  const [manualMiles, setManualMiles] = useState<string>('');

  // --- ADMIN TAX & IFTA CALCULATOR STATE ---
  const [estimatedTaxRate] = useState<string>('25'); 
  const [selfEmploymentTaxRate] = useState<string>('15.3'); 
  const [iftaAvgTaxPerGallon] = useState<string>('0.32'); 
  const [fleetMpg] = useState<string>('6.5'); 

  // --- MAP & GPS FUEL STATIONS STATE ---
  const mapRef = useRef<any>(null);
  const [mapCenter] = useState({ lat: 41.8781, lng: -87.6298 });
  const [locationName, setLocationName] = useState('Chicago Hub (Central Dispatch)');
  const [nearbyStations, setNearbyStations] = useState<FuelStation[]>([
    { id: 'ST-01', name: "Love's Travel Stop #410", lat: 41.8900, lng: -87.6500, address: "I-90 Exit 12, Chicago, IL", dieselPrice: 3.79, distanceMiles: 2.4 },
    { id: 'ST-02', name: "Pilot Travel Center #112", lat: 41.8600, lng: -87.6100, address: "US-41 South, Chicago, IL", dieselPrice: 3.84, distanceMiles: 4.1 },
    { id: 'ST-03', name: "TA Petro Stopping Center", lat: 41.9200, lng: -87.6800, address: "I-294 Exit 4, Cicero, IL", dieselPrice: 3.75, distanceMiles: 7.8 },
    { id: 'ST-04', name: "Flying J Travel Plaza #504", lat: 41.8200, lng: -87.5800, address: "I-94 Exit 6, Gary, IN", dieselPrice: 3.69, distanceMiles: 12.3 }
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
            <div style="font-family: sans-serif; font-size: 13px; color: #000;">
              <strong style="font-size: 14px; color: #d97706;">${st.name}</strong><br/>
              <span>${st.address}</span><br/>
              <strong style="color: #15803d;">Diesel: $${st.dieselPrice.toFixed(2)}/gal</strong><br/>
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

  const handleFindGPSLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLat = position.coords.latitude;
          const newLng = position.coords.longitude;
          setLocationName('GPS Active Telemetry Location');

          setNearbyStations([
            { id: 'ST-GPS-1', name: "Love's Travel Stop (Nearest GPS)", lat: newLat + 0.015, lng: newLng + 0.012, address: "Nearby Highway Exit", dieselPrice: 3.78, distanceMiles: 1.2 },
            { id: 'ST-GPS-2', name: "Pilot Flying J (Freight Corridor)", lat: newLat - 0.02, lng: newLng - 0.018, address: "Main Truck Route", dieselPrice: 3.82, distanceMiles: 2.8 },
            { id: 'ST-GPS-3', name: "TA Petro Express", lat: newLat + 0.035, lng: newLng - 0.025, address: "Interstate Bypass", dieselPrice: 3.72, distanceMiles: 5.1 },
          ]);
        },
        () => alert('Could not access GPS location.')
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  // --- FORM STATES ---
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [driver, setDriver] = useState('');
  const [rate, setRate] = useState('');
  const [miles, setMiles] = useState('');
  const [loadDate] = useState(new Date().toISOString().split('T')[0]);

  const [fuelDriver, setFuelDriver] = useState('');
  const [gallons, setGallons] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [fuelLocation, setFuelLocation] = useState('');

  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [driverTruck, setDriverTruck] = useState('');
  const [driverPayRate] = useState('0.60');

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole] = useState<'Admin' | 'Dispatcher' | 'Driver'>('Dispatcher');

  const [selectedReportDriver, setSelectedReportDriver] = useState<string>('');
  const [showReportModal, setShowReportModal] = useState(false);

  const [maintenanceCost] = useState('1200');
  const [fixedOverhead] = useState('2500');

  // --- HANDLERS ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail.trim() && loginPassword.trim()) {
      setIsAuthenticated(true);
    } else {
      alert('Please enter valid credentials.');
    }
  };

  const handleAddLoad = (e: React.FormEvent) => {
    e.preventDefault();
    const newLoad: Load = {
      id: `TED-${Math.floor(1000 + Math.random() * 9000)}`,
      origin,
      destination,
      driver: driver || 'Unassigned',
      rate: parseFloat(rate) || 0,
      miles: parseFloat(miles) || 0,
      fuelCost: 0,
      status: 'Pending',
      date: loadDate,
    };
    setLoads([newLoad, ...loads]);
    setOrigin(''); setDestination(''); setDriver(''); setRate(''); setMiles('');
  };

  const handleAddFuel = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedDrv = drivers.find(d => d.name === fuelDriver);
    const newEntry: FuelEntry = {
      id: `FL-${Math.floor(100 + Math.random() * 900)}`,
      driverName: fuelDriver,
      truck: assignedDrv ? assignedDrv.truck : 'Unassigned',
      gallons: parseFloat(gallons) || 0,
      cost: parseFloat(fuelCost) || 0,
      location: fuelLocation,
      date: new Date().toISOString().split('T')[0],
    };
    setFuelEntries([newEntry, ...fuelEntries]);
    setFuelDriver(''); setGallons(''); setFuelCost(''); setFuelLocation('');
  };

  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    const newDriver: Driver = {
      id: `DRV-${Math.floor(100 + Math.random() * 900)}`,
      name: driverName,
      phone: driverPhone || 'N/A',
      truck: driverTruck || 'Unassigned',
      payPerMile: parseFloat(driverPayRate) || 0.60,
      status: 'Available',
    };
    setDrivers([...drivers, newDriver]);
    setEldRecords([...eldRecords, {
      driverId: newDriver.id,
      driverName: newDriver.name,
      status: 'Off Duty',
      driveTimeRemaining: 11.0,
      dutyTimeRemaining: 14.0,
      cycleRemaining: 70.0
    }]);
    setDriverName(''); setDriverPhone(''); setDriverTruck('');
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: `USR-${Math.floor(10 + Math.random() * 90)}`,
      name: userName,
      email: userEmail,
      role: userRole,
      status: 'Active',
    };
    setUsers([...users, newUser]);
    setUserName(''); setUserEmail('');
  };

  const handleUpdateELD = (driverId: string, newStatus: ELDRecord['status']) => {
    setEldRecords(eldRecords.map(rec => rec.driverId === driverId ? { ...rec, status: newStatus } : rec));
  };

  // --- CALCULATIONS ---
  const totalGrossRevenue = loads.reduce((sum, l) => sum + l.rate, 0);
  const totalMilesDriven = loads.reduce((sum, l) => sum + l.miles, 0);
  const avgRPM = totalMilesDriven > 0 ? (totalGrossRevenue / totalMilesDriven) : 0;
  const totalFuelCost = fuelEntries.reduce((sum, f) => sum + f.cost, 0);
  const totalGallonsPurchased = fuelEntries.reduce((sum, f) => sum + f.gallons, 0);

  const totalDriverPay = loads.reduce((sum, l) => {
    const drv = drivers.find(d => d.name === l.driver);
    const ratePerMile = drv ? drv.payPerMile : 0.60;
    return sum + (l.miles * ratePerMile);
  }, 0);

  const totalExpenses = totalFuelCost + totalDriverPay + (parseFloat(maintenanceCost) || 0) + (parseFloat(fixedOverhead) || 0);
  const netProfit = totalGrossRevenue - totalExpenses;

  const incomeTaxOwed = netProfit > 0 ? (netProfit * (parseFloat(estimatedTaxRate) || 0) / 100) : 0;
  const selfEmpTaxOwed = netProfit > 0 ? (netProfit * (parseFloat(selfEmploymentTaxRate) || 0) / 100) : 0;
  const totalEstimatedTax = incomeTaxOwed + selfEmpTaxOwed;

  const requiredGallonsIFTA = totalMilesDriven / (parseFloat(fleetMpg) || 6.5);
  const iftaTaxRequired = requiredGallonsIFTA * (parseFloat(iftaAvgTaxPerGallon) || 0.32);
  const fuelTaxPaidAtPump = totalGallonsPurchased * (parseFloat(iftaAvgTaxPerGallon) || 0.32);
  const iftaBalanceOwed = iftaTaxRequired - fuelTaxPaidAtPump;

  const getDriverReport = (driverName: string) => {
    const driverLoads = loads.filter(l => l.driver === driverName);
    const driverFuel = fuelEntries.filter(f => f.driverName === driverName);
    const drvInfo = drivers.find(d => d.name === driverName);

    const miles = driverLoads.reduce((sum, l) => sum + l.miles, 0);
    const gross = driverLoads.reduce((sum, l) => sum + l.rate, 0);
    const fuelSpent = driverFuel.reduce((sum, f) => sum + f.cost, 0);
    const payEarned = miles * (drvInfo ? drvInfo.payPerMile : 0.60);
    const netProfitContrib = gross - (fuelSpent + payEarned);
    const driverRPM = miles > 0 ? gross / miles : 0;

    return { driverLoads, miles, gross, fuelSpent, payEarned, netProfitContrib, driverRPM, drvInfo };
  };

  // --- LOGIN SCREEN RENDERING IF NOT AUTHENTICATED ---
  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#0f172a', color: '#fff', fontFamily: 'sans-serif' }}>
        <div style={{ background: '#1e293b', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2>🚛 TRUCKING EDGE</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Secure Dispatch Portal Login</p>
          </div>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Email Address</label>
              <input 
                type="email" 
                value={loginEmail} 
                onChange={(e) => setLoginEmail(e.target.value)} 
                placeholder="dispatcher@truckingedge.com" 
                required 
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Password</label>
              <input 
                type="password" 
                value={loginPassword} 
                onChange={(e) => setLoginPassword(e.target.value)} 
                placeholder="••••••••" 
                required 
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
              />
            </div>
            <button type="submit" style={{ width: '100%', background: '#3b82f6', color: '#fff', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
              Sign In to Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', background: '#090d16', overflow: 'hidden' }}>
      {/* Left Marketing / Sponsor Banner */}
      <aside style={{ width: '180px', background: '#1e293b', borderRight: '1px solid #334155', padding: '20px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', flexShrink: 0 }}>
        <div>
          <h3 style={{ color: '#f59e0b', fontSize: '0.9rem', marginBottom: '10px' }}>📢 SPONSOR</h3>
          <p style={{ marginBottom: '15px', lineHeight: '1.4' }}>Get 20% off Commercial Truck Insurance with Trucking Edge Partners!</p>
          <a href="#sponsor1" onClick={(e) => { e.preventDefault(); alert('Left Banner Link Clicked!'); }} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.8rem' }}>Learn More &rarr;</a>
        </div>
        <div style={{ background: '#0f172a', padding: '12px 8px', borderRadius: '6px', border: '1px dashed #475569' }}>
          <span style={{ fontSize: '0.75rem', display: 'block', color: '#cbd5e1' }}>Ad Space Available</span>
          <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Contact Ads Team</span>
        </div>
      </aside>

      {/* Main Dashboard Wrapper */}
      <div className="dashboard-container" style={{ flex: 1, display: 'flex', height: '100%', overflow: 'hidden' }}>
        {/* Sidebar Navigation */}
        <aside className="sidebar">
          <div className="brand" style={{ fontSize: '1.1rem', lineHeight: '1.3' }}>
            🚛 TRUCKING EDGE<br />
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', letterSpacing: '2px' }}>DISPATCHERS</span>
          </div>
          <nav className="nav-menu">
            <button className={`nav-item ${activeTab === 'loads' ? 'active' : ''}`} onClick={() => setActiveTab('loads')}>
              📋 Dispatch & RPM
            </button>
            <button className={`nav-item ${activeTab === 'drivers' ? 'active' : ''}`} onClick={() => setActiveTab('drivers')}>
              👨‍✈️ Driver Roster
            </button>
            <button className={`nav-item ${activeTab === 'eld' ? 'active' : ''}`} onClick={() => setActiveTab('eld')}>
              📟 ELD / HOS Logs
            </button>
            <button className={`nav-item ${activeTab === 'fuel' ? 'active' : ''}`} onClick={() => setActiveTab('fuel')}>
              ⛽ Fuel Map & Logs
            </button>
            <button className={`nav-item ${activeTab === 'financials' ? 'active' : ''}`} onClick={() => setActiveTab('financials')}>
              💰 Profit & Loss
            </button>
            <button className={`nav-item ${activeTab === 'tax' ? 'active' : ''}`} onClick={() => setActiveTab('tax')}>
              🏛️ Admin Tax & IFTA
            </button>
            <button className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
              👥 Fleet Access Roles
            </button>
          </nav>
          <div style={{ padding: '20px' }}>
            <button onClick={() => setIsAuthenticated(false)} style={{ background: '#ef4444', color: '#fff', border: 'none', width: '100%', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content View */}
        <main className="main-content">
          <header className="header">
            <h1>
              {activeTab === 'loads' && 'Trucking Edge Dispatch & RPM Center'}
              {activeTab === 'drivers' && 'Fleet Driver Roster & Performance'}
              {activeTab === 'eld' && 'ELD Hours of Service (HOS) Telemetry'}
              {activeTab === 'fuel' && 'Fuel Network & GPS Station Locator'}
              {activeTab === 'financials' && 'Trucking Edge Profit & Loss (P&L)'}
              {activeTab === 'tax' && 'Administrator Tax & IFTA Center'}
              {activeTab === 'users' && 'System Authorization & User Roles'}
            </h1>
          </header>

          {/* Global Fleet Metrics Bar */}
          <div className="stats-grid">
            <div className="stat-card">
              <span className="label">Gross Revenue</span>
              <div className="value" style={{ color: '#f59e0b' }}>${totalGrossRevenue.toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <span className="label">Avg Fleet Rate/Mile</span>
              <div className="value">${avgRPM.toFixed(2)}</div>
            </div>
            <div className="stat-card">
              <span className="label">Total Miles Logged</span>
              <div className="value">{totalMilesDriven.toLocaleString()} mi</div>
            </div>
            <div className="stat-card">
              <span className="label">Net Profit</span>
              <div className="value" style={{ color: netProfit >= 0 ? '#22c55e' : '#ef4444' }}>
                ${netProfit.toLocaleString()}
              </div>
            </div>
          </div>

          {/* TAB 1: DISPATCH & LOADS */}
          {activeTab === 'loads' && (
            <div className="content-grid">
              <div className="card table-card">
                <h2>Active Dispatches</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Load ID</th>
                      <th>Route</th>
                      <th>Miles</th>
                      <th>Gross Rate</th>
                      <th>RPM</th>
                      <th>Driver</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loads.map(l => {
                      const rpm = l.miles > 0 ? (l.rate / l.miles).toFixed(2) : 'N/A';
                      return (
                        <tr key={l.id}>
                          <td><strong>{l.id}</strong></td>
                          <td>{l.origin} ➔ {l.destination}</td>
                          <td>{l.miles} mi</td>
                          <td>${l.rate.toLocaleString()}</td>
                          <td><strong style={{ color: '#f59e0b' }}>${rpm}/mi</strong></td>
                          <td>{l.driver}</td>
                          <td>
                            <select 
                              value={l.status} 
                              onChange={(e) => setLoads(loads.map(item => item.id === l.id ? { ...item, status: e.target.value as any } : item))}
                              className="status-select"
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Transit">In Transit</option>
                              <option value="Delivered">Delivered</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="card form-card">
                <h2>Book New Freight</h2>
                <form onSubmit={handleAddLoad}>
                  <div className="form-group">
                    <label>Pickup Location</label>
                    <input type="text" placeholder="e.g. Chicago, IL" value={origin} onChange={(e) => setOrigin(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Delivery Location</label>
                    <input type="text" placeholder="e.g. Dallas, TX" value={destination} onChange={(e) => setDestination(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Total Miles</label>
                    <input type="number" placeholder="e.g. 925" value={miles} onChange={(e) => setMiles(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Gross Rate ($)</label>
                    <input type="number" placeholder="e.g. 2500" value={rate} onChange={(e) => setRate(e.target.value)} required />
                  </div>

                  {parseFloat(miles) > 0 && parseFloat(rate) > 0 && (
                    <div style={{ padding: '12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', marginBottom: '14px', textAlign: 'center' }}>
                      Calculated RPM: <strong style={{ color: '#f59e0b' }}>${(parseFloat(rate) / parseFloat(miles)).toFixed(2)} / mi</strong>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Assign Driver</label>
                    <select value={driver} onChange={(e) => setDriver(e.target.value)} className="status-select">
                      <option value="">Unassigned</option>
                      {drivers.map(d => <option key={d.id} value={d.name}>{d.name} ({d.truck})</option>)}
                    </select>
                  </div>
                  <button type="submit" className="btn-primary">Dispatch Freight</button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: DRIVERS & REPORTS */}
          {activeTab === 'drivers' && (
            <div className="content-grid">
              <div className="card table-card">
                <h2>Driver Roster & Reports</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Driver</th>
                      <th>Phone</th>
                      <th>Truck</th>
                      <th>Pay Rate</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.map(d => (
                      <tr key={d.id}>
                        <td><strong>{d.name}</strong></td>
                        <td>{d.phone}</td>
                        <td>{d.truck}</td>
                        <td>${d.payPerMile.toFixed(2)}/mi</td>
                        <td><strong>{d.status}</strong></td>
                        <td>
                          <button 
                            onClick={() => { setSelectedReportDriver(d.name); setShowReportModal(true); }}
                            style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            📄 Performance
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="card form-card">
                <h2>Register New Driver</h2>
                <form onSubmit={handleAddDriver}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" placeholder="e.g. Alex Rivera" value={driverName} onChange={(e) => setDriverName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="text" placeholder="(555) 019-2831" value={driverPhone} onChange={(e) => setDriverPhone(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Truck Assignment</label>
                    <input type="text" placeholder="Truck #301" value={driverTruck} onChange={(e) => setDriverTruck(e.target.value)} />
                  </div>
                  <button type="submit" className="btn-primary">Add Driver</button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: ELD TELEMETRY */}
          {activeTab === 'eld' && (
            <div className="card table-card">
              <h2>📟 Live ELD Hours of Service Telemetry</h2>
              <table>
                <thead>
                  <tr>
                    <th>Driver</th>
                    <th>Current Duty Status</th>
                    <th>Drive Remaining (11h)</th>
                    <th>Duty Remaining (14h)</th>
                    <th>70-Hr Cycle</th>
                    <th>Status Override</th>
                  </tr>
                </thead>
                <tbody>
                  {eldRecords.map(rec => (
                    <tr key={rec.driverId}>
                      <td><strong>{rec.driverName}</strong></td>
                      <td>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontWeight: 'bold',
                          background: rec.status === 'Driving' ? '#166534' : rec.status === 'On Duty' ? '#854d0e' : '#334155',
                          color: '#fff'
                        }}>
                          {rec.status}
                        </span>
                      </td>
                      <td><strong>{rec.driveTimeRemaining} hrs</strong></td>
                      <td>{rec.dutyTimeRemaining} hrs</td>
                      <td>{rec.cycleRemaining} hrs</td>
                      <td>
                        <select 
                          value={rec.status}
                          onChange={(e) => handleUpdateELD(rec.driverId, e.target.value as any)}
                          style={{ padding: '6px' }}
                        >
                          <option value="Driving">Driving</option>
                          <option value="On Duty">On Duty</option>
                          <option value="Sleeper">Sleeper</option>
                          <option value="Off Duty">Off Duty</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: FUEL NETWORK & MAP */}
          {activeTab === 'fuel' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h2 style={{ margin: 0 }}>📍 Nearby Fuel Stops & GPS Telemetry</h2>
                    <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Center: <strong>{locationName}</strong></span>
                  </div>
                  <button 
                    onClick={handleFindGPSLocation}
                    style={{ background: '#22c55e', color: '#000', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    📍 Locate Nearest Fuel (GPS)
                  </button>
                </div>

                <div id="fuel-map-container" style={{ height: '350px', width: '100%', borderRadius: '8px', border: '1px solid #334155' }}></div>

                <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  {nearbyStations.map(st => (
                    <div key={st.id} style={{ border: '1px solid #334155', padding: '12px', borderRadius: '6px', background: '#0f172a' }}>
                      <div style={{ fontWeight: 'bold', color: '#f59e0b' }}>{st.name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{st.address}</div>
                      <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#22c55e', fontWeight: 'bold' }}>${st.dieselPrice.toFixed(2)} / gal</span>
                        <small>{st.distanceMiles} mi away</small>
                      </div>
                      <button 
                        onClick={() => setFuelLocation(st.name + ' - ' + st.address)}
                        style={{ marginTop: '8px', width: '100%', background: '#334155', color: '#fff', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        ⛽ Fill Fuel Here
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="content-grid">
                <div className="card table-card">
                  <h2>Recorded Fuel Purchases</h2>
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Driver</th>
                        <th>Truck</th>
                        <th>Gallons</th>
                        <th>Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fuelEntries.map(f => (
                        <tr key={f.id}>
                          <td>{f.date}</td>
                          <td><strong>{f.driverName}</strong></td>
                          <td>{f.truck}</td>
                          <td>{f.gallons} gal</td>
                          <td><strong style={{ color: '#ef4444' }}>${f.cost.toLocaleString()}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="card form-card">
                  <h2>Log Fuel Purchase</h2>
                  <form onSubmit={handleAddFuel}>
                    <div className="form-group">
                      <label>Driver</label>
                      <select value={fuelDriver} onChange={(e) => setFuelDriver(e.target.value)} required>
                        <option value="">-- Select Driver --</option>
                        {drivers.map(d => <option key={d.id} value={d.name}>{d.name} ({d.truck})</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Gallons Purchased</label>
                      <input type="number" value={gallons} onChange={(e) => setGallons(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Total Cost ($)</label>
                      <input type="number" value={fuelCost} onChange={(e) => setFuelCost(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Location</label>
                      <input type="text" value={fuelLocation} onChange={(e) => setFuelLocation(e.target.value)} placeholder="Select from map or type" required />
                    </div>
                    <button type="submit" className="btn-primary">Save Fuel Entry</button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FINANCIALS & MANUAL RPM CALCULATOR */}
          {activeTab === 'financials' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card" style={{ padding: '20px' }}>
                <h2>💰 Fleet Financial Statement (P&L)</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
                  <div style={{ background: '#0f172a', padding: '15px', borderRadius: '6px' }}>
                    <span style={{ color: '#94a3b8' }}>Total Revenue</span>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#f59e0b' }}>${totalGrossRevenue.toLocaleString()}</div>
                  </div>
                  <div style={{ background: '#0f172a', padding: '15px', borderRadius: '6px' }}>
                    <span style={{ color: '#94a3b8' }}>Fuel Expense</span>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#ef4444' }}>-${totalFuelCost.toLocaleString()}</div>
                  </div>
                  <div style={{ background: '#0f172a', padding: '15px', borderRadius: '6px' }}>
                    <span style={{ color: '#94a3b8' }}>Driver Pay</span>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#ef4444' }}>-${totalDriverPay.toLocaleString()}</div>
                  </div>
                  <div style={{ background: '#0f172a', padding: '15px', borderRadius: '6px' }}>
                    <span style={{ color: '#94a3b8' }}>Net Operating Profit</span>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: netProfit >= 0 ? '#22c55e' : '#ef4444' }}>${netProfit.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Manual RPM Calculator Card */}
              <div className="card" style={{ padding: '20px' }}>
                <h2>🧮 Manual RPM (Rate Per Mile) Calculator</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '15px' }}>
                  Manually enter prospective load metrics to check profitability and RPM instantly.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', alignItems: 'end' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Gross Load Rate ($)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 2500" 
                      value={manualRate} 
                      onChange={(e) => setManualRate(e.target.value)} 
                      style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Total Miles</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 850" 
                      value={manualMiles} 
                      onChange={(e) => setManualMiles(e.target.value)} 
                      style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
                    />
                  </div>
                  <div style={{ background: '#0f172a', padding: '12px 15px', borderRadius: '6px', border: '1px solid #334155', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block' }}>Calculated RPM Result</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
                      {manualRate && manualMiles && parseFloat(manualMiles) > 0 
                        ? `$${(parseFloat(manualRate) / parseFloat(manualMiles)).toFixed(2)} / mi` 
                        : '$0.00 / mi'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: TAX & IFTA */}
          {activeTab === 'tax' && (
            <div className="card" style={{ padding: '20px' }}>
              <h2>🏛️ Administrator Tax & IFTA Estimator</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
                <div style={{ background: '#0f172a', padding: '15px', borderRadius: '6px' }}>
                  <h3>Estimated Income & SE Tax</h3>
                  <p>Total Estimated Liability: <strong style={{ color: '#f59e0b' }}>${totalEstimatedTax.toFixed(2)}</strong></p>
                </div>
                <div style={{ background: '#0f172a', padding: '15px', borderRadius: '6px' }}>
                  <h3>IFTA Fuel Tax Balance</h3>
                  <p>Net Balance Owed/Refund: <strong style={{ color: iftaBalanceOwed >= 0 ? '#ef4444' : '#22c55e' }}>${iftaBalanceOwed.toFixed(2)}</strong></p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: USERS */}
          {activeTab === 'users' && (
            <div className="content-grid">
              <div className="card table-card">
                <h2>System Users</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td><strong>{u.name}</strong></td>
                        <td>{u.email}</td>
                        <td>{u.role}</td>
                        <td>{u.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="card form-card">
                <h2>Add User Account</h2>
                <form onSubmit={handleAddUser}>
                  <div className="form-group">
                    <label>Name</label>
                    <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} required />
                  </div>
                  <button type="submit" className="btn-primary">Create User</button>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Right Marketing / Promo Banner */}
      <aside style={{ width: '180px', background: '#1e293b', borderLeft: '1px solid #334155', padding: '20px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', flexShrink: 0 }}>
        <div>
          <h3 style={{ color: '#22c55e', fontSize: '0.9rem', marginBottom: '10px' }}>🚀 PROMO</h3>
          <p style={{ marginBottom: '15px', lineHeight: '1.4' }}>Upgrade to Dispatch Pro for live freight board integrations.</p>
          <a href="#sponsor2" onClick={(e) => { e.preventDefault(); alert('Right Banner Link Clicked!'); }} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.8rem' }}>Upgrade Now &rarr;</a>
        </div>
        <div style={{ background: '#0f172a', padding: '12px 8px', borderRadius: '6px', border: '1px dashed #475569' }}>
          <span style={{ fontSize: '0.75rem', display: 'block', color: '#cbd5e1' }}>Partner Slot #2</span>
          <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Custom HTML Banner</span>
        </div>
      </aside>

      {/* Driver Performance Modal */}
      {showReportModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', padding: '30px', borderRadius: '8px', width: '90%', maxWidth: '500px', color: '#fff' }}>
            <h2>Driver Performance: {selectedReportDriver}</h2>
            {(() => {
              const rep = getDriverReport(selectedReportDriver);
              return (
                <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>Total Miles: <strong>{rep.miles} mi</strong></div>
                  <div>Gross Generated: <strong style={{ color: '#f59e0b' }}>${rep.gross.toLocaleString()}</strong></div>
                  <div>Driver Pay Earned: <strong>${rep.payEarned.toFixed(2)}</strong></div>
                  <div>Average RPM: <strong>${rep.driverRPM.toFixed(2)}/mi</strong></div>
                </div>
              );
            })()}
            <button 
              onClick={() => setShowReportModal(false)}
              style={{ marginTop: '20px', background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Close Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;