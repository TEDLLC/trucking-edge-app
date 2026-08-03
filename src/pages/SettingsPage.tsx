import React, { useState } from 'react';

export const SettingsPage: React.FC = () => {
  const [companyName, setCompanyName] = useState('Trucking Edge Logistics');
  const [email, setEmail] = useState('dispatch@truckingedge.com');
  const [selectedPlan, setSelectedPlan] = useState('Professional');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const plans = [
    { name: 'Starter', price: '$29/mo', desc: 'Basic load tracking & single truck management.' },
    { name: 'Professional', price: '$79/mo', desc: 'Full multi-truck fleet management, ELD logs, & free public board search.' },
    { name: 'Enterprise', price: '$149/mo', desc: 'Unlimited API load board streams (DAT/Truckstop), custom analytics, & priority support.' },
  ];

  return (
    <div style={{ color: '#f8fafc', maxWidth: '900px' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '8px' }}>Application Settings & Subscription Billing</h2>
      <p style={{ color: '#94a3b8', marginBottom: '24px' }}>Manage your company profile, account security, and active software subscription tier.</p>

      {saved && (
        <div style={{ padding: '12px 16px', background: '#065f46', color: '#fff', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold' }}>
          Settings and subscription updated successfully!
        </div>
      )}

      {/* Subscription Billing Section */}
      <div style={{ background: '#090d16', padding: '24px', borderRadius: '12px', border: '1px solid #1e293b', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#38bdf8', marginBottom: '16px' }}>Subscription Billing Packages</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {plans.map((p) => {
            const isCurrent = selectedPlan === p.name;
            return (
              <div 
                key={p.name} 
                style={{ background: '#020617', border: isCurrent ? '2px solid #6366f1' : '1px solid #1e293b', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#fff' }}>{p.name}</h4>
                    <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#4ade80' }}>{p.price}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '16px' }}>{p.desc}</p>
                </div>
                <button 
                  onClick={() => setSelectedPlan(p.name)}
                  style={{ background: isCurrent ? '#6366f1' : '#1e293b', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85Port' }}
                >
                  {isCurrent ? 'Active Plan' : 'Select Plan'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* General Settings Form */}
      <form onSubmit={handleSave} style={{ background: '#090d16', padding: '24px', borderRadius: '12px', border: '1px solid #1e293b' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#38bdf8', marginBottom: '16px' }}>Company Profile Settings</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>Company Name</label>
            <input 
              type="text" 
              value={companyName} 
              onChange={(e) => setCompanyName(e.target.value)} 
              style={{ width: '100%', padding: '12px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>Billing Notification Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              style={{ width: '100%', padding: '12px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff' }} 
            />
          </div>
        </div>
        <button type="submit" style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          Save Changes
        </button>
      </form>
    </div>
  );
};