import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { LoadsPage } from '../pages/LoadsPage';
import { DriversPage } from '../pages/DriversPage';
import { EldPage } from '../pages/EldPage';
import { FuelPage } from '../pages/FuelPage';
import { FinancialsPage } from '../pages/FinancialsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { LoadBoardIntegrationPage } from '../pages/LoadBoardIntegrationPage';
import { MarketingBanner } from './MarketingBanner';
import { UserProfileMenu } from './UserProfileMenu';

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

interface EnterpriseDashboardProps {
  loads: Load[];
  drivers: Driver[];
  onAddLoad: (newLoad: Load) => void;
  onUpdateLoadStatus: (id: string, status: Load['status']) => void;
}

export const EnterpriseDashboard: React.FC<EnterpriseDashboardProps> = ({
  loads,
  drivers,
  onAddLoad,
  onUpdateLoadStatus
}) => {
  const [activeTab, setActiveTab] = useState('dispatch');
  const [localDrivers, setLocalDrivers] = useState<Driver[]>(drivers);

  const handleAddDriver = (newDriver: Driver) => {
    setLocalDrivers([newDriver, ...localDrivers]);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#020617', fontFamily: 'sans-serif' }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <UserProfileMenu setActiveTab={setActiveTab} />
        <MarketingBanner />

        {activeTab === 'dispatch' && (
          <LoadsPage 
            loads={loads} 
            drivers={localDrivers} 
            onAddLoad={onAddLoad} 
            onUpdateLoadStatus={onUpdateLoadStatus} 
          />
        )}
        {activeTab === 'drivers' && <DriversPage drivers={localDrivers} onAddDriver={handleAddDriver} />}
        {activeTab === 'eld' && <EldPage drivers={localDrivers} />}
        {activeTab === 'fuel' && <FuelPage />}
        {activeTab === 'financials' && <FinancialsPage />}
        {activeTab === 'settings' && <SettingsPage />}
        {activeTab === 'loadboards' && <LoadBoardIntegrationPage />}
      </main>
    </div>
  );
};

export default EnterpriseDashboard;