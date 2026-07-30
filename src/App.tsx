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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'loads' | 'drivers' | 'eld' | 'fuel' | 'financials' | 'tax' | 'users' | 'customers'>('customers');

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

          {/* TAB 0: CUSTOMER ONBOARDING & MC LEASE */}
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
                    <input type="email" placeholder="carrier@company.com" value={newCustEmail} onChange={(e) => setNewCustEmail(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Dispatch Fee Percentage (%)</label>
                    <select value={newCustFee} onChange={(e) => setNewCustFee(e.target.value)} className="status-select" required>
                      <option value="5">5% (Volume Rate)</option>
                      <option value="6">6%</option>
                      <option value="7">7% (Standard Dispatch)</option>
                      <option value="8">8%</option>
                      <option value="10">10% (Full Service)</option>
                    </select>
                  </div>

                  {/* MC Lease Toggle Section (17% - 25%) */}
                  <div style={{ background: '#0f172a', padding: '14px', borderRadius: '6px', border: '1px solid #334155', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: needsMcLease ? '10px' : '0' }}>
                      <input 
                        type="checkbox" 
                        id="mcLeaseToggle" 
                        checked={needsMcLease} 
                        onChange={(e) => setNeedsMcLease(e.target.checked)} 
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <label htmlFor="mcLeaseToggle" style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#f59e0b', cursor: 'pointer' }}>
                        Carrier needs MC Lease-On Program (Run under our MC authority)
                      </label>
                    </div>

                    {needsMcLease && (
                      <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #334155' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem' }}>MC Lease Fee Percentage (%) [Covers Insurance & ELD]</label>
                        <select value={mcLeaseFee} onChange={(e) => setMcLeaseFee(e.target.value)} className="status-select">
                          <option value="17">17% (Basic Lease)</option>
                          <option value="18">18%</option>
                          <option value="20">20% (Standard Lease)</option>
                          <option value="22">22%</option>
                          <option value="25">25% (Full Comprehensive Authority)</option>
                        </select>
                        <small style={{ color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                          Includes primary liability, cargo insurance, and ELD provision.
                        </small>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                    <input 
                      type="checkbox" 
                      id="termsCheck" 
                      checked={agreedTerms} 
                      onChange={(e) => setAgreedTerms(e.target.checked)} 
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      required
                    />
                    <label htmlFor="termsCheck" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                      Carrier agrees to Dispatch & MC Lease percentage agreement terms.
                    </label>
                  </div>

                  <button type="submit" className="btn-primary">Onboard Carrier & Setup Program</button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 1: DISPATCH & LOADS WITH SEARCH & FILTERS */}
          {activeTab === 'loads' && (
            <div className="content-grid">
              <div className="card table-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <h2>Active Dispatches</h2>
                
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                  <input 
                    placeholder="🔍 Search loads by origin, destination, broker, driver..." 
                    value={loadSearch} 
                    onChange={(e) => setLoadSearch(e.target.value)} 
                    style={{ flex: 2, padding: '8px', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} 
                  />
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)} 
                    style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
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
                        <th>Miles</th>
                        <th>Gross Rate</th>
                        <th>RPM</th>
                        <th>Driver</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLoads.map(l => {
                        const rpm = l.miles > 0 ? (l.rate / l.miles).toFixed(2) : 'N/A';
                        return (
                          <tr key={l.id}>
                            <td><strong>{l.id}</strong></td>
                            <td>{l.brokerName || 'Broker'}</td>
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
                      {filteredLoads.length === 0 && (
                        <tr>
                          <td colSpan={8} style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>No loads match your search criteria.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card form-card">
                <h2>Book New Freight</h2>
                <form onSubmit={handleAddLoad}>
                  <div className="form-group">
                    <label>Broker / Shipper Name</label>
                    <input type="text" placeholder="e.g. TQL Logistics" value={brokerName} onChange={(e) => setBrokerName(e.target.value)} />
                  </div>
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

          {/* TAB 2: DRIVERS & HOS TRACKER */}
          {activeTab === 'drivers' && (
            <div className="content-grid">
              <div className="card table-card">
                <h2>Driver Roster & HOS Hours Tracker</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Driver</th>
                      <th>Phone / Truck</th>
                      <th>Pay Rate</th>
                      <th>Status</th>
                      <th>Live HOS Tracking (Motive/Samsara synced)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.map(d => (
                      <tr key={d.id}>
                        <td><strong>{d.name}</strong></td>
                        <td>{d.phone} | {d.truck}</td>
                        <td>${d.payPerMile.toFixed(2)}/mi</td>
                        <td><strong>{d.status}</strong></td>
                        <td>
                          <div style={{ fontSize: '12px', background: '#0f172a', padding: '6px 10px', borderRadius: '4px', border: '1px solid #334155', display: 'flex', gap: '15px' }}>
                            <span>🚗 <strong>Drive Left:</strong> {d.drivingHoursLeft ?? 11} hrs</span>
                            <span>⏰ <strong>Shift Left:</strong> {d.shiftHoursLeft ?? 14} hrs</span>
                            <span>📅 <strong>70-Hr Cycle:</strong> {d.cycleHoursLeft ?? 70} hrs</span>
                          </div>
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
                          style={{ padding: '6px', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }}
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
                    <h2 style={{ margin: 0 }}>📍 Nearby Fuel Network & GPS Locator</h2>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>Current Center: {locationName}</p>
                  </div>
                  <button onClick={handleFindGPSLocation} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                    🛰️ Use My GPS Position
                  </button>
                </div>
                <div id="fuel-map-container" style={{ width: '100%', height: '350px', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b' }}></div>
              </div>

              <div className="content-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="card table-card">
                  <h2>Fuel Purchase History</h2>
                  <table>
                    <thead>
                      <tr>
                        <th>Driver</th>
                        <th>Truck</th>
                        <th>Gallons</th>
                        <th>Cost</th>
                        <th>Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fuelEntries.map(f => (
                        <tr key={f.id}>
                          <td><strong>{f.driverName}</strong></td>
                          <td>{f.truck}</td>
                          <td>{f.gallons} gal</td>
                          <td>${f.cost.toFixed(2)}</td>
                          <td>{f.location}</td>
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
                      <select value={fuelDriver} onChange={(e) => setFuelDriver(e.target.value)} className="status-select" required>
                        <option value="">Select Driver</option>
                        {drivers.map(d => <option key={d.id} value={d.name}>{d.name} ({d.truck})</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Gallons</label>
                      <input type="number" step="0.1" placeholder="120" value={gallons} onChange={(e) => setGallons(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Total Cost ($)</label>
                      <input type="number" step="0.01" placeholder="450.00" value={fuelCost} onChange={(e) => setFuelCost(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Location / Truck Stop</label>
                      <input type="text" placeholder="Love's #310 - St. Louis, MO" value={fuelLocation} onChange={(e) => setFuelLocation(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn-primary">Record Fuel</button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FINANCIALS & PDF INVOICES */}
          {activeTab === 'financials' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="stat-card">
                  <span className="label">Total Revenue</span>
                  <div className="value" style={{ color: '#f59e0b' }}>${totalGrossRevenue.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                  <span className="label">Total Fleet Expenses</span>
                  <div className="value" style={{ color: '#ef4444' }}>${totalExpenses.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                  <span className="label">Net Operating Profit</span>
                  <div className="value" style={{ color: netProfit >= 0 ? '#22c55e' : '#ef4444' }}>${netProfit.toLocaleString()}</div>
                </div>
              </div>

              <div className="card table-card">
                <h2>🖨️ Dispatch Invoices & Printable PDFs</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Invoice ID</th>
                      <th>Carrier / Broker</th>
                      <th>Load Ref</th>
                      <th>Gross Rate</th>
                      <th>Dispatch Fee</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(inv => (
                      <tr key={inv.id}>
                        <td><strong>{inv.id}</strong></td>
                        <td>{inv.carrierName}</td>
                        <td>{inv.loadReference}</td>
                        <td>${inv.loadRate.toLocaleString()}</td>
                        <td><strong style={{ color: '#22c55e' }}>${inv.invoiceAmount.toFixed(2)}</strong></td>
                        <td>
                          <select 
                            value={inv.status} 
                            onChange={(e) => setInvoices(invoices.map(i => i.id === inv.id ? { ...i, status: e.target.value as any } : i))}
                            style={{ padding: '4px', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }}
                          >
                            <option value="Unpaid">Unpaid</option>
                            <option value="Paid">Paid</option>
                          </select>
                        </td>
                        <td>
                          <button onClick={() => downloadInvoicePDF(inv)} style={{ fontSize: '12px', padding: '6px 12px', background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>
                            🖨️ Print / Download PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: ADMIN TAX & IFTA */}
          {activeTab === 'tax' && (
            <div className="card table-card">
              <h2>🏛️ Administrator Tax & IFTA Center</h2>
              <p style={{ color: '#94a3b8', marginBottom: '20px' }}>Automated quarterly IFTA fuel tax estimates and federal tax projections based on real fleet telematics.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ background: '#0f172a', padding: '20px', borderRadius: '8px', border: '1px solid #334155' }}>
                  <h3 style={{ color: '#f59e0b', marginTop: 0 }}>Quarterly IFTA Fuel Tax Estimate</h3>
                  <p>Total Miles Driven: <strong>{totalMilesDriven.toLocaleString()} mi</strong></p>
                  <p>Total Gallons Purchased: <strong>{totalGallonsPurchased.toLocaleString()} gal</strong></p>
                  <p>Fleet Average MPG: <strong>{fleetMpg} MPG</strong></p>
                  <hr style={{ borderColor: '#334155' }}/>
                  <p style={{ fontSize: '1.1rem' }}>Estimated IFTA Net Due: <strong style={{ color: '#22c55e' }}>${Math.abs((totalMilesDriven / parseFloat(fleetMpg) * parseFloat(iftaAvgTaxPerGallon)) - (totalGallonsPurchased * parseFloat(iftaAvgTaxPerGallon))).toFixed(2)}</strong></p>
                </div>

                <div style={{ background: '#0f172a', padding: '20px', borderRadius: '8px', border: '1px solid #334155' }}>
                  <h3 style={{ color: '#3b82f6', marginTop: 0 }}>Annual Tax Liability Projections</h3>
                  <p>Net Operating Profit: <strong>${netProfit.toLocaleString()}</strong></p>
                  <p>Estimated Income Tax ({estimatedTaxRate}%): <strong>${(netProfit > 0 ? netProfit * (parseFloat(estimatedTaxRate) / 100) : 0).toFixed(2)}</strong></p>
                  <p>Self-Employment Tax ({selfEmploymentTaxRate}%): <strong>${(netProfit > 0 ? netProfit * (parseFloat(selfEmploymentTaxRate) / 100) : 0).toFixed(2)}</strong></p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: USERS & ROLES */}
          {activeTab === 'users' && (
            <div className="content-grid">
              <div className="card table-card">
                <h2>Fleet Access Roles</h2>
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
                        <td><strong>{u.status}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="card form-card">
                <h2>Add System User</h2>
                <form onSubmit={handleAddUser}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" placeholder="Jane Doe" value={userName} onChange={(e) => setUserName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" placeholder="jane@truckingedge.com" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} required />
                  </div>
                  <button type="submit" className="btn-primary">Create User</button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;