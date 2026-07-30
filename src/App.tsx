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

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'portal' | 'loads' | 'drivers' | 'eld' | 'fuel' | 'financials' | 'tax' | 'users' | 'customers'>('portal');

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

  const [loadSearch, setLoadSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const [estimatedTaxRate] = useState<string>('25'); 
  const [selfEmploymentTaxRate] = useState<string>('15.3'); 
  const [iftaAvgTaxPerGallon] = useState<string>('0.32'); 
  const [fleetMpg] = useState<string>('6.5'); 

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
  const [brokerName, setBrokerName] = useState('');
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

  // --- CUSTOMER & MC LEASE ONBOARDING FORM STATES ---
  const [newCustCompany, setNewCustCompany] = useState('');
  const [newCustContact, setNewCustContact] = useState('');
  const [newCustMc, setNewCustMc] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustFee, setNewCustFee] = useState('7');
  const [needsMcLease, setNeedsMcLease] = useState(false);
  const [mcLeaseFee, setMcLeaseFee] = useState('20');
  const [agreedTerms, setAgreedTerms] = useState(false);

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
    const parsedRate = parseFloat(rate) || 0;
    const newLoad: Load = {
      id: `TED-${Math.floor(1000 + Math.random() * 9000)}`,
      origin,
      destination,
      driver: driver || 'Unassigned',
      rate: parsedRate,
      miles: parseFloat(miles) || 0,
      fuelCost: 0,
      status: 'Pending',
      date: loadDate,
      brokerName: brokerName || 'Independent Broker'
    };
    
    const newInvoice: Invoice = {
      id: `INV-${Math.floor(3000 + Math.random() * 9000)}`,
      carrierName: brokerName || 'Independent Broker',
      loadReference: newLoad.id,
      loadRate: parsedRate,
      feePercentage: 7,
      invoiceAmount: parsedRate * 0.07,
      status: 'Unpaid',
      created_at: new Date().toISOString().split('T')[0]
    };

    setLoads([newLoad, ...loads]);
    setInvoices([newInvoice, ...invoices]);
    setOrigin(''); setDestination(''); setDriver(''); setRate(''); setMiles(''); setBrokerName('');
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
      drivingHoursLeft: 11.0,
      shiftHoursLeft: 14.0,
      cycleHoursLeft: 70.0
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

  const handleOnboardCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms) {
      alert('Carrier must accept the Dispatch & MC Lease Agreement terms and conditions.');
      return;
    }
    const newCustomer: CustomerClient = {
      id: `CUST-${Math.floor(100 + Math.random() * 900)}`,
      companyName: newCustCompany,
      contactName: newCustContact,
      mcNumber: newCustMc,
      phone: newCustPhone,
      email: newCustEmail,
      dispatchFeePercent: parseFloat(newCustFee) || 7,
      needsMcLease: needsMcLease,
      mcLeaseFeePercent: needsMcLease ? parseFloat(mcLeaseFee) || 20 : 0,
      status: 'Active',
      created_at: new Date().toISOString().split('T')[0]
    };
    setCustomers([newCustomer, ...customers]);
    setNewCustCompany(''); setNewCustContact(''); setNewCustMc(''); setNewCustPhone(''); setNewCustEmail(''); setNewCustFee('7'); setNeedsMcLease(false); setMcLeaseFee('20'); setAgreedTerms(false);
    alert('Customer successfully onboarded with selected dispatch & MC lease agreements!');
  };

  const handleUpdateELD = (driverId: string, newStatus: ELDRecord['status']) => {
    setEldRecords(eldRecords.map(rec => rec.driverId === driverId ? { ...rec, status: newStatus } : rec));
  };

  const downloadInvoicePDF = (inv: Invoice) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Dispatch Invoice #${inv.id}</title></head>
          <body style="font-family: sans-serif; padding: 40px; color: #333;">
            <h2 style="color: #3b82f6;">TRUCKING EDGE DISPATCH SERVICES</h2>
            <hr/>
            <h3>Invoice #${inv.id}</h3>
            <p><strong>Carrier/Broker Billed:</strong> ${inv.carrierName}</p>
            <p><strong>Load Reference:</strong> ${inv.loadReference}</p>
            <p><strong>Load Gross Rate:</strong> $${Number(inv.loadRate).toLocaleString()}</p>
            <p><strong>Agreed Fee (${inv.feePercentage}%):</strong> <strong>$${Number(inv.invoiceAmount).toFixed(2)}</strong></p>
            <p><strong>Status:</strong> ${inv.status}</p>
            <p><strong>Date Issued:</strong> ${new Date(inv.created_at).toLocaleDateString()}</p>
            <br/><br/>
            <p style="font-size: 12px; color: #777;">Thank you for partnering with Trucking Edge Dispatch.</p>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const filteredLoads = loads.filter((load) => {
    const searchString = loadSearch.toLowerCase();
    const matchesSearch = 
      load.origin.toLowerCase().includes(searchString) ||
      load.destination.toLowerCase().includes(searchString) ||
      (load.brokerName && load.brokerName.toLowerCase().includes(searchString)) ||
      load.driver.toLowerCase().includes(searchString) ||
      load.id.toLowerCase().includes(searchString);
    
    const matchesStatus = statusFilter === 'All' || load.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
            <button className={`nav-item ${activeTab === 'portal' ? 'active' : ''}`} onClick={() => setActiveTab('portal')}>
              🚀 Portal Hub & Tools
            </button>
            <button className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}>
              🤝 Customer & MC Lease
            </button>
            <button className={`nav-item ${activeTab === 'loads' ? 'active' : ''}`} onClick={() => setActiveTab('loads')}>
              📋 Dispatch & RPM
            </button>
            <button className={`nav-item ${activeTab === 'drivers' ? 'active' : ''}`} onClick={() => setActiveTab('drivers')}>
              👨‍✈️ Driver Roster & HOS
            </button>
            <button className={`nav-item ${activeTab === 'eld' ? 'active' : ''}`} onClick={() => setActiveTab('eld')}>
              📟 ELD / HOS Logs
            </button>
            <button className={`nav-item ${activeTab === 'fuel' ? 'active' : ''}`} onClick={() => setActiveTab('fuel')}>
              ⛽ Fuel Map & Logs
            </button>
            <button className={`nav-item ${activeTab === 'financials' ? 'active' : ''}`} onClick={() => setActiveTab('financials')}>
              💰 Profit & Loss / Invoices
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
        <main className="main-content" style={{ overflowY: 'auto' }}>
          <header className="header">
            <h1>
              {activeTab === 'portal' && 'Carrier Portal & Tools Hub'}
              {activeTab === 'customers' && 'Carrier Onboarding & MC Lease Program'}
              {activeTab === 'loads' && 'Trucking Edge Dispatch & RPM Center'}
              {activeTab === 'drivers' && 'Fleet Driver Roster & HOS Tracking'}
              {activeTab === 'eld' && 'ELD Hours of Service (HOS) Telemetry'}
              {activeTab === 'fuel' && 'Fuel Network & GPS Station Locator'}
              {activeTab === 'financials' && 'Trucking Edge Profit & Loss & Invoicing'}
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

          {/* TAB 0: PORTAL HUB (USER SUB-COMPONENTS INTEGRATION) */}
          {activeTab === 'portal' && (
            <div className="bg-gray-50 min-h-screen pb-12" style={{ padding: '20px', borderRadius: '8px' }}>
              {/* 1. Guest Interface & Login Page */}
              <LoginPage />

              {/* 2. Official SAFER / MC Search Tool */}
              <div style={{ marginTop: '30px' }}>
                <McSearchWidget />
              </div>

              {/* 3. Carrier Insurance Calculator */}
              <div style={{ marginTop: '30px' }}>
                <InsuranceCalculator />
              </div>

              {/* 4. IFTA Tax Calculator & Document Center */}
              <div style={{ marginTop: '30px' }}>
                <IftaAndDocuments />
              </div>

              {/* 5. ELD Price Comparison Matrix */}
              <div style={{ marginTop: '30px' }}>
                <EldComparison />
              </div>
            </div>
          )}

          {/* TAB 1: CUSTOMER ONBOARDING & MC LEASE */}
          {activeTab === 'customers' && (
            <div className="content-grid">
              <div className="card table-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <h2>Active Onboarded Carriers & MC Lease Clients</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '15px' }}>
                  Carriers under contract and whether they lease under your MC authority (with insurance & ELD covered).
                </p>
                <div style={{ overflowX: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Company Name</th>
                        <th>Contact / MC#</th>
                        <th>Phone / Email</th>
                        <th>Dispatch Fee</th>
                        <th>MC Lease Status</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map(c => (
                        <tr key={c.id}>
                          <td><strong>{c.companyName}</strong><br/><small style={{color: '#94a3b8'}}>Joined: {c.created_at}</small></td>
                          <td>{c.contactName}<br/><strong>{c.mcNumber}</strong></td>
                          <td>{c.phone}<br/><small style={{color: '#94a3b8'}}>{c.email}</small></td>
                          <td><strong style={{ color: '#22c55e' }}>{c.dispatchFeePercent}%</strong></td>
                          <td>
                            {c.needsMcLease ? (
                              <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#3b82f6', color: '#fff', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                Leased on MC ({c.mcLeaseFeePercent}%)
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Own Authority</span>
                            )}
                          </td>
                          <td>
                            <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#166534', color: '#fff', fontSize: '0.75rem', fontWeight: 'bold' }}>
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {customers.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>No customer clients onboarded yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card form-card">
                <h2>🤝 Carrier Onboarding & MC Lease Form</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '15px' }}>
                  Register a new carrier, set dispatch percentage, and opt them into your MC lease program (17%–25% covering insurance & ELD).
                </p>
                <form onSubmit={handleOnboardCustomer}>
                  <div className="form-group">
                    <label>Carrier / Company Name</label>
                    <input type="text" placeholder="e.g. Swift Logistics LLC" value={newCustCompany} onChange={(e) => setNewCustCompany(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Contact Person Name</label>
                    <input type="text" placeholder="e.g. John Doe" value={newCustContact} onChange={(e) => setNewCustContact(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Carrier MC Number / USDOT</label>
                    <input type="text" placeholder="e.g. MC-123456" value={newCustMc} onChange={(e) => setNewCustMc(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="text" placeholder="(555) 019-2831" value={newCustPhone} onChange={(e) => setNewCustPhone(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" placeholder="dispatcher@carrier.com" value={newCustEmail} onChange={(e) => setNewCustEmail(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Dispatch Fee Percentage (%)</label>
                    <input type="number" step="0.5" value={newCustFee} onChange={(e) => setNewCustFee(e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                    <input type="checkbox" id="mcLeaseCheck" checked={needsMcLease} onChange={(e) => setNeedsMcLease(e.target.checked)} style={{ width: '18px', height: '18px' }} />
                    <label htmlFor="mcLeaseCheck" style={{ margin: 0, cursor: 'pointer' }}>Needs MC Lease Program (Covers Insurance & ELD)</label>
                  </div>
                  {needsMcLease && (
                    <div className="form-group" style={{ marginTop: '10px' }}>
                      <label>MC Lease Fee Percentage (%) [Default: 20%]</label>
                      <input type="number" step="0.5" value={mcLeaseFee} onChange={(e) => setMcLeaseFee(e.target.value)} />
                    </div>
                  )}
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                    <input type="checkbox" id="termsCheck" checked={agreedTerms} onChange={(e) => setAgreedTerms(e.target.checked)} style={{ width: '18px', height: '18px' }} required />
                    <label htmlFor="termsCheck" style={{ margin: 0, cursor: 'pointer', fontSize: '0.8rem' }}>Carrier agrees to Limited Power of Attorney & Dispatch Agreement.</label>
                  </div>
                  <button type="submit" className="btn" style={{ width: '100%', marginTop: '15px' }}>Complete Onboarding</button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: LOADS & DISPATCH */}
          {activeTab === 'loads' && (
            <div className="content-grid">
              <div className="card table-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="Search origin, destination, broker..." 
                    value={loadSearch} 
                    onChange={(e) => setLoadSearch(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff', width: '240px' }}
                  />
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Load ID</th>
                        <th>Broker</th>
                        <th>Route</th>
                        <th>Assigned Driver</th>
                        <th>Rate / RPM</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLoads.map(load => {
                        const rpm = load.miles > 0 ? (load.rate / load.miles).toFixed(2) : '0.00';
                        return (
                          <tr key={load.id}>
                            <td><strong>{load.id}</strong><br/><small style={{color: '#94a3b8'}}>{load.date}</small></td>
                            <td>{load.brokerName}</td>
                            <td>{load.origin} &rarr; {load.destination}<br/><small style={{color: '#94a3b8'}}>{load.miles} mi</small></td>
                            <td>{load.driver}</td>
                            <td><strong style={{color: '#22c55e'}}>${load.rate}</strong><br/><small style={{color: '#94a3b8'}}>${rpm}/mi</small></td>
                            <td>
                              <span style={{ 
                                padding: '4px 8px', 
                                borderRadius: '4px', 
                                fontSize: '0.75rem', 
                                fontWeight: 'bold',
                                background: load.status === 'Delivered' ? '#166534' : load.status === 'In Transit' ? '#1e40af' : '#854d0e',
                                color: '#fff'
                              }}>
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

              <div className="card form-card">
                <h2>➕ Book & Dispatch New Load</h2>
                <form onSubmit={handleAddLoad}>
                  <div className="form-group">
                    <label>Origin (City, ST)</label>
                    <input type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Chicago, IL" required />
                  </div>
                  <div className="form-group">
                    <label>Destination (City, ST)</label>
                    <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Dallas, TX" required />
                  </div>
                  <div className="form-group">
                    <label>Broker / Shipper Name</label>
                    <input type="text" value={brokerName} onChange={(e) => setBrokerName(e.target.value)} placeholder="TQL Logistics" />
                  </div>
                  <div className="form-group">
                    <label>Assigned Driver</label>
                    <select value={driver} onChange={(e) => setDriver(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}>
                      <option value="">Unassigned</option>
                      {drivers.map(d => <option key={d.id} value={d.name}>{d.name} ({d.truck})</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Gross Load Rate ($)</label>
                    <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="2500" required />
                  </div>
                  <div className="form-group">
                    <label>Total Miles</label>
                    <input type="number" value={miles} onChange={(e) => setMiles(e.target.value)} placeholder="950" required />
                  </div>
                  <button type="submit" className="btn" style={{ width: '100%', marginTop: '10px' }}>Dispatch Load & Generate Invoice</button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: DRIVERS & HOS */}
          {activeTab === 'drivers' && (
            <div className="content-grid">
              <div className="card table-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <h2>Fleet Driver Roster & HOS Hours</h2>
                <div style={{ overflowX: 'auto', marginTop: '10px' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Driver Name</th>
                        <th>Phone</th>
                        <th>Truck Assigned</th>
                        <th>Pay Rate</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drivers.map(drv => (
                        <tr key={drv.id}>
                          <td><strong>{drv.name}</strong></td>
                          <td>{drv.phone}</td>
                          <td>{drv.truck}</td>
                          <td>${drv.payPerMile.toFixed(2)}/mi</td>
                          <td>
                            <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#3b82f6', color: '#fff', fontSize: '0.75rem', fontWeight: 'bold' }}>
                              {drv.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card form-card">
                <h2>👨‍✈️ Add New Driver</h2>
                <form onSubmit={handleAddDriver}>
                  <div className="form-group">
                    <label>Driver Full Name</label>
                    <input type="text" value={driverName} onChange={(e) => setDriverName(e.target.value)} placeholder="Michael Scott" required />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="text" value={driverPhone} onChange={(e) => setDriverPhone(e.target.value)} placeholder="(555) 123-4567" required />
                  </div>
                  <div className="form-group">
                    <label>Assigned Truck Unit</label>
                    <input type="text" value={driverTruck} onChange={(e) => setDriverTruck(e.target.value)} placeholder="Truck #410" required />
                  </div>
                  <button type="submit" className="btn" style={{ width: '100%', marginTop: '10px' }}>Register Driver</button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: ELD / HOS TELEMETRY */}
          {activeTab === 'eld' && (
            <div className="content-grid">
              <div className="card table-card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column' }}>
                <h2>📟 FMCSA ELD Compliance & HOS Status Monitor</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '15px' }}>
                  Real-time electronic logging device tracking for driving limits, shift hours, and 70-hour / 8-day cycle clocks.
                </p>
                <div style={{ overflowX: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Driver Name</th>
                        <th>Current Duty Status</th>
                        <th>Drive Time Left</th>
                        <th>Shift Hours Left</th>
                        <th>Cycle 70h Left</th>
                        <th>Quick Status Override</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eldRecords.map(rec => (
                        <tr key={rec.driverId}>
                          <td><strong>{rec.driverName}</strong></td>
                          <td>
                            <span style={{ 
                              padding: '4px 8px', 
                              borderRadius: '4px', 
                              fontSize: '0.75rem', 
                              fontWeight: 'bold',
                              background: rec.status === 'Driving' ? '#166534' : rec.status === 'On Duty' ? '#1e40af' : '#64748b',
                              color: '#fff'
                            }}>
                              {rec.status}
                            </span>
                          </td>
                          <td>{rec.driveTimeRemaining} hrs</td>
                          <td>{rec.dutyTimeRemaining} hrs</td>
                          <td>{rec.cycleRemaining} hrs</td>
                          <td>
                            <div style={{ display: 'flex', gap: '5px' }}>
                              <button onClick={() => handleUpdateELD(rec.driverId, 'Driving')} style={{ padding: '4px 8px', background: '#166534', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Drive</button>
                              <button onClick={() => handleUpdateELD(rec.driverId, 'On Duty')} style={{ padding: '4px 8px', background: '#1e40af', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>On Duty</button>
                              <button onClick={() => handleUpdateELD(rec.driverId, 'Sleeper')} style={{ padding: '4px 8px', background: '#854d0e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Sleeper</button>
                              <button onClick={() => handleUpdateELD(rec.driverId, 'Off Duty')} style={{ padding: '4px 8px', background: '#475569', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Off Duty</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FUEL MAP & LOGS */}
          {activeTab === 'fuel' && (
            <div className="content-grid">
              <div className="card table-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h2>⛽ GPS Station Locator & Fuel Prices</h2>
                  <button onClick={handleFindGPSLocation} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>
                    📍 Use Current GPS Location
                  </button>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '10px' }}>Current Region: {locationName}</p>
                <div id="fuel-map-container" style={{ width: '100%', height: '320px', borderRadius: '6px', border: '1px solid #334155', marginBottom: '15px' }}></div>
                
                <h3>Recent Fuel Purchases</h3>
                <div style={{ overflowX: 'auto', marginTop: '10px' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Driver & Truck</th>
                        <th>Location</th>
                        <th>Gallons</th>
                        <th>Total Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fuelEntries.map(f => (
                        <tr key={f.id}>
                          <td>{f.date}</td>
                          <td>{f.driverName}<br/><small style={{color: '#94a3b8'}}>{f.truck}</small></td>
                          <td>{f.location}</td>
                          <td>{f.gallons} gal</td>
                          <td><strong style={{color: '#f59e0b'}}>${f.cost}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card form-card">
                <h2>⛽ Log Fuel Purchase</h2>
                <form onSubmit={handleAddFuel}>
                  <div className="form-group">
                    <label>Driver Name</label>
                    <select value={fuelDriver} onChange={(e) => setFuelDriver(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} required>
                      <option value="">Select Driver</option>
                      {drivers.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Gallons Purchased</label>
                    <input type="number" step="0.1" value={gallons} onChange={(e) => setGallons(e.target.value)} placeholder="110" required />
                  </div>
                  <div className="form-group">
                    <label>Total Cost ($)</label>
                    <input type="number" step="0.01" value={fuelCost} onChange={(e) => setFuelCost(e.target.value)} placeholder="415.50" required />
                  </div>
                  <div className="form-group">
                    <label>Station Name & Location</label>
                    <input type="text" value={fuelLocation} onChange={(e) => setFuelLocation(e.target.value)} placeholder="Love's #310 - St. Louis, MO" required />
                  </div>
                  <button type="submit" className="btn" style={{ width: '100%', marginTop: '10px' }}>Log Fuel Entry</button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 6: PROFIT & LOSS / INVOICES */}
          {activeTab === 'financials' && (
            <div className="content-grid">
              <div className="card table-card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column' }}>
                <h2>💰 Profit & Loss Statement & Dispatch Invoices</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', margin: '15px 0' }}>
                  <div style={{ background: '#1e293b', padding: '15px', borderRadius: '6px', border: '1px solid #334155' }}>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Gross Revenue</span>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#f59e0b' }}>${totalGrossRevenue.toLocaleString()}</div>
                  </div>
                  <div style={{ background: '#1e293b', padding: '15px', borderRadius: '6px', border: '1px solid #334155' }}>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Fuel Expense</span>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#ef4444' }}>-${totalFuelCost.toLocaleString()}</div>
                  </div>
                  <div style={{ background: '#1e293b', padding: '15px', borderRadius: '6px', border: '1px solid #334155' }}>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Driver Pay Expense</span>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#ef4444' }}>-${totalDriverPay.toLocaleString()}</div>
                  </div>
                  <div style={{ background: '#1e293b', padding: '15px', borderRadius: '6px', border: '1px solid #334155' }}>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Net Operating Profit</span>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: netProfit >= 0 ? '#22c55e' : '#ef4444' }}>${netProfit.toLocaleString()}</div>
                  </div>
                </div>

                <h3 style={{ marginTop: '20px' }}>Dispatch Invoices</h3>
                <div style={{ overflowX: 'auto', marginTop: '10px' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Invoice ID</th>
                        <th>Carrier / Broker</th>
                        <th>Load Ref</th>
                        <th>Gross Rate</th>
                        <th>Fee Amount</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map(inv => (
                        <tr key={inv.id}>
                          <td><strong>{inv.id}</strong><br/><small style={{color: '#94a3b8'}}>{inv.created_at}</small></td>
                          <td>{inv.carrierName}</td>
                          <td>{inv.loadReference}</td>
                          <td>${Number(inv.loadRate).toLocaleString()}</td>
                          <td><strong style={{color: '#22c55e'}}>${Number(inv.invoiceAmount).toFixed(2)}</strong> ({inv.feePercentage}%)</td>
                          <td>
                            <span style={{ padding: '4px 8px', borderRadius: '4px', background: inv.status === 'Paid' ? '#166534' : '#854d0e', color: '#fff', fontSize: '0.75rem', fontWeight: 'bold' }}>
                              {inv.status}
                            </span>
                          </td>
                          <td>
                            <button onClick={() => downloadInvoicePDF(inv)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                              Print / PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: ADMIN TAX & IFTA */}
          {activeTab === 'tax' && (
            <div className="content-grid">
              <div className="card table-card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column' }}>
                <h2>🏛️ Administrator Tax & IFTA Calculator Center</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '20px' }}>
                  Calculate quarterly IFTA fuel tax obligations and estimated federal / self-employment tax reserves based on net operational profit.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', border: '1px solid #334155' }}>
                    <h3 style={{ color: '#f59e0b', marginBottom: '15px' }}>Quarterly IFTA Tax Estimate</h3>
                    <p style={{ fontSize: '0.9rem', marginBottom: '10px' }}>Total Gallons Purchased: <strong>{totalGallonsPurchased} gal</strong></p>
                    <p style={{ fontSize: '0.9rem', marginBottom: '10px' }}>Estimated Fleet MPG: <strong>{fleetMpg} MPG</strong></p>
                    <p style={{ fontSize: '0.9rem', marginBottom: '10px' }}>Total Calculated Miles: <strong>{totalMilesDriven} mi</strong></p>
                    <hr style={{ borderColor: '#334155', margin: '15px 0' }}/>
                    <p style={{ fontSize: '1rem' }}>Estimated Net Tax Due: <strong style={{ color: '#22c55e' }}>${(totalGallonsPurchased * parseFloat(iftaAvgTaxPerGallon)).toFixed(2)}</strong></p>
                  </div>

                  <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', border: '1px solid #334155' }}>
                    <h3 style={{ color: '#3b82f6', marginBottom: '15px' }}>Income & Self-Employment Tax Reserve</h3>
                    <p style={{ fontSize: '0.9rem', marginBottom: '10px' }}>Net Operating Profit: <strong>${netProfit.toLocaleString()}</strong></p>
                    <p style={{ fontSize: '0.9rem', marginBottom: '10px' }}>Est. Federal Income Tax ({estimatedTaxRate}%): <strong>${(netProfit * (parseFloat(estimatedTaxRate) / 100)).toFixed(2)}</strong></p>
                    <p style={{ fontSize: '0.9rem', marginBottom: '10px' }}>Self-Employment Tax ({selfEmploymentTaxRate}%): <strong>${(netProfit * (parseFloat(selfEmploymentTaxRate) / 100)).toFixed(2)}</strong></p>
                    <hr style={{ borderColor: '#334155', margin: '15px 0' }}/>
                    <p style={{ fontSize: '1rem' }}>Total Recommended Tax Reserve: <strong style={{ color: '#f59e0b' }}>${(netProfit * ((parseFloat(estimatedTaxRate) + parseFloat(selfEmploymentTaxRate)) / 100)).toFixed(2)}</strong></p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: USERS & ACCESS ROLES */}
          {activeTab === 'users' && (
            <div className="content-grid">
              <div className="card table-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <h2>👥 System Access Roles</h2>
                <div style={{ overflowX: 'auto', marginTop: '10px' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>User Name</th>
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
                          <td>
                            <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#3b82f6', color: '#fff', fontSize: '0.75rem', fontWeight: 'bold' }}>
                              {u.role}
                            </span>
                          </td>
                          <td>
                            <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#166534', color: '#fff', fontSize: '0.75rem', fontWeight: 'bold' }}>
                              {u.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card form-card">
                <h2>👤 Add New System User</h2>
                <form onSubmit={handleAddUser}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Jane Dispatcher" required />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} placeholder="jane@truckingedge.com" required />
                  </div>
                  <button type="submit" className="btn" style={{ width: '100%', marginTop: '10px' }}>Add User Account</button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}