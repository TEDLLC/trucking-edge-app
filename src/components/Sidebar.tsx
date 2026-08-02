import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dispatch', label: 'Dispatch & RPM', icon: '📊' },
    { id: 'drivers', label: 'Driver Roster', icon: '👤' },
    { id: 'eld', label: 'ELD / HOS Logs', icon: '📋' },
    { id: 'fuel', label: 'Fuel Map & Logs', icon: '⛽' },
    { id: 'financials', label: 'Profit & Loss', icon: '💰' },
    { id: 'settings', label: 'Load Board Settings', icon: '⚙️' },
    { id: 'loadboards', label: 'Load Boards & APIs', icon: '🌐' },
  ];

  return (
    <aside style={{ width: '260px', background: '#090d16', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0 }}>
      <div style={{ padding: '24px 20px', borderBottom: '1px solid #1e293b' }}>
        <h1 style={{ fontSize: '1.15rem', fontWeight: 'bold', color: '#f8fafc', letterSpacing: '0.5px' }}>TRUCKING EDGE</h1>
        <span style={{ fontSize: '0.75rem', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '1px' }}>Enterprise Suite</span>
      </div>

      <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 14px',
                background: isActive ? '#1e293b' : 'transparent',
                color: isActive ? '#38bdf8' : '#94a3b8',
                border: 'none',
                borderRadius: '8px',
                fontWeight: isActive ? '600' : 'normal',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease',
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid #1e293b' }}>
        <button 
          onClick={() => alert('Signed out successfully.')}
          style={{ width: '100%', padding: '10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
};