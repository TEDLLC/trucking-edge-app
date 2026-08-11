import React from 'react';
import { evaluateOperationalIntelligence } from '../services/intelligenceEngine';
import type { OperationalAlert } from '../services/intelligenceEngine';

interface Props {
  drivers?: Array<{ id: string; name: string; cdlExpirationDate: string; availableHours?: number }>;
  loads?: Array<{ id: string; loadNumber: string; status: string; margin: number; hasPod: boolean; targetMargin: number; estimatedDriveHours?: number; invoiceStatus?: 'PENDING' | 'GENERATED' | 'OVERDUE' }>;
  trucks?: Array<{ id: string; unitNumber: string; nextServiceDueMiles: number; currentMiles: number }>;
  onActionClick?: (alert: OperationalAlert) => void;
}

export const OperationalIntelligenceWidget: React.FC<Props> = ({ drivers, loads, trucks, onActionClick }) => {
  const alerts = evaluateOperationalIntelligence({ drivers, loads, trucks });

  if (alerts.length === 0) {
    return (
      <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', color: '#94a3b8' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#38bdf8', marginBottom: '8px' }}>Proactive Intelligence</h3>
        <p style={{ fontSize: '0.9rem' }}>All operational metrics are nominal. No critical issues detected.</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#38bdf8', margin: 0 }}>
          Proactive Operational Recommendations ({alerts.length})
        </h3>
        <span style={{ fontSize: '0.75rem', background: '#1e293b', color: '#cbd5e1', padding: '4px 8px', borderRadius: '4px' }}>
          Active Monitoring
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {alerts.map((alert) => {
          const borderColor = 
            alert.type === 'CRITICAL' ? '#ef4444' : 
            alert.type === 'WARNING' ? '#f59e0b' : '#38bdf8';

          return (
            <div 
              key={alert.id} 
              style={{ 
                background: '#020617', 
                borderLeft: `4px solid ${borderColor}`, 
                border: '1px solid #1e293b',
                borderLeftWidth: '4px',
                borderRadius: '8px', 
                padding: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: borderColor, textTransform: 'uppercase' }}>
                    {alert.category} • {alert.type}
                  </span>
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#fff', margin: '0 0 4px 0' }}>
                  {alert.title}
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                  {alert.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onActionClick && onActionClick(alert)}
                style={{
                  background: '#1e293b',
                  color: '#fff',
                  border: '1px solid #334155',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'background 0.2s'
                }}
              >
                {alert.suggestedActionLabel}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};