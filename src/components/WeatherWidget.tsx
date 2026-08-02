import React, { useState } from 'react';

export const WeatherWidget: React.FC = () => {
  const [weatherLocation, setWeatherLocation] = useState<string>('Chicago, IL');
  const [weatherData, setWeatherData] = useState<{ temp: number; condition: string; wind: string } | null>({
    temp: 78,
    condition: 'Clear & Dry',
    wind: '9 mph NW'
  });

  const handleFetchWeather = (e: React.FormEvent) => {
    e.preventDefault();
    const randomTemp = Math.floor(60 + Math.random() * 25);
    setWeatherData({
      temp: randomTemp,
      condition: 'Optimal Trucking Weather',
      wind: '8 mph SW'
    });
  };

  return (
    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '15px', minWidth: '280px' }}>
      <div style={{ fontSize: '1.8rem' }}>🌤️</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong style={{ fontSize: '0.9rem', color: '#f59e0b' }}>{weatherLocation}</strong>
          <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#fff' }}>{weatherData?.temp}°F</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', gap: '10px' }}>
          <span>{weatherData?.condition}</span>
          <span>•</span>
          <span>Wind: {weatherData?.wind}</span>
        </div>
      </div>
      <form onSubmit={handleFetchWeather} style={{ display: 'flex', gap: '4px' }}>
        <input 
          type="text" 
          value={weatherLocation} 
          onChange={(e) => setWeatherLocation(e.target.value)} 
          placeholder="City, State" 
          style={{ width: '85px', padding: '4px 6px', fontSize: '0.75rem', background: '#0f172a', border: '1px solid #475569', color: '#fff', borderRadius: '4px' }}
        />
        <button type="submit" style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>🔍</button>
      </form>
    </div>
  );
};