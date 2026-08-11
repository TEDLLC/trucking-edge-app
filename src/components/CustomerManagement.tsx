import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

interface CustomerManagementProps {
  organizationId: string;
}

export const CustomerManagement: React.FC<CustomerManagementProps> = ({ organizationId }) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'locations' | 'loads' | 'invoices' | 'payments' | 'documents' | 'rates' | 'profitability' | 'activity'>('overview');

  // New Customer Form State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [companyName, setCompanyName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [customerNumber, setCustomerNumber] = useState('');
  const [customerType, setCustomerType] = useState('Shipper');
  const [status, setStatus] = useState('Active');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [creditLimit, setCreditLimit] = useState('0.00');

  // Customer 360 Sub-Data States
  const [locations, setLocations] = useState<any[]>([]);
  const [customerLoads, setCustomerLoads] = useState<any[]>([]);
  const [customerInvoices, setCustomerInvoices] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);

  // New Location Form State
  const [locName, setLocName] = useState('');
  const [locType, setLocType] = useState('Pickup');
  const [locAddress, setLocAddress] = useState('');
  const [locCity, setLocCity] = useState('');
  const [locState, setLocState] = useState('');
  const [locZip, setLocZip] = useState('');

  // New Contact Form State
  const [conName, setConName] = useState('');
  const [conEmail, setConEmail] = useState('');
  const [conPhone, setConPhone] = useState('');
  const [conTitle, setConTitle] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      // Fetch customers and join their locations for advanced searching
      const { data, error } = await supabase
        .from('customers')
        .select(`*, customer_locations(name, city, state, address)`)
        .eq('organization_id', organizationId)
        .order('company_name', { ascending: true });

      if (error) throw error;
      setCustomers(data || []);
    } catch (err: any) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) {
      fetchCustomers();
    }
  }, [organizationId]);

  useEffect(() => {
    if (selectedCustomer) {
      fetchCustomerDetails(selectedCustomer.id);
      setContacts(selectedCustomer.contacts || []);
    }
  }, [selectedCustomer]);

  const fetchCustomerDetails = async (customerId: string) => {
    try {
      const { data: locData } = await supabase.from('customer_locations').select('*').eq('customer_id', customerId);
      setLocations(locData || []);

      const { data: loadData } = await supabase.from('loads').select('*').eq('customer_id', customerId);
      setCustomerLoads(loadData || []);

      const { data: invData } = await supabase.from('invoices').select('*').eq('customer_id', customerId);
      setCustomerInvoices(invData || []);

      const { data: auditData } = await supabase.from('customer_audit_logs').select('*').eq('customer_id', customerId).order('created_at', { ascending: false });
      setAuditLogs(auditData || []);
    } catch (err) {
      console.error('Error fetching customer details:', err);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !customerNumber) {
      alert('Company Name and Customer Number are required.');
      return;
    }

    try {
      const { error } = await supabase.from('customers').insert([
        {
          organization_id: organizationId,
          company_name: companyName,
          legal_name: legalName || null,
          customer_number: customerNumber,
          customer_type: customerType,
          status,
          phone: phone || null,
          email: email || null,
          billing_address: billingAddress || null,
          payment_terms: paymentTerms,
          credit_limit: parseFloat(creditLimit) || 0.00,
        },
      ]);

      if (error) throw error;

      setShowCreateModal(false);
      setCompanyName('');
      setLegalName('');
      setCustomerNumber('');
      setPhone('');
      setEmail('');
      setBillingAddress('');
      await fetchCustomers();
    } catch (err: any) {
      alert(err.message || 'Failed to create customer');
    }
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !locName || !locAddress || !locCity || !locState || !locZip) {
      alert('Please fill out all required location fields.');
      return;
    }

    try {
      const { error } = await supabase.from('customer_locations').insert([
        {
          organization_id: organizationId,
          customer_id: selectedCustomer.id,
          location_type: locType,
          name: locName,
          address: locAddress,
          city: locCity,
          state: locState,
          zip: locZip,
        }
      ]);
      if (error) throw error;
      setLocName(''); setLocAddress(''); setLocCity(''); setLocState(''); setLocZip('');
      await fetchCustomerDetails(selectedCustomer.id);
    } catch (err: any) {
      alert(err.message || 'Failed to add location');
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conName) return;

    const updatedContacts = [...contacts, { name: conName, email: conEmail, phone: conPhone, title: conTitle }];
    try {
      const { error } = await supabase
        .from('customers')
        .update({ contacts: updatedContacts })
        .eq('id', selectedCustomer.id);

      if (error) throw error;
      setContacts(updatedContacts);
      setSelectedCustomer({ ...selectedCustomer, contacts: updatedContacts });
      setConName(''); setConEmail(''); setConPhone(''); setConTitle('');
    } catch (err: any) {
      alert(err.message || 'Failed to add contact');
    }
  };

  // Advanced Multi-field Search (Company, Customer Number, Contact, Phone, Email, Location)
  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesCompany = c.company_name?.toLowerCase().includes(q);
    const matchesNumber = c.customer_number?.toLowerCase().includes(q);
    const matchesEmail = c.email?.toLowerCase().includes(q);
    const matchesPhone = c.phone?.toLowerCase().includes(q);
    const matchesLocation = c.customer_locations?.some((l: any) => 
      l.name?.toLowerCase().includes(q) || l.city?.toLowerCase().includes(q) || l.state?.toLowerCase().includes(q)
    );
    const matchesContact = c.contacts?.some((ct: any) =>
      ct.name?.toLowerCase().includes(q) || ct.email?.toLowerCase().includes(q) || ct.phone?.toLowerCase().includes(q)
    );

    return matchesCompany || matchesNumber || matchesEmail || matchesPhone || matchesLocation || matchesContact;
  });

  if (selectedCustomer) {
    // Calculate Profitability metrics for selected customer
    const totalRevenue = customerLoads.reduce((acc, l) => acc + Number(l.rate || 0), 0);
    const estimatedCost = totalRevenue * 0.7; // Estimated operating ratio cost benchmark
    const netProfit = totalRevenue - estimatedCost;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-md">
          <div>
            <button
              onClick={() => setSelectedCustomer(null)}
              className="text-sm text-indigo-600 font-medium hover:underline mb-2 inline-block"
            >
              ← Back to Customer Directory
            </button>
            <h2 className="text-2xl font-bold text-gray-900">{selectedCustomer.company_name}</h2>
            <p className="text-xs text-gray-500 font-mono mt-0.5">Customer # {selectedCustomer.customer_number} • Type: {selectedCustomer.customer_type}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            selectedCustomer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {selectedCustomer.status}
          </span>
        </div>

        {/* Customer 360 Tabs */}
        <div className="flex border-b bg-white rounded-t-lg shadow-sm px-4 overflow-x-auto space-x-4">
          {(['overview', 'contacts', 'locations', 'loads', 'invoices', 'payments', 'documents', 'rates', 'profitability', 'activity'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-sm font-medium border-b-2 capitalize whitespace-nowrap transition ${
                activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="bg-white p-6 rounded-b-lg shadow-md">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800 border-b pb-2">Business Details</h3>
                <p><span className="text-gray-500 text-sm">Legal Name:</span> <span className="font-medium">{selectedCustomer.legal_name || 'N/A'}</span></p>
                <p><span className="text-gray-500 text-sm">Email:</span> <span className="font-medium">{selectedCustomer.email || 'N/A'}</span></p>
                <p><span className="text-gray-500 text-sm">Phone:</span> <span className="font-medium">{selectedCustomer.phone || 'N/A'}</span></p>
                <p><span className="text-gray-500 text-sm">Payment Terms:</span> <span className="font-medium">{selectedCustomer.payment_terms}</span></p>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800 border-b pb-2">Financials & Credit</h3>
                <p><span className="text-gray-500 text-sm">Credit Limit:</span> <span className="font-bold text-green-600">${Number(selectedCustomer.credit_limit).toFixed(2)}</span></p>
                <p><span className="text-gray-500 text-sm">Billing Address:</span> <span className="font-medium">{selectedCustomer.billing_address || 'N/A'}</span></p>
                <p><span className="text-gray-500 text-sm">Notes:</span> <span className="font-medium">{selectedCustomer.notes || 'None'}</span></p>
              </div>
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-gray-800">Customer Contacts ({contacts.length})</h3>
              <form onSubmit={handleAddContact} className="bg-gray-50 p-4 rounded border space-y-3 max-w-xl">
                <h4 className="text-xs font-bold uppercase text-gray-700">Add New Contact</h4>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Full Name" value={conName} onChange={(e) => setConName(e.target.value)} required className="border p-2 rounded text-sm" />
                  <input type="text" placeholder="Title (e.g. Logistics Manager)" value={conTitle} onChange={(e) => setConTitle(e.target.value)} className="border p-2 rounded text-sm" />
                  <input type="email" placeholder="Email Address" value={conEmail} onChange={(e) => setConEmail(e.target.value)} className="border p-2 rounded text-sm" />
                  <input type="text" placeholder="Phone Number" value={conPhone} onChange={(e) => setConPhone(e.target.value)} className="border p-2 rounded text-sm" />
                </div>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700">Add Contact</button>
              </form>
              <div className="grid grid-cols-2 gap-4">
                {contacts.map((ct, idx) => (
                  <div key={idx} className="border p-4 rounded bg-gray-50 space-y-1">
                    <p className="font-bold text-gray-900">{ct.name} <span className="text-xs font-normal text-indigo-600">({ct.title || 'Staff'})</span></p>
                    <p className="text-sm text-gray-600">Email: {ct.email || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Phone: {ct.phone || 'N/A'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'locations' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-gray-800">Customer Facilities & Locations ({locations.length})</h3>
              <form onSubmit={handleAddLocation} className="bg-gray-50 p-4 rounded border space-y-4">
                <h4 className="text-xs font-bold uppercase text-gray-700">Add New Location</h4>
                <div className="grid grid-cols-3 gap-3">
                  <input type="text" placeholder="Location Name" value={locName} onChange={(e) => setLocName(e.target.value)} required className="border p-2 rounded text-sm" />
                  <select value={locType} onChange={(e) => setLocType(e.target.value)} className="border p-2 rounded text-sm">
                    <option value="Pickup">Pickup</option>
                    <option value="Delivery">Delivery</option>
                    <option value="Warehouse">Warehouse</option>
                    <option value="Office">Office</option>
                  </select>
                  <input type="text" placeholder="Street Address" value={locAddress} onChange={(e) => setLocAddress(e.target.value)} required className="border p-2 rounded text-sm" />
                  <input type="text" placeholder="City" value={locCity} onChange={(e) => setLocCity(e.target.value)} required className="border p-2 rounded text-sm" />
                  <input type="text" placeholder="State" value={locState} onChange={(e) => setLocState(e.target.value)} required className="border p-2 rounded text-sm" />
                  <input type="text" placeholder="ZIP" value={locZip} onChange={(e) => setLocZip(e.target.value)} required className="border p-2 rounded text-sm" />
                </div>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700">Add Location</button>
              </form>
              <div className="grid grid-cols-2 gap-4">
                {locations.map((loc) => (
                  <div key={loc.id} className="border p-4 rounded bg-gray-50 space-y-1">
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-900">{loc.name}</span>
                      <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">{loc.location_type}</span>
                    </div>
                    <p className="text-sm text-gray-600">{loc.address}, {loc.city}, {loc.state} {loc.zip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'loads' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Associated Loads ({customerLoads.length})</h3>
              <div className="space-y-2">
                {customerLoads.map((load) => (
                  <div key={load.id} className="p-3 border rounded flex justify-between items-center bg-gray-50">
                    <div>
                      <p className="font-semibold text-sm">Load #{load.id.slice(0, 8)}</p>
                      <p className="text-xs text-gray-500">{load.origin} → {load.destination}</p>
                    </div>
                    <span className="text-xs font-bold text-green-600">${Number(load.rate || 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Invoices & Receivables ({customerInvoices.length})</h3>
              <div className="space-y-2">
                {customerInvoices.map((inv) => (
                  <div key={inv.id} className="p-3 border rounded flex justify-between items-center bg-gray-50">
                    <div>
                      <p className="font-semibold text-sm">{inv.invoice_number}</p>
                      <p className="text-xs text-gray-500">Due: {inv.due_date || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">${Number(inv.amount).toFixed(2)}</p>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">{inv.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Payment History</h3>
              <p className="text-sm text-gray-500">All payment records tied to invoices are settled here.</p>
            </div>
          )}

          {activeTab === 'documents' && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Customer Documents & Contracts</h3>
              <p className="text-sm text-gray-500">No signed rate confirmations or tax exemption forms uploaded.</p>
            </div>
          )}

          {activeTab === 'rates' && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Contracted Lane Rates</h3>
              <p className="text-sm text-gray-500">No custom lane rate matrix configured for this customer account.</p>
            </div>
          )}

          {activeTab === 'profitability' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Customer Financial Profitability</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 p-4 rounded">
                  <p className="text-xs text-green-600 uppercase font-semibold">Total Revenue</p>
                  <p className="text-xl font-bold text-green-800 mt-1">${totalRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-red-50 border border-red-200 p-4 rounded">
                  <p className="text-xs text-red-600 uppercase font-semibold">Estimated Cost (70% OR)</p>
                  <p className="text-xl font-bold text-red-800 mt-1">${estimatedCost.toFixed(2)}</p>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 p-4 rounded">
                  <p className="text-xs text-indigo-600 uppercase font-semibold">Net Profit</p>
                  <p className="text-xl font-bold text-indigo-800 mt-1">${netProfit.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-800 mb-2">Audit History & Activity Log</h3>
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 border rounded text-xs bg-gray-50 flex justify-between">
                  <span className="font-medium text-gray-800"><strong className="text-indigo-600">{log.action}:</strong> {log.details}</span>
                  <span className="text-gray-400">{new Date(log.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-md">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Customer & Shipper Directory</h2>
          <p className="text-sm text-gray-500">Manage commercial shippers, brokers, and consignee accounts</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700"
        >
          + Add Customer
        </button>
      </div>

      {/* Advanced Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <input
          type="text"
          placeholder="Search by company, customer #, contact, phone, email, or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border rounded-lg p-2.5 text-sm"
        />
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone / Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Terms</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCustomers.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-mono font-medium text-gray-900">{c.customer_number}</td>
                <td className="px-6 py-4 text-sm font-bold text-indigo-600">{c.company_name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{c.customer_type}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{c.phone || c.email || 'N/A'}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{c.payment_terms}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    c.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-sm">
                  <button
                    onClick={() => setSelectedCustomer(c)}
                    className="text-indigo-600 hover:text-indigo-900 font-medium text-xs"
                  >
                    View 360 →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Add New Commercial Customer</h3>
            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Company Name *</label>
                  <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className="w-full border rounded p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Customer Number *</label>
                  <input type="text" placeholder="e.g. CUST-1001" value={customerNumber} onChange={(e) => setCustomerNumber(e.target.value)} required className="w-full border rounded p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Customer Type</label>
                  <select value={customerType} onChange={(e) => setCustomerType(e.target.value)} className="w-full border rounded p-2 text-sm">
                    <option value="Shipper">Shipper</option>
                    <option value="Broker">Broker</option>
                    <option value="Consignee">Consignee</option>
                    <option value="Carrier">Carrier</option>
                    <option value="3PL">3PL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Payment Terms</label>
                  <select value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} className="w-full border rounded p-2 text-sm">
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 60">Net 60</option>
                    <option value="Due on Receipt">Due on Receipt</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border rounded p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded p-2 text-sm" />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border rounded text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700">Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};