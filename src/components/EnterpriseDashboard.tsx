import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { LoadsPage } from '../pages/LoadsPage';
import { DriversPage } from '../pages/DriversPage';
import { EldPage } from '../pages/EldPage';
import { FuelPage } from '../pages/FuelPage';
import { FinancialsPage } from '../pages/FinancialsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { LoadBoardIntegrationPage } from '../pages/LoadBoardIntegrationPage';

interface Driver {
  id: string;
  name: string;
  truck: string;
  phone: string;
  license: string;
  status: 'Active' | 'On Delivery' | 'Off Duty';
}

interface Load {
  id: string;
  origin: string;
  destination: string;
  rate: number;
  miles: number;
  status: 'In Transit' | 'Delivered' | 'Pending' | 'Cancelled';
  driver: string;
  fuelCost: number;
  date: string;
}

export const EnterpriseDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dispatch');

  const [drivers, setDrivers] = useState<Driver[]>([
    { id: 'DRV-1', name: 'John Doe', truck: 'Freightliner #12', phone: '555-0192', license: 'CDL-99482', status: 'Active' },
    { id: 'DRV-2', name: 'Mike Smith', truck: 'Peterbilt #05', phone: '555-0144', license: 'CDL-11823', status: 'Active' },
  ]);

  const [loads, setLoads] = useState<Load[]>([
    { id: 'LD-8812', origin: 'Chicago, IL', destination: 'Atlanta, GA', rate: 2850, miles: 900, status: 'Pending', driver: 'John Doe', fuelCost: 450, date: '2026-08-01' },
    { id: 'LD-8813', origin: 'Dallas, TX', destination: 'Denver, CO', rate: 2400, miles: 800, status: 'In Transit', driver: 'Mike Smith', fuelCost: 380, date: '2026-08-02' }
  ]);

  const handleAddDriver = (newDriver: Driver) => {
    setDrivers([newDriver, ...drivers]);
  };

  const handleAddLoad = (newLoad: Load) => {
    setLoads([newLoad, ...loads]);
  };

  const handleUpdateLoadStatus = (id: string, status: Load['status']) => {
    setLoads(loads.map(l => l.id === id ? { ...l, status } : l));
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#020617', fontFamily: 'sans-serif' }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {activeTab === 'dispatch' && (
          <LoadsPage 
            loads={loads} 
            drivers={drivers} 
            onAddLoad={handleAddLoad} 
            onUpdateLoadStatus={handleUpdateLoadStatus} 
          />
        )}
        {activeTab === 'drivers' && <DriversPage drivers={drivers} onAddDriver={handleAddDriver} />}
        {activeTab === 'eld' && <EldPage drivers={drivers} />}
        {activeTab === 'fuel' && <FuelPage />}
        {activeTab === 'financials' && <FinancialsPage />}
        {activeTab === 'settings' && <SettingsPage />}
        {activeTab === 'loadboards' && <LoadBoardIntegrationPage />}
      </main>
    </div>
  );
};

export default EnterpriseDashboard;