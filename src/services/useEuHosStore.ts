import { create } from 'zustand';

interface EuHosState {
  continuousDrivingMinutes: number;
  dailyDrivingMinutes: number;
  weeklyDrivingHours: number;
  twoWeekTotalHours: number;
  addDrivingMinutes: (minutes: number) => void;
  resetBreak: () => void;
}

export const useEuHosStore = create<EuHosState>((set) => ({
  continuousDrivingMinutes: 150,
  dailyDrivingMinutes: 360,
  weeklyDrivingHours: 38,
  twoWeekTotalHours: 72,
  
  addDrivingMinutes: (minutes) => 
    set((state) => ({ 
      continuousDrivingMinutes: state.continuousDrivingMinutes + minutes,
      dailyDrivingMinutes: state.dailyDrivingMinutes + minutes 
    })),
    
  resetBreak: () => set({ continuousDrivingMinutes: 0 }),
}));