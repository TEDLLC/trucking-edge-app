// src/utils/permissions.ts
import type { Role } from '../types/user';

// This function checks if a user's role meets or beats the required role
export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  const hierarchy: Record<Role, number> = {
    Owner: 4,      // Highest level: can see everything
    Admin: 3,      // High level: can manage team and settings
    Dispatcher: 2, // Mid level: can manage loads and drivers
    Driver: 1,     // Basic level: can only view their own portal
  };
  
  return hierarchy[userRole] >= hierarchy[requiredRole];
}