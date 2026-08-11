import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

interface InvoicingViewProps {
  organizationId: string;
}

export const InvoicingView: React.FC<InvoicingViewProps> = ({ organizationId }) => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loads, setLoads] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [selectedLoadId, setSelectedLoadId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch invoices
      const { data: invData, error: invError } = await supabase
        .from('invoices')
        .select(`*, loads(id, status)`)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (invError) throw invError;
      setInvoices(invData || []);

      // Fetch loads for invoice creation
      const { data: loadsData, error: loadsError } = await supabase
        .from('loads')
        .select('*')
        .eq('organization_id', organizationId);

      if (loadsError) throw loadsError;
      setLoads(loadsData || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch invoicing data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) {
      fetchData();
    }
  }, [organizationId]);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoadId || !amount) return;

    try {
      setSubmitting(true);
      const { error } = await supabase.from('invoices').insert([
        {
          organization_id: organizationId,
          load_id: selectedLoadId,
          amount: parseFloat(amount),
          due_date: dueDate ? new Date(dueDate).toISOString() : null,
          status: 'Unpaid',
        },
      ]);

      if (error) throw error;

      setSelectedLoadId('');
      setAmount('');
      setDueDate('');
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create invoice');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-4 text-gray-600">Loading Invoices...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-6">
      <h2 className="text-xl font-bold">Invoicing & Billing</h2>

      {/* Invoice Creation Form */}
      <form onSubmit={handleCreateInvoice} className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
        <h3 className="font-semibold text-gray-700">Generate New Invoice</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Load</label>
            <select
              value={selectedLoadId}
              onChange={(e) => setSelectedLoadId(e.target.value)}
              required
              className="w-full border border-gray-300 rounded p-2 text-sm"
            >
              <option value="">-- Choose Load --</option>
              {loads.map((l) => (
                <option key={l.id} value={l.id}>Load {l.id.slice(0, 8)}... ({l.status})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              className="w-full border border-gray-300 rounded p-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 text-sm"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm font-medium"
        >
          {submitting ? 'Generating...' : 'Create Invoice'}
        </button>
      </form>

      {/* Invoices List */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-3">Organization Invoices</h3>
        {invoices.length === 0 ? (
          <p className="text-gray-500 text-sm">No invoices found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Load ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{inv.id.slice(0, 8)}...</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inv.load_id ? inv.load_id.slice(0, 8) + '...' : 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">${Number(inv.amount).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};