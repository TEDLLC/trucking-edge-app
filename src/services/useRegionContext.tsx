import React, { createContext, useContext, useState, useEffect } from 'react';

export type RegionMode = 'US' | 'EU';

interface RegionContextType {
  region: RegionMode;
  setRegion: (region: RegionMode) => void;
  currencySymbol: string;
  distanceUnit: 'mi' | 'km';
  fuelUnit: 'gal' | 'L';
  rateUnit: 'RPM' | 'RPK';
  formatDistance: (dist: number) => string;
  formatCurrency: (amount: number) => string;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export const RegionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [region, setRegion] = useState<RegionMode>(() => {
    const saved = localStorage.getItem('app_region');
    if (saved === 'US' || saved === 'EU') return saved;
    // Auto-detect based on user timezone
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz.startsWith('Europe') ? 'EU' : 'US';
  });

  useEffect(() => {
    localStorage.setItem('app_region', region);
  }, [region]);

  const isEU = region === 'EU';

  const value: RegionContextType = {
    region,
    setRegion,
    currencySymbol: isEU ? '€' : '$',
    distanceUnit: isEU ? 'km' : 'mi',
    fuelUnit: isEU ? 'L' : 'gal',
    rateUnit: isEU ? 'RPK' : 'RPM',
    formatDistance: (dist: number) => `${dist.toLocaleString()} ${isEU ? 'km' : 'mi'}`,
    formatCurrency: (amount: number) => `${isEU ? '€' : '$'}${amount.toLocaleString()}`,
  };

  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
};

export const useRegionContext = () => {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error('useRegionContext must be used within a RegionProvider');
  }
  return context;
};