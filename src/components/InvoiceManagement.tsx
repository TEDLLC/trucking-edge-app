import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

interface InvoiceManagementProps {
  organizationId: string;
}

export const InvoiceManagement: React.FC<InvoiceManagementProps> = ({ organizationId }) => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // New Invoice Form State
  const [customerId, setCustomerId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Invoices with Customer details
      const { data: invData } = await supabase
        .from('invoices')
        .select(`*, customers(company_name)`)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });
      setInvoices(invData || []);

      // 2. Fetch Customers for dropdown
      const { data: custData } = await supabase
        .from('customers')
        .select('*')
        .eq('organization_id', organizationId);
      setCustomers(custData || []);

    } catch (err: any) {
      console.error(err);
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
    if (!customerId || !invoiceNumber || !amount) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      const { error } = await supabase.from('invoices').insert([
        {
          organization_id: organizationId,
          customer_id: customerId,
          invoice_number: invoiceNumber,
          amount: parseFloat(amount),
          due_date: dueDate || null,
          status: 'Draft',
        },
      ]);
      if (error) throw error;

      setInvoiceNumber('');
      setAmount('');
      setDueDate('');
      setCustomerId('');
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create invoice');
    }
  };

  const handleUpdateStatus = async (invoiceId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: newStatus })
        .eq('id', invoiceId);
      if (error) throw error;
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update invoice status');
    }
  };

  if (loading) return <div className="p-4 text-gray-600">Loading Billing & Invoices...</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-xl font-bold text-gray-800">Billing & Invoicing</h2>
      </div>

      <form onSubmit={handleCreateInvoice} className="bg-gray-50 p-4 rounded border space-y-4 max-w-2xl">
        <h3 className="font-semibold text-sm text-gray-700">Generate New Invoice</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
              className="w-full border rounded p-2 text-sm"
            >
              <option value="">-- Choose Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.company_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
            <input
              type="text"
              placeholder="e.g. INV-2026-001"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              required
              className="w-full border rounded p-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full border rounded p-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border rounded p-2 text-sm"
            />
          </div>
        </div>
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700">
          Create Invoice
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{inv.invoice_number}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{inv.customers?.company_name || 'N/A'}</td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900">${Number(inv.amount).toFixed(2)}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{inv.due_date || 'N/A'}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    inv.status === 'Paid' ? 'bg-green-100 text-green-800' :
                    inv.status === 'Sent' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm space-x-2">
                  {inv.status === 'Draft' && (
                    <button
                      onClick={() => handleUpdateStatus(inv.id, 'Sent')}
                      className="text-indigo-600 hover:text-indigo-900 font-medium text-xs"
                    >
                      Mark Sent
                    </button>
                  )}
                  {inv.status === 'Sent' && (
                    <button
                      onClick={() => handleUpdateStatus(inv.id, 'Paid')}
                      className="text-green-600 hover:text-green-900 font-medium text-xs"
                    >
                      Mark Paid
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};