import React, { useState } from 'react';

export function ProfitLossPage() {
  const [category, setCategory] = useState('Insurance & Permits');
  const [description, setDescription] = useState('insurance');
  const [amount, setAmount] = useState<number>(1350);

  const [records, setRecords] = useState<Array<{ id: string; category: string; description: string; amount: number; date: string }>>([
    { id: '1', category: 'Freight Revenue', description: 'Load #101 Chicago to Dallas', amount: 2200.00, date: new Date().toISOString() },
    { id: '2', category: 'Fuel Expense', description: 'Diesel Stop - Pilot #44', amount: 480.50, date: new Date().toISOString() }
  ]);

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !description.trim()) return;

    const newRecord = {
      id: 'fin-' + Date.now(),
      category,
      description,
      amount,
      date: new Date().toISOString()
    };

    setRecords([newRecord, ...records]);
    setDescription('');
    setAmount(100.00);
  };

  // Calculate totals
  let totalRevenue = 0;
  let totalExpenses = 0;

  records.forEach(r => {
    if (r.category.toLowerCase().includes('revenue')) {
      totalRevenue += r.amount;
    } else {
      totalExpenses += r.amount;
    }
  });

  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';

  return (
    <div style={{ color: '#f8fafc', padding: '24px' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '8px' }}>Profit & Loss Financial Tracker</h2>
      <p style={{ color: '#94a3b8', marginBottom: '24px' }}>Analyze gross revenue, operating costs, net margins, and ledger expenses.</p>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#090d16', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b' }}>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '8px' }}>Gross Revenue</p>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#4ade80' }}>${totalRevenue.toFixed(2)}</p>
        </div>
        <div style={{ background: '#090d16', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b' }}>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '8px' }}>Total Operating Expenses</p>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#ef4444' }}>${totalExpenses.toFixed(2)}</p>
        </div>
        <div style={{ background: '#090d16', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b' }}>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '8px' }}>Net Profit</p>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#38bdf8' }}>${netProfit.toFixed(2)}</p>
        </div>
        <div style={{ background: '#090d16', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b' }}>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '8px' }}>Profit Margin</p>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#f59e0b' }}>{profitMargin}%</p>
        </div>
      </div>

      {/* Entry Form */}
      <form onSubmit={handleAddRecord} style={{ background: '#090d16', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px', color: '#38bdf8' }}>Log Fleet Expense</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', outline: 'none' }}
            >
              <option value="Insurance & Permits">Insurance & Permits</option>
              <option value="Freight Revenue">Freight Revenue</option>
              <option value="Fuel Expense">Fuel Expense</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Tolls & Fees">Tolls & Fees</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Amount ($)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              required
              style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', outline: 'none' }}
            />
          </div>
        </div>
        <button
          type="submit"
          style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Record Expense Entry
        </button>
      </form>

      {/* Ledger Table */}
      <div style={{ background: '#090d16', borderRadius: '12px', border: '1px solid #1e293b', overflow: 'hidden' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', padding: '16px', borderBottom: '1px solid #1e293b', color: '#38bdf8' }}>Financial Ledger</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#1e293b', color: '#94a3b8' }}>
              <th style={{ padding: '12px 16px' }}>Category</th>
              <th style={{ padding: '12px 16px' }}>Description</th>
              <th style={{ padding: '12px 16px' }}>Amount</th>
              <th style={{ padding: '12px 16px' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec) => {
              const isRev = rec.category.toLowerCase().includes('revenue');
              return (
                <tr key={rec.id} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 'bold', color: isRev ? '#4ade80' : '#ef4444' }}>
                    {rec.category}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#fff' }}>{rec.description}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 'bold', color: isRev ? '#4ade80' : '#ef4444' }}>
                    {isRev ? '+' : '-'}${rec.amount.toFixed(2)}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#94a3b8' }}>{new Date(rec.date).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}