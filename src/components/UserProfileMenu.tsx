import React, { useState } from 'react';

interface UserProfileMenuProps {
  setActiveTab: (tab: string) => void;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({ setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [weatherQuery, setWeatherQuery] = useState('Chicago, IL');
  const [temp, setTemp] = useState('72°F');
  const [condition, setCondition] = useState('Sunny');
  const [isSearching, setIsSearching] = useState(false);

  const handleWeatherSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate fetching weather for entered location
    setTemp(`${Math.floor(Math.random() * 25 + 55)}°F`);
    setCondition(Math.random() > 0.5 ? 'Clear' : 'Windy');
    setIsSearching(false);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
      
      {/* Top Right Mini Weather Widget */}
      <div style={{ background: '#090d16', border: '1px solid #1e293b', padding: '6px 14px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', fontSize: '0.8rem' }}>
        <span style={{ fontSize: '1rem' }}>🌤️</span>
        {isSearching ? (
          <form onSubmit={handleWeatherSearch} style={{ display: 'flex', gap: '4px' }}>
            <input 
              type="text" 
              value={weatherQuery} 
              onChange={(e) => setWeatherQuery(e.target.value)}
              placeholder="City..."
              autoFocus
              style={{ width: '80px', background: '#020617', border: '1px solid #38bdf8', borderRadius: '4px', color: '#fff', padding: '2px 6px', fontSize: '0.75rem', outline: 'none' }}
            />
          </form>
        ) : (
          <div onClick={() => setIsSearching(true)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} title="Click to search location weather">
            <span style={{ fontWeight: 'bold', color: '#38bdf8' }}>{weatherQuery}</span>
            <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{temp}</span>
            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>({condition})</span>
          </div>
        )}
      </div>

      {/* Admin Profile Dropdown Menu */}
      <div style={{ position: 'relative' }}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#090d16', border: '1px solid #1e293b', padding: '6px 14px', borderRadius: '30px', color: '#fff', cursor: 'pointer' }}
        >
          <div style={{ width: '28px', height: '28px', background: '#6366f1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.75rem' }}>
            TE
          </div>
          <div style={{ textAlign: 'left', fontSize: '0.8rem' }}>
            <div style={{ fontWeight: 'bold', color: '#f8fafc' }}>Admin Dispatch</div>
            <div style={{ fontSize: '0.7rem', color: '#38bdf8' }}>Professional Plan</div>
          </div>
          <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>▼</span>
        </button>

        {isOpen && (
          <div style={{ position: 'absolute', top: '45px', right: 0, width: '220px', background: '#090d16', border: '1px solid #1e293b', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 50, padding: '8px' }}>
            <button 
              onClick={() => { setActiveTab('settings'); setIsOpen(false); }}
              style={{ width: '100%', textAlign: 'left', padding: '10px 12px', background: 'transparent', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              ⚙️ Account & Billing
            </button>
            <button 
              onClick={() => { alert('Opening Support Desk...'); setIsOpen(false); }}
              style={{ width: '100%', textAlign: 'left', padding: '10px 12px', background: 'transparent', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              💬 Support & FAQ
            </button>
            <hr style={{ borderColor: '#1e293b', margin: '4px 0' }} />
            <button 
              onClick={() => alert('Signed out successfully.')}
              style={{ width: '100%', textAlign: 'left', padding: '10px 12px', background: 'transparent', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
            >
              🚪 Sign Out
            </button>
          </div>
        )}
      </div>

    </div>
  );
};