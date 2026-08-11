import React, { useState } from 'react';
import type { OperationalAlert } from '../services/intelligenceEngine';

interface DriverOption {
  id: string;
  name: string;
  availableHours: number;
}

interface Props {
  alert: OperationalAlert;
  availableDrivers: DriverOption[];
  onClose: () => void;
  onReassign: (driverId: string, driverName: string) => void;
}

export const DriverReassignmentModal: React.FC<Props> = ({ alert, availableDrivers, onClose, onReassign }) => {
  const [selectedDriverId, setSelectedDriverId] = useState<string>(availableDrivers[0]?.id || '');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const targetDriver = availableDrivers.find(d => d.id === selectedDriverId);

    setTimeout(() => {
      setSubmitting(false);
      setSuccessMessage(`Successfully reassigned to ${targetDriver?.name || 'new driver'}! HOS compliance log updated.`);
      setTimeout(() => {
        if (targetDriver) {
          onReassign(targetDriver.id, targetDriver.name);
        }
        onClose();
      }, 1200);
    }, 800);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(2, 6, 23, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        background: '#090d16',
        border: '1px solid #1e293b',
        borderRadius: '12px',
        padding: '24px',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#ef4444', margin: 0 }}>
            {alert.title}
          </h3>
          <button 
            type="button" 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}
          >
            &times;
          </button>
        </div>

        <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '20px' }}>
          {alert.description} Select an available compliant driver from the fleet below to prevent HOS violations.
        </p>

        {successMessage ? (
          <div style={{ background: '#064e3b', color: '#34d399', padding: '12px', borderRadius: '8px', textAlign: 'center', fontWeight: '500' }}>
            {successMessage}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#cbd5e1', marginBottom: '6px' }}>
                Select Compliant Replacement Driver
              </label>
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                style={{
                  width: '100%',
                  background: '#020617',
                  border: '1px solid #334155',
                  color: '#fff',
                  padding: '10px',
                  borderRadius: '6px',
                  fontSize: '0.9rem'
                }}
              >
                {availableDrivers.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} (Available HOS: {d.availableHours} hrs)
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'transparent',
                  color: '#94a3b8',
                  border: '1px solid #334155',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                {submitting ? 'Reassigning...' : 'Confirm Reassignment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default DriverReassignmentModal;