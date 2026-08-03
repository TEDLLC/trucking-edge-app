import React, { useState } from 'react';

export const WeatherWidget: React.FC = () => {
  const [location, setLocation] = useState('Chicago, IL');
  const [weather, setWeather] = useState({ temp: '72°F', condition: 'Clear & Sunny', wind: '8 mph NW', humidity: '45%' });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulated weather update based on query
    setWeather({
      temp: `${Math.floor(Math.random() * 30 + 55)}°F`,
      condition: Math.random() > 0.5 ? 'Clear & Sunny' : 'Partly Cloudy / Wind Advisories',
      wind: `${Math.floor(Math.random() * 15 + 5)} mph`,
      humidity: `${Math.floor(Math.random() * 40 + 30)}%`
    });
  };

  return (
    <div style={{ background: '#090d16', padding: '16px', borderRadius: '12px', border: '1px solid #1e293b', marginBottom: '24px', color: '#fff' }}>
      <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#38bdf8', marginBottom: '10px' }}>Route & Location Weather</h4>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <input 
          type="text" 
          value={location} 
          onChange={(e) => setLocation(e.target.value)} 
          placeholder="Enter city or zip..."
          style={{ flex: 1, padding: '8px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
        />
        <button type="submit" style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>Search</button>
      </form>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8', background: '#020617', padding: '10px', borderRadius: '6px' }}>
        <div>
          <div style={{ color: '#fff', fontWeight: 'bold' }}>{location}</div>
          <div>{weather.condition}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '1.1rem' }}>{weather.temp}</div>
          <div>Wind: {weather.wind}</div>
        </div>
      </div>
    </div>
  );
};