import React, { useState } from 'react';

interface PaymentLog {
  id: string;
  date: string;
  description: string;
  amount: string;
  method: string;
  status: 'Paid' | 'Pending' | 'Failed';
}

export const BillingPage: React.FC = () => {
  const [logs, setLogs] = useState<PaymentLog[]>([
    { id: 'PAY-1092', date: '2026-08-01', description: 'Enterprise Monthly Subscription', amount: '$149.00', method: 'Visa ending in •••• 4242', status: 'Paid' },
    { id: 'PAY-1045', date: '2026-07-01', description: 'Enterprise Monthly Subscription', amount: '$149.00', method: 'Visa ending in •••• 4242', status: 'Paid' },
    { id: 'PAY-0982', date: '2026-06-01', description: 'Enterprise Monthly Subscription', amount: '$149.00', method: 'Visa ending in •••• 4242', status: 'Paid' }
  ]);

  const [cardAdded, setCardAdded] = useState(false);

  const handleSimulatePayment = () => {
    const newLog: PaymentLog = {
      id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      description: 'DAT & Truckstop API Add-on Pack',
      amount: '$49.00',
      method: 'Mastercard ending in •••• 8811',
      status: 'Paid'
    };
    setLogs([newLog, ...logs]);
  };

  return (
    <div style={{ padding: '24px', color: '#f8fafc', maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '4px' }}>Billing & Payment Logs</h2>
          <p style={{ color: '#94a3b8' }}>Review subscription invoices and payment transaction history.</p>
        </div>
        <button onClick={handleSimulatePayment} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          + Pay New Invoice
        </button>
      </div>

      {/* Subscription Card Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)', border: '1px solid #4338ca', borderRadius: '12px', padding: '24px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ background: '#4338ca', color: '#c7d2fe', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>Active Plan</span>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginTop: '10px' }}>Enterprise Tier ($149/mo)</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Next automatic billing date: September 1, 2026</p>
        </div>
        <button onClick={() => setCardAdded(true)} style={{ background: '#38bdf8', color: '#0f172a', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          Update Payment Method
        </button>
      </div>

      {cardAdded && (
        <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #38bdf8', color: '#38bdf8', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
          ℹ️ Payment method modal simulation: Card updated successfully.
        </div>
      )}

      {/* Payment History Table */}
      <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#020617', borderBottom: '1px solid #1e293b', color: '#94a3b8', fontSize: '0.85rem' }}>
              <th style={{ padding: '14px 16px' }}>Invoice ID</th>
              <th style={{ padding: '14px 16px' }}>Date</th>
              <th style={{ padding: '14px 16px' }}>Description</th>
              <th style={{ padding: '14px 16px' }}>Amount</th>
              <th style={{ padding: '14px 16px' }}>Payment Method</th>
              <th style={{ padding: '14px 16px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} style={{ borderBottom: '1px solid #1e293b', fontSize: '0.9rem' }}>
                <td style={{ padding: '14px 16px', fontWeight: 'bold', color: '#38bdf8' }}>{log.id}</td>
                <td style={{ padding: '14px 16px', color: '#cbd5e1' }}>{log.date}</td>
                <td style={{ padding: '14px 16px' }}>{log.description}</td>
                <td style={{ padding: '14px 16px', fontWeight: 'bold' }}>{log.amount}</td>
                <td style={{ padding: '14px 16px', color: '#94a3b8' }}>{log.method}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};