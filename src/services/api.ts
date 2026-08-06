// --- TYPES ---
export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  status: string;
}

export interface Truck {
  id: string;
  truckNumber: string;
  make: string;
  model: string;
  year: number;
  vin: string;
}

export interface Load {
  id: string;
  loadNumber: string;
  shipper: string;
  origin: string;
  destination: string;
  rate: number;
  status: string;
  driverId?: string;
  driver?: Driver;
  truckId?: string;
  truck?: Truck;
  pickupDate: string;
  deliveryDate: string;
}

export interface FuelLog {
  id: string;
  truckNumber: string;
  gallons: number;
  totalCost: number;
  location: string;
  date: string;
}

export interface EldLog {
  id: string;
  driverName: string;
  status: string;
  location: string;
  hours: number;
  date: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  expenses: Expense[];
}

// --- DRIVERS API ---
export async function getDrivers(): Promise<Driver[]> {
  try {
    const res = await fetch('/api/drivers');
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function createDriver(data: Omit<Driver, 'id'>): Promise<Driver | null> {
  try {
    const res = await fetch('/api/drivers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// --- LOADS API ---
export async function getLoads(): Promise<Load[]> {
  try {
    const res = await fetch('/api/loads');
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function createLoad(data: any): Promise<Load | null> {
  try {
    const res = await fetch('/api/loads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function updateLoadStatus(id: string, status: string): Promise<Load | null> {
  try {
    const res = await fetch(`/api/loads/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// --- FUEL API ---
export async function getFuelLogs(): Promise<FuelLog[]> {
  try {
    const res = await fetch('/api/fuel');
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function createFuelLog(data: Omit<FuelLog, 'id'>): Promise<FuelLog | null> {
  try {
    const res = await fetch('/api/fuel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// --- ELD API ---
export async function getEldLogs(): Promise<EldLog[]> {
  try {
    const res = await fetch('/api/eld');
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function createEldLog(data: Omit<EldLog, 'id'>): Promise<EldLog | null> {
  try {
    const res = await fetch('/api/eld', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// --- FINANCIALS API ---
export async function getFinancials(): Promise<FinancialSummary | null> {
  try {
    const res = await fetch('/api/financials');
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function createExpense(data: Omit<Expense, 'id'>): Promise<Expense | null> {
  try {
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}