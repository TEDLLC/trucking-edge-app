import React from 'react';

interface StatCardsProps {
  totalRevenue: number;
  totalExpenses: number;
  activeLoadsCount: number;
  activeDriversCount: number;
}

export const StatCards: React.FC<StatCardsProps> = ({
  totalRevenue,
  totalExpenses,
  activeLoadsCount,
  activeDriversCount,
}) => {
  const netProfit = totalRevenue - totalExpenses;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '15px' }}>
        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Revenue</div>
        <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#10b981', marginTop: '5px' }}>
          ${totalRevenue.toLocaleString()}
        </div>
      </div>
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '15px' }}>
        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Expenses</div>
        <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#ef4444', marginTop: '5px' }}>
          ${totalExpenses.toLocaleString()}
        </div>
      </div>
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '15px' }}>
        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Net Profit</div>
        <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: netProfit >= 0 ? '#3b82f6' : '#ef4444', marginTop: '5px' }}>
          ${netProfit.toLocaleString()}
        </div>
      </div>
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '15px' }}>
        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Active Fleet Status</div>
        <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#fff', marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
          <span>Loads: {activeLoadsCount}</span>
          <span>Drivers: {activeDriversCount}</span>
        </div>
      </div>
    </div>
  );
};