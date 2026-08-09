import { create } from 'zustand';

export type UserRegion = 'US' | 'EU';

interface RegionState {
  region: UserRegion;
  setUserRegion: (region: UserRegion) => void;
  setRegion: (region: UserRegion) => void; // Added alias for compatibility
}

export const useRegionStore = create<RegionState>((set) => ({
  // Defaults to 'US', or reads from saved login user region
  region: (localStorage.getItem('user_assigned_region') as UserRegion) || 'US',
  
  setUserRegion: (region: UserRegion) => {
    localStorage.setItem('user_assigned_region', region);
    set({ region });
  },

  setRegion: (region: UserRegion) => {
    localStorage.setItem('user_assigned_region', region);
    set({ region });
  },
}));