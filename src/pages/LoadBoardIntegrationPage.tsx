import React, { useState } from 'react';

interface FreeLoad {
  id: string;
  source: string;
  origin: string;
  destination: string;
  equipment: string;
  rate: number;
  miles: number;
  rpm: number;
}

export const LoadBoardIntegrationPage: React.FC = () => {
  const [datApiKey, setDatApiKey] = useState('');
  const [truckstopApiKey, setTruckstopApiKey] = useState('');
  const [load123Key, setLoad123Key] = useState('');
  const [saved, setSaved] = useState(false);
  const [bookedMessage, setBookedMessage] = useState<string | null>(null);

  // Search input states
  const [searchOrigin, setSearchOrigin] = useState('');
  const [searchDestination, setSearchDestination] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('All');

  // Mock live free public feed loads spanning major equipment types
  const [publicLoads, setPublicLoads] = useState<FreeLoad[]>([
    { id: 'PUB-101', source: 'Direct Shipper Feed', origin: 'Chicago, IL', destination: 'Columbus, OH', equipment: 'Dry Van', rate: 1450, miles: 350, rpm: 4.14 },
    { id: 'PUB-102', source: 'Open Community Board', origin: 'Atlanta, GA', destination: 'Charlotte, NC', equipment: 'Reefer', rate: 1100, miles: 245, rpm: 4.49 },
    { id: 'PUB-103', source: 'Direct Shipper Feed', origin: 'Dallas, TX', destination: 'Houston, TX', equipment: 'Hotshot', rate: 950, miles: 240, rpm: 3.95 },
    { id: 'PUB-104', source: 'Open Community Board', origin: 'Los Angeles, CA', destination: 'Phoenix, AZ', equipment: 'Flatbed', rate: 1600, miles: 370, rpm: 4.32 },
    { id: 'PUB-105', source: 'Direct Shipper Feed', origin: 'Denver, CO', destination: 'Salt Lake City, UT', equipment: 'Box Truck', rate: 1350, miles: 520, rpm: 2.60 },
    { id: 'PUB-106', source: 'Open Community Board', origin: 'St. Louis, MO', destination: 'Memphis, TN', equipment: 'Power Only', rate: 850, miles: 280, rpm: 3.03 },
    { id: 'PUB-107', source: 'Direct Shipper Feed', origin: 'Miami, FL', destination: 'Jacksonville, FL', equipment: 'Others', rate: 750, miles: 340, rpm: 2.20 },
  ]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleBookLoad = (load: FreeLoad) => {
    setBookedMessage(`Successfully booked load ${load.id} from ${load.origin} to ${load.destination}! Added to your dispatch queue.`);
    setPublicLoads(publicLoads.filter(l => l.id !== load.id));
    setTimeout(() => setBookedMessage(null), 4000);
  };

  // Filter loads based on user search input
  const filteredLoads = publicLoads.filter(load => {
    const matchesOrigin = load.origin.toLowerCase().includes(searchOrigin.toLowerCase());
    const matchesDestination = load.destination.toLowerCase().includes(searchDestination.toLowerCase());
    const matchesEquipment = selectedEquipment === 'All' || load.equipment === selectedEquipment;
    return matchesOrigin && matchesDestination && matchesEquipment;
  });

  return (
    <div style={{ color: '#f8fafc', maxWidth: '1000px' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '8px' }}>Free Load Boards & API Integrations</h2>
      <p style={{ color: '#94a3b8', marginBottom: '24px' }}>Search live zero-fee public freight feeds by equipment type or connect commercial carrier networks.</p>

      {saved && (
        <div style={{ padding: '12px 16px', background: '#065f46', color: '#fff', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold' }}>
          API credentials and preferences successfully saved!
        </div>
      )}

      {bookedMessage && (
        <div style={{ padding: '12px 16px', background: '#3b82f6', color: '#fff', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold' }}>
          {bookedMessage}
        </div>
      )}

      {/* Live Free Public Load Board & Search Module */}
      <div style={{ background: '#090d16', padding: '24px', borderRadius: '12px', border: '1px solid #1e293b', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#38bdf8', marginBottom: '4px' }}>Live Free Public Load Board Search</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Find available backhauls and spot loads instantly across specific truck categories.</p>
          </div>
          <span style={{ background: '#065f46', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
            Live Feed Active
          </span>
        </div>

        {/* Search Input Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', background: '#020617', padding: '16px', borderRadius: '8px', border: '1px solid #1e293b', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Origin City / State</label>
            <input 
              type="text" 
              placeholder="e.g. Chicago, IL" 
              value={searchOrigin} 
              onChange={(e) => setSearchOrigin(e.target.value)}
              style={{ width: '100%', padding: '10px', background: '#090d16', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', outline: 'none', fontSize: '0.9rem' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Destination City / State</label>
            <input 
              type="text" 
              placeholder="e.g. Columbus, OH" 
              value={searchDestination} 
              onChange={(e) => setSearchDestination(e.target.value)}
              style={{ width: '100%', padding: '10px', background: '#090d16', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', outline: 'none', fontSize: '0.9rem' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Equipment Type</label>
            <select 
              value={selectedEquipment} 
              onChange={(e) => setSelectedEquipment(e.target.value)}
              style={{ width: '100%', padding: '10px', background: '#090d16', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', outline: 'none', fontSize: '0.9rem' }}
            >
              <option value="All">All Equipment Types</option>
              <option value="Hotshot">Hotshot</option>
              <option value="Flatbed">Flatbed</option>
              <option value="Box Truck">Box Truck</option>
              <option value="Reefer">Reefer</option>
              <option value="Dry Van">Dry Van</option>
              <option value="Power Only">Power Only</option>
              <option value="Others">Others</option>
            </select>
          </div>
        </div>

        {filteredLoads.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', background: '#020617', borderRadius: '8px' }}>
            No loads found matching your search criteria. Try modifying your filters or check back later!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#1e293b', color: '#94a3b8' }}>
                  <th style={{ padding: '12px 14px' }}>Source</th>
                  <th style={{ padding: '12px 14px' }}>Origin</th>
                  <th style={{ padding: '12px 14px' }}>Destination</th>
                  <th style={{ padding: '12px 14px' }}>Equipment</th>
                  <th style={{ padding: '12px 14px' }}>Miles</th>
                  <th style={{ padding: '12px 14px' }}>Rate</th>
                  <th style={{ padding: '12px 14px' }}>RPM</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLoads.map((load) => (
                  <tr key={load.id} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '14px 14px', color: '#38bdf8', fontSize: '0.85rem' }}>{load.source}</td>
                    <td style={{ padding: '14px 14px', color: '#fff' }}>{load.origin}</td>
                    <td style={{ padding: '14px 14px', color: '#fff' }}>{load.destination}</td>
                    <td style={{ padding: '14px 14px', color: '#cbd5e1' }}>{load.equipment}</td>
                    <td style={{ padding: '14px 14px', color: '#cbd5e1' }}>{load.miles} mi</td>
                    <td style={{ padding: '14px 14px', color: '#4ade80', fontWeight: 'bold' }}>${load.rate.toLocaleString()}</td>
                    <td style={{ padding: '14px 14px', color: '#facc15', fontWeight: 'bold' }}>${load.rpm.toFixed(2)}</td>
                    <td style={{ padding: '14px 14px', textAlign: 'center' }}>
                      <button 
                        onClick={() => handleBookLoad(load)}
                        style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        Book Load
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Commercial API Integration Form */}
      <form onSubmit={handleSave} style={{ background: '#090d16', padding: '24px', borderRadius: '12px', border: '1px solid #1e293b' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px', color: '#38bdf8' }}>Commercial Load Board APIs</h3>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '20px' }}>Enter your provider API keys to stream live paid network boards into your application.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>DAT Power / OneAPI Key</label>
            <input 
              type="password" 
              placeholder="Enter DAT API Secret Key" 
              value={datApiKey} 
              onChange={(e) => setDatApiKey(e.target.value)} 
              style={{ width: '100%', padding: '12px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', outline: 'none' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>Truckstop.com API Key</label>
            <input 
              type="password" 
              placeholder="Enter Truckstop Integration Key" 
              value={truckstopApiKey} 
              onChange={(e) => setTruckstopApiKey(e.target.value)} 
              style={{ width: '100%', padding: '12px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', outline: 'none' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>123Loadboard API Key</label>
            <input 
              type="password" 
              placeholder="Enter 123Loadboard Partner Key" 
              value={load123Key} 
              onChange={(e) => setLoad123Key(e.target.value)} 
              style={{ width: '100%', padding: '12px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', outline: 'none' }} 
            />
          </div>
        </div>

        <button type="submit" style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          Save API Connections
        </button>
      </form>
    </div>
  );
};