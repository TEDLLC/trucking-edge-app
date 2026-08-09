import React, { useEffect, useState } from 'react';
import { getFinancials, createExpense } from '../services/api';
import { useRegionStore } from '../services/useRegion';
import type { FinancialSummary, Expense } from '../services/api';

export function FinancialsPage() {
  const { region } = useRegionStore();
  const isEU = region === 'EU' || region?.includes('EU');
  const currencySymbol = isEU ? '€' : '$';

  const [financials, setFinancials] = useState<FinancialSummary>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    expenses: [],
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Form states
  const [category, setCategory] = useState('Maintenance');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  // Fetch financial summary on load
  const loadFinancialData = async () => {
    setLoading(true);
    const data = await getFinancials();
    if (data) {
      setFinancials(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadFinancialData();
  }, []);

  const profitMargin = financials.totalRevenue > 0 
    ? ((financials.netProfit / financials.totalRevenue) * 100).toFixed(1) 
    : '0';

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount) || 0;
    if (amt <= 0 || !description) return;

    const newExpense = await createExpense({
      category,
      description,
      amount: amt,
      date: new Date().toISOString(),
    });

    if (newExpense) {
      // Refresh financials to get updated totals and expenses list
      loadFinancialData();
      setDescription('');
      setAmount('');
    }
  };

  return (
    <div style={{ color: '#f8fafc' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '8px' }}>Profit & Loss Financial Tracker</h2>
      <p style={{ color: '#94a3b8', marginBottom: '24px' }}>Analyze gross revenue, operating costs, net margins, and ledger expenses ({region}).</p>

      {/* Financial Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <div style={{ background: '#090d16', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b' }}>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>Gross Revenue</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#4ade80' }}>
            {currencySymbol}{financials.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div style={{ background: '#090d16', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b' }}>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>Total Operating Expenses</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#ef4444' }}>
            {currencySymbol}{financials.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div style={{ background: '#090d16', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b' }}>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>Net Profit</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#38bdf8' }}>
            {currencySymbol}{financials.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div style={{ background: '#090d16', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b' }}>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>Profit Margin</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#facc15' }}>{profitMargin}%</div>
        </div>
      </div>

      {/* Add Expense Form */}
      <form onSubmit={handleAddExpense} style={{ background: '#090d16', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px', color: '#38bdf8' }}>Log Fleet Expense</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', outline: 'none' }}>
              <option value="Maintenance">Maintenance & Parts</option>
              <option value="Insurance">Insurance & Permits</option>
              <option value="Tolls">Tolls & Scales</option>
              <option value="Office">Office & Software</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Description</label>
            <input type="text" placeholder="e.g. Brake replacement #05" value={description} onChange={(e) => setDescription(e.target.value)} required style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Amount ({currencySymbol})</label>
            <input type="number" step="0.01" placeholder="e.g. 650.00" value={amount} onChange={(e) => setAmount(e.target.value)} required style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', outline: 'none' }} />
          </div>
        </div>
        <button type="submit" style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          Record Expense Entry
        </button>
      </form>

      {/* Expenses Ledger Table */}
      <div style={{ background: '#090d16', borderRadius: '12px', border: '1px solid #1e293b', overflow: 'hidden' }}>
        {loading ? (
          <p style={{ padding: '16px', color: '#94a3b8' }}>Loading financial ledger...</p>
        ) : financials.expenses.length === 0 ? (
          <p style={{ padding: '16px', color: '#94a3b8' }}>No custom expenses logged yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#1e293b', color: '#94a3b8' }}>
                <th style={{ padding: '12px 16px' }}>Expense ID</th>
                <th style={{ padding: '12px 16px' }}>Category</th>
                <th style={{ padding: '12px 16px' }}>Description</th>
                <th style={{ padding: '12px 16px' }}>Amount</th>
                <th style={{ padding: '12px 16px' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {financials.expenses.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 'bold' }}>{item.id.slice(0, 8)}...</td>
                  <td style={{ padding: '14px 16px', color: '#38bdf8' }}>{item.category}</td>
                  <td style={{ padding: '14px 16px', color: '#fff' }}>{item.description}</td>
                  <td style={{ padding: '14px 16px', color: '#ef4444', fontWeight: 'bold' }}>{currencySymbol}{item.amount.toFixed(2)}</td>
                  <td style={{ padding: '14px 16px', color: '#94a3b8' }}>{new Date(item.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}