import { create } from 'zustand';

export type UserRole = 'admin' | 'dispatcher' | 'driver';

interface UserState {
  role: UserRole;
  setRole: (role: UserRole) => void;
}

export const useUserStore = create<UserState>((set) => ({
  role: 'admin', // Default role
  setRole: (role) => set({ role }),
}));