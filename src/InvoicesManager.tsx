import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export default function InvoicesManager() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [loadId, setLoadId] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('Unpaid');

  useEffect(() => {
    async function fetchInvoices() {
      const { data, error } = await supabase.from('invoices').select('*');
      if (error) {
        console.error('Error fetching invoices:', error);
      } else {
        setInvoices(data || []);
      }
      setLoading(false);
    }

    fetchInvoices();
  }, []);

  const handleAddInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loadId || !amount) {
      alert('Please fill out load ID and amount.');
      return;
    }

    const { data, error } = await supabase.from('invoices').insert([
      { 
        load_id: loadId, 
        amount: parseFloat(amount), 
        status 
      }
    ]).select();

    if (error) {
      console.error('Error adding invoice:', error);
      alert('Failed to add invoice.');
    } else if (data) {
      setInvoices([...invoices, data[0]]);
      setLoadId('');
      setAmount('');
      setStatus('Unpaid');
      alert('Invoice created successfully!');
    }
  };

  return (
    <div className="p-8 text-slate-100 max-w-5xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">Enterprise Invoicing</h2>

      <form onSubmit={handleAddInvoice} className="bg-slate-900 p-6 rounded-xl border border-slate-800 mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Load ID / Reference</label>
          <input type="text" value={loadId} onChange={(e) => setLoadId(e.target.value)} placeholder="Load #102" className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white" />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Amount ($)</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="2500" className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white" />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white">
            <option value="Unpaid">Unpaid</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
        <div className="sm:col-span-3">
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-4 rounded text-sm transition-all cursor-pointer">
            Create Invoice
          </button>
        </div>
      </form>

      {loading ? (
        <p>Loading invoices...</p>
      ) : invoices.length === 0 ? (
        <p className="text-slate-400">No invoices generated yet.</p>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv, index) => (
            <div key={inv.id || index} className="bg-slate-900/60 border border-slate-800 p-4 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-semibold text-white">Load Ref: {inv.load_id}</p>
                <p className="text-xs text-slate-400">Status: <span className={inv.status === 'Paid' ? 'text-emerald-400' : 'text-amber-400'}>{inv.status}</span></p>
              </div>
              <div className="text-emerald-400 font-semibold text-lg">
                ${inv.amount}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}