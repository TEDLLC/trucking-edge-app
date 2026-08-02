// src/components/DriverPortal.tsx
import React from 'react';
import type { User } from '../types/user';

interface DriverPortalProps {
  currentUser: User;
  loads: Array<{ id: string; origin: string; destination: string; driver: string; status: string }>;
  onUpdateStatus: (loadId: string) => void;
}

export function DriverPortal({ currentUser, loads, onUpdateStatus }: DriverPortalProps) {
  // Find only the loads assigned to this specific driver
  const assignedLoads = loads.filter(l => l.driver === currentUser.name);

  return (
    <div style={{ padding: '24px', background: '#0f172a', color: '#fff', minHeight: '100vh', width: '100%' }}>
      <h2>Driver Mobile Portal</h2>
      <p style={{ color: '#94a3b8', marginBottom: '20px' }}>
        Welcome back, <strong>{currentUser.name}</strong>. Here are your active dispatches:
      </p>
      
      {assignedLoads.length === 0 ? (
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', border: '1px solid #334155' }}>
          <p style={{ color: '#94a3b8', margin: 0 }}>No active dispatches currently assigned to you.</p>
        </div>
      ) : (
        assignedLoads.map(load => (
          <div key={load.id} style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <strong>{load.id}</strong>
              <span style={{ color: '#38bdf8' }}>{load.status}</span>
            </div>
            <div>{load.origin} → {load.destination}</div>
            <div style={{ marginTop: '12px' }}>
              <button 
                style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                onClick={() => onUpdateStatus(load.id)}
              >
                Mark as Delivered
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}