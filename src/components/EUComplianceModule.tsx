import React from 'react';
import { EuPostingWorkersView } from './EuPostingWorkersView';
import { EuBorderCrossingLog } from './EuBorderCrossingLog';

export const EUComplianceModule: React.FC = () => {
  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: 600, marginBottom: '6px' }}>
          EU Regulatory & Mobility Package Compliance Hub
        </h2>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>
          Monitor posted driver declarations, minimum wage requirements, and automated border crossing records.
        </p>
      </div>

      <EuPostingWorkersView />
      <EuBorderCrossingLog />
    </div>
  );
};