import React, { useState } from 'react';

export default function LoginPage() {
  const [supportName, setSupportName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportPhone, setSupportPhone] = useState('');
  const [supportMcNumber, setSupportMcNumber] = useState('');
  const [supportTruckType, setSupportTruckType] = useState('');
  const [supportMessage, setSupportMessage] = useState('');

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Support inquiry sent for MC#: ${supportMcNumber} (${supportTruckType})`);
    setSupportName('');
    setSupportEmail('');
    setSupportPhone('');
    setSupportMcNumber('');
    setSupportTruckType('');
    setSupportMessage('');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', background: '#ffffff', padding: '30px', borderRadius: '8px', color: '#1e293b', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px', color: '#0f172a' }}>Contact Our Support Team</h2>
        <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Have questions? Call us directly at <strong style={{ color: '#0f172a' }}>(800) 555-TRUCK</strong> (Mon–Fri: 8:00 AM – 6:00 PM EST) or drop us a message below.
        </p>
      </div>

      <form onSubmit={handleSupportSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px', color: '#334155' }}>Name</label>
            <input 
              type="text" 
              value={supportName} 
              onChange={(e) => setSupportName(e.target.value)} 
              placeholder="Your Name" 
              required 
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px', color: '#334155' }}>Email Address</label>
            <input 
              type="email" 
              value={supportEmail} 
              onChange={(e) => setSupportEmail(e.target.value)} 
              placeholder="Email Address" 
              required 
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px', color: '#334155' }}>Phone Number</label>
            <input 
              type="text" 
              value={supportPhone} 
              onChange={(e) => setSupportPhone(e.target.value)} 
              placeholder="Phone Number" 
              required 
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px', color: '#334155' }}>MC Number / USDOT</label>
            <input 
              type="text" 
              value={supportMcNumber} 
              onChange={(e) => setSupportMcNumber(e.target.value)} 
              placeholder="MC-123456" 
              required 
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px', color: '#334155' }}>Truck Type</label>
          <select 
            value={supportTruckType} 
            onChange={(e) => setSupportTruckType(e.target.value)} 
            required 
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a' }}
          >
            <option value="">Select Truck Type</option>
            <option value="Dry Van">Dry Van</option>
            <option value="Reefer (Refrigerated)">Reefer (Refrigerated)</option>
            <option value="Flatbed">Flatbed</option>
            <option value="Box Truck">Box Truck</option>
            <option value="Power Only">Power Only</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px', color: '#334155' }}>How can we help you?</label>
          <textarea 
            rows={4} 
            value={supportMessage} 
            onChange={(e) => setSupportMessage(e.target.value)} 
            placeholder="How can we help you?" 
            required 
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', resize: 'vertical' }}
          />
        </div>

        <div style={{ textAlign: 'center' }}>
          <button 
            type="submit" 
            style={{ background: '#1e293b', color: '#fff', border: 'none', padding: '12px 30px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}
          >
            Send Inquiry
          </button>
        </div>
      </form>
    </div>
  );
}