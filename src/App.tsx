import React, { useState } from 'react';
import { LandingPage } from './pages/LandingPage';
import { EnterpriseDashboard } from './components/EnterpriseDashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loads, setLoads] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);

  const handleAddLoad = (newLoad: any) => {
    setLoads((prev) => [...prev, newLoad]);
  };

  const handleUpdateLoadStatus = (id: string, status: string) => {
    setLoads((prev) => prev.map((l: any) => l.id === id ? { ...l, status } : l));
  };

  if (isLoggedIn) {
    return (
      <EnterpriseDashboard 
        loads={loads}
        drivers={drivers}
        onAddLoad={handleAddLoad}
        onUpdateLoadStatus={handleUpdateLoadStatus}
      />
    );
  }

  return (
    <LandingPage onLoginSuccess={() => setIsLoggedIn(true)} />
  );
}

export default App;