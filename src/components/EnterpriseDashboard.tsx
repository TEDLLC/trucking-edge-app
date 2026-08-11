import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { LoadsPage } from '../pages/LoadsPage';
import { DriversPage } from '../pages/DriversPage';
import { EldPage } from '../pages/EldPage';
import { FuelPage } from '../pages/FuelPage';
import { FinancialsPage } from '../pages/FinancialsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { BillingPage } from '../pages/BillingPage';
import { LoadBoardIntegrationPage } from '../pages/LoadBoardIntegrationPage';
import { SupportPage } from '../pages/SupportPage';
import { UserProfileMenu } from './UserProfileMenu';
import { MarketingBanner } from './MarketingBanner';
import { OperationalIntelligenceWidget } from './OperationalIntelligenceWidget';
import { InvoiceAndPodModal } from './InvoiceAndPodModal';
import { DriverReassignmentModal } from './DriverReassignmentModal';
import type { OperationalAlert } from '../services/intelligenceEngine';

export interface Driver {
  id: string;
  name: string;
  truck: string;
  phone: string;
  license: string;
  status: 'Active' | 'On Delivery' | 'Off Duty';
  cdlExpirationDate?: string;
  availableHours?: number;
}

export interface Load {
  id: string;
  origin: string;
  destination: string;
  rate: number;
  miles: number;
  status: 'In Transit' | 'Delivered' | 'Pending' | 'Cancelled';
  driver: string;
  fuelCost: number;
  date: string;
  loadNumber?: string;
  margin?: number;
  hasPod?: boolean;
  targetMargin?: number;
  invoiceStatus?: 'PENDING' | 'GENERATED' | 'OVERDUE';
}

interface EnterpriseDashboardProps {
  loads: Load[];
  drivers: Driver[];
  onAddLoad: (newLoad: Load) => void;
  onUpdateLoadStatus: (id: string, status: any) => void;
}

export const EnterpriseDashboard: React.FC<EnterpriseDashboardProps> = ({
  loads,
  drivers,
  onAddLoad,
  onUpdateLoadStatus
}) => {
  const [activeTab, setActiveTab] = useState('dispatch');
  const [localDrivers, setLocalDrivers] = useState<Driver[]>(drivers);
  const [activeAlert, setActiveAlert] = useState<OperationalAlert | null>(null);
  const [activeDriverAlert, setActiveDriverAlert] = useState<OperationalAlert | null>(null);

  const handleAddDriver = (newDriver: Driver) => {
    setLocalDrivers([newDriver, ...localDrivers]);
  };

  const handleAlertAction = (alert: OperationalAlert) => {
    if (alert.category === 'FINANCIAL') {
      setActiveAlert(alert);
    } else if (alert.category === 'COMPLIANCE' && alert.entityType === 'driver') {
      setActiveDriverAlert(alert);
    } else {
      setActiveTab('drivers');
    }
  };

  const handleModalSuccess = (actionType: 'pod' | 'invoice', entityId: string) => {
    console.log(`Action ${actionType} completed for ${entityId}`);
    setActiveAlert(null);
  };

  const handleDriverReassign = (_newDriverId: string, newDriverName: string) => {
    console.log(`Successfully reassigned trip to ${newDriverName}`);
    setActiveDriverAlert(null);
  };

  const intelligenceDrivers = localDrivers.map(d => ({
    id: d.id,
    name: d.name,
    cdlExpirationDate: d.cdlExpirationDate || '2026-09-15',
    availableHours: d.availableHours ?? 11
  }));

  const intelligenceLoads = loads.map(l => ({
    id: l.id,
    loadNumber: l.loadNumber || l.id,
    status: l.status === 'Delivered' ? 'DELIVERED' : 'IN_TRANSIT',
    margin: l.margin ?? 18,
    hasPod: l.hasPod ?? false,
    targetMargin: l.targetMargin ?? 15,
    invoiceStatus: l.invoiceStatus
  }));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#020617', fontFamily: 'sans-serif' }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <MarketingBanner />
        <UserProfileMenu setActiveTab={setActiveTab} />

        {activeAlert && (
          <InvoiceAndPodModal 
            alert={activeAlert} 
            onClose={() => setActiveAlert(null)} 
            onSuccess={handleModalSuccess} 
          />
        )}

        {activeDriverAlert && (
          <DriverReassignmentModal
            alert={activeDriverAlert}
            availableDrivers={localDrivers.map(d => ({ id: d.id, name: d.name, availableHours: d.availableHours ?? 10 }))}
            onClose={() => setActiveDriverAlert(null)}
            onReassign={handleDriverReassign}
          />
        )}

        <div style={{ marginBottom: '24px' }}>
          <OperationalIntelligenceWidget 
            drivers={intelligenceDrivers}
            loads={intelligenceLoads}
            onActionClick={handleAlertAction}
          />
        </div>

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
        {activeTab === 'billing' && <BillingPage />}
        {activeTab === 'loadboards' && <LoadBoardIntegrationPage />}
        {activeTab === 'support' && <SupportPage />}
      </main>
    </div>
  );
};

export default EnterpriseDashboard;