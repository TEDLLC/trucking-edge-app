// src/types/user.ts

export type Role = 'Owner' | 'Admin' | 'Dispatcher' | 'Driver';

export interface User {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  role: Role;
  status: 'Active' | 'Inactive';
}