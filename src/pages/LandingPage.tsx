import React, { useState } from 'react';

interface LandingBannerProps {
  onActionClick: () => void;
}

const LandingBanner: React.FC<LandingBannerProps> = ({ onActionClick }) => {
  return (
    <div style={{ background: 'linear-gradient(135deg, #4338ca 0%, #2563eb 50%, #0284c7 100%)', color: '#fff', padding: '16px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden', borderBottom: '1px solid #1e293b' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.95rem', fontWeight: '500' }}>
          Get <strong>2 Months Free</strong> on all Annual Enterprise Fleet Subscriptions.
        </span>
        <button onClick={onActionClick} style={{ background: '#fff', color: '#1e1b4b', border: 'none', padding: '6px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
          Claim Offer →
        </button>
      </div>
    </div>
  );
};

interface LandingPageProps {
  onLoginSuccess: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'none' | 'login' | 'signup' | 'dispatchForm' | 'mcLeaseForm' | 'demoBookingForm' | 'enterpriseHub'>('none');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('Enterprise');

  // Enterprise Interactive Tab State
  const [activeEnterpriseTab, setActiveEnterpriseTab] = useState<'settlements' | 'ifta' | 'eld' | 'vault' | 'rbac' | 'fmcsaForms' | 'saferSearch'>('settlements');

  // SAFER Lookup State
  const [saferQuery, setSaferQuery] = useState('');
  const [saferResult, setSaferResult] = useState<any | null>(null);
  const [saferLoading, setSaferLoading] = useState(false);

  // Common Form Fields
  const [companyName, setCompanyName] = useState('');
  const [mcNumber, setMcNumber] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');
  const [truckType, setTruckType] = useState('Semi-Truck');
  const [truckCount, setTruckCount] = useState<number>(5);
  const [mcLeaseOption, setMcLeaseOption] = useState<'leaseOnly' | 'leaseWithDispatch'>('leaseOnly');
  const [signature, setSignature] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Demo Booking State
  const [demoDate, setDemoDate] = useState('');
  const [demoTime, setDemoTime] = useState('10:00 AM');
  const [demoName, setDemoName] = useState('');
  const [demoEmail, setDemoEmail] = useState('');
  const [demoPhone, setDemoPhone] = useState('');
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  const getDispatchRate = (count: number) => {
    if (count === 1) return '8%';
    if (count >= 2 && count <= 4) return '6%';
    return '5%';
  };

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !mcNumber || !contactEmail || !contactPhone || !address || !signature) {
      alert('Please fill out all required fields and provide your electronic signature.');
      return;
    }
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setAuthMode('none');
      onLoginSuccess();
    }, 3000);
  };

  const handleMcLeaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !mcNumber || !contactEmail || !contactPhone || !address || !signature) {
      alert('Please fill out all required fields and sign electronically.');
      return;
    }
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setAuthMode('none');
      onLoginSuccess();
    }, 3000);
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoName || !demoEmail || !demoDate || !demoPhone) {
      alert('Please fill out all required fields including your email to schedule your walkthrough.');
      return;
    }
    setDemoSubmitted(true);
    setTimeout(() => {
      setDemoSubmitted(false);
      setAuthMode('none');
    }, 3500);
  };

  // Real-Time Asynchronous FMCSA SAFER Lookup Handler via Local Vite Proxy
  const handleSaferSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saferQuery.trim()) return;
    
    setSaferLoading(true);
    setSaferResult(null);

    try {
      const cleanQuery = saferQuery.replace(/[^0-9]/g, '');
      const response = await fetch(`/api/fmcsa/carriers/search/${cleanQuery}`);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      if (data && data.content && data.content.length > 0) {
        const carrier = data.content[0].carrier;
        setSaferResult({
          query: saferQuery.toUpperCase(),
          legalName: carrier.legalName || 'N/A',
          dba: carrier.dbaName || 'N/A',
          dotNumber: carrier.dotNumber || 'N/A',
          mcNumber: carrier.allowedToOperate === 'Y' ? saferQuery.toUpperCase() : 'Pending/Inactive',
          status: carrier.allowedToOperate === 'Y' ? 'ACTIVE' : 'INACTIVE',
          safetyRating: carrier.safetyRating || 'Not Rated',
          outOfService: carrier.oosDate ? 'Yes' : 'None (0%)',
          powerUnits: carrier.totalPowerUnits || 0,
          drivers: carrier.totalDrivers || 0,
          insurances: {
            bipd: carrier.bipdOnFile ? `$${carrier.bipdOnFile.toLocaleString()} Verified` : 'Required on File',
            cargo: carrier.cargoOnFile ? 'Verified' : 'Check Docket',
            bond: 'Active'
          }
        });
      } else {
        alert('No active carrier records found matching this MC/DOT number.');
      }
    } catch (error) {
      console.error('Error fetching SAFER data:', error);
      alert('Unable to fetch live record automatically. Please check the number or use the direct FMCSA portal.');
    } finally {
      setSaferLoading(false);
    }
  };

  const fmcsaFormsList = [
    { code: 'MCS-150', name: 'Motor Carrier Identification Report (Application & Biennial Update)', url: 'https://www.fmcsa.dot.gov/regulations/downloads' },
    { code: 'OP-1', name: 'Application for Motor Carrier Operating Authority', url: 'https://www.fmcsa.dot.gov/legacy/forms/print/op-1.pdf' },
    { code: 'BOC-3', name: 'Designation of Process Agents (State Service of Process)', url: 'https://www.fmcsa.dot.gov/legacy/forms/print/boc-3.pdf' },
    { code: 'MCS-150A', name: 'Safety Certification / Driver Information Update', url: 'https://www.fmcsa.dot.gov/regulations/downloads' },
    { code: 'LBN-1', name: 'Lease & Interchange Agreement Template (Interstate Motor Carriers)', url: 'https://www.fmcsa.dot.gov/regulations/downloads' },
    { code: 'DRUG-1', name: 'FMCSA Clearinghouse Limited Query General Consent Form', url: 'https://clearinghouse.fmcsa.dot.gov/' }
  ];

  const plans = [
    { name: 'Starter', price: '$29', period: '/month', desc: 'Ideal for single-truck owner-operators looking for basic dispatch & load logs.', features: ['1 Truck / Driver Roster', 'Basic Load Management', 'Standard Route Tracking', 'Community Support'] },
    { name: 'Professional', price: '$79', period: '/month', desc: 'Built for scaling fleets needing ELD compliance and free public load board feeds.', features: ['Up to 10 Fleet Trucks', 'Automated RPM Calculations', 'ELD / HOS Compliance Logs', 'Live Free Load Board Search', 'Route Weather Widget'] },
    { name: 'Enterprise', price: '$149', period: '/month', desc: 'Maximum performance for large logistics operations with automated carrier networks.', features: ['Unlimited Trucks & Drivers', 'DAT & Truckstop API Streams', 'Advanced Profit & Loss Analytics', 'Priority 24/7 Support', 'Dedicated Account Manager'] }
  ];

  return (
    <div style={{ minHeight: '100vh', height: '100vh', overflowY: 'auto', background: '#020617', color: '#f8fafc', fontFamily: 'sans-serif' }}>
      
      {/* Navigation Header */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 48px', borderBottom: '1px solid #1e293b', background: '#090d16', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem' }}>
            TE
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>TRUCKING EDGE <span style={{ color: '#38bdf8', fontSize: '0.75rem', border: '1px solid #38bdf8', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>ENTERPRISE SUITE</span></span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            onClick={() => setAuthMode('enterpriseHub')}
            style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.4)', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            ⚡ Enterprise Modules
          </button>
          <button 
            onClick={() => setAuthMode('login')}
            style={{ background: 'transparent', color: '#fff', border: '1px solid #1e293b', padding: '8px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            Log In
          </button>
          <button 
            onClick={() => setAuthMode('signup')}
            style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Top Promotional Announcement Banner */}
      <LandingBanner onActionClick={() => setAuthMode('signup')} />

      {/* Hero Section */}
      <header style={{ textAlign: 'center', padding: '70px 20px 40px', maxWidth: '900px', margin: '0 auto' }}>
        <span style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
          🚀 Full-Scale Enterprise Logistics, Factoring, IFTA & FMCSA Compliance Hub
        </span>
        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginTop: '20px', marginBottom: '20px', lineHeight: '1.2' }}>
          Engineered for Scale with <span style={{ background: 'linear-gradient(to right, #38bdf8, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Trucking Edge Enterprise</span>
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#94a3b8', marginBottom: '32px', lineHeight: '1.6' }}>
          Automate weekly driver settlements, run live SAFER MC verifications, download official FMCSA forms, and manage quarterly IFTA taxes all in one dashboard.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setAuthMode('dispatchForm')}
            style={{ background: '#10b981', color: '#fff', border: 'none', padding: '14px 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)' }}
          >
            ✍️ Apply for Dispatch Services
          </button>
          <button 
            onClick={() => setAuthMode('mcLeaseForm')}
            style={{ background: '#f59e0b', color: '#0f172a', border: 'none', padding: '14px 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)' }}
          >
            🚛 Apply for MC Lease Program
          </button>
        </div>
      </header>

      {/* Enterprise Interactive Showcase Section */}
      <section style={{ padding: '20px 24px 60px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '16px', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e' }}></div>
            </div>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontFamily: 'monospace' }}>enterprise.truckingedge.com/dashboard</span>
            
            <button 
              onClick={() => setAuthMode('demoBookingForm')}
              style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #38bdf8', padding: '6px 14px', borderRadius: '6px', fontSize: '0.8rem', color: '#38bdf8', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              📅 Book Enterprise Walkthrough
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div onClick={() => { setActiveEnterpriseTab('settlements'); setAuthMode('enterpriseHub'); }} style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>💰</div>
              <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '6px' }}>QuickPay & Settlements</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: '1.4' }}>Automated driver settlements, escrow deductions, and factoring integration with Triumph & RTS.</p>
            </div>

            <div onClick={() => { setActiveEnterpriseTab('saferSearch'); setAuthMode('enterpriseHub'); }} style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🔍</div>
              <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '6px' }}>SAFER MC Record Lookup</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: '1.4' }}>Instant carrier safety ratings, insurance verification, and authority status checks.</p>
            </div>

            <div onClick={() => { setActiveEnterpriseTab('fmcsaForms'); setAuthMode('enterpriseHub'); }} style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>📥</div>
              <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '6px' }}>FMCSA Form Downloads</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: '1.4' }}>Direct downloads for MCS-150, OP-1, BOC-3 agent designations, and lease agreements.</p>
            </div>

            <div onClick={() => { setActiveEnterpriseTab('vault'); setAuthMode('enterpriseHub'); }} style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🛡️</div>
              <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '6px' }}>FMCSA Compliance Vault</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: '1.4' }}>Automated expiration alerts for CDLs, medical cards, and certificates of insurance (COI).</p>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Pricing Packages Section */}
      <section style={{ padding: '20px 20px 80px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '700', marginBottom: '12px' }}>Transparent Subscription Packages</h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem' }}>Choose the ideal plan to scale your fleet operations. Cancel or upgrade anytime.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {plans.map((p) => {
            const isPopular = p.name === 'Enterprise';
            return (
              <div 
                key={p.name} 
                style={{ background: '#090d16', border: isPopular ? '2px solid #6366f1' : '1px solid #1e293b', borderRadius: '16px', padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}
              >
                {isPopular && (
                  <span style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: '#6366f1', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    ENTERPRISE RECOMMENDED
                  </span>
                )}
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '8px' }}>{p.name}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '24px', minHeight: '40px' }}>{p.desc}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '24px' }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#4ade80' }}>{p.price}</span>
                    <span style={{ color: '#94a3b8', marginLeft: '4px' }}>{p.period}</span>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {p.features.map((feat, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#cbd5e1' }}>
                        <span style={{ color: '#4ade80' }}>✓</span> {feat}
                      </li>
                    ))}
                  </ul>
                </div>
                <button 
                  onClick={() => { setSelectedPlan(p.name); setAuthMode('signup'); }}
                  style={{ background: isPopular ? '#6366f1' : '#1e293b', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}
                >
                  Choose {p.name}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Modals Overlay */}
      {authMode !== 'none' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px', overflowY: 'auto' }}>
          <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: authMode === 'enterpriseHub' ? '860px' : '560px', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', maxHeight: '90vh', overflowY: 'auto' }}>
            <button 
              onClick={() => setAuthMode('none')}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}
            >
              ✕
            </button>

            {formSubmitted ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎉</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4ade80', marginBottom: '10px' }}>Application Submitted Successfully!</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Redirecting you to your enterprise dashboard...</p>
              </div>
            ) : demoSubmitted ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📅</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#38bdf8', marginBottom: '10px' }}>Demo Booked Successfully!</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  We've sent a calendar invitation and meeting link to <strong style={{ color: '#fff' }}>{demoEmail}</strong> for <strong style={{ color: '#4ade80' }}>{demoDate} at {demoTime}</strong>.
                </p>
              </div>
            ) : (
              <>
                {authMode === 'enterpriseHub' && (
                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '6px', color: '#38bdf8' }}>Enterprise Feature Control Hub</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '20px' }}>
                      Explore live backend modules powering large-scale carrier and fleet operations with strict privacy masking.
                    </p>

                    <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
                      <button onClick={() => setActiveEnterpriseTab('settlements')} style={{ background: activeEnterpriseTab === 'settlements' ? '#6366f1' : '#020617', color: '#fff', border: '1px solid #1e293b', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>💰 Settlements</button>
                      <button onClick={() => setActiveEnterpriseTab('saferSearch')} style={{ background: activeEnterpriseTab === 'saferSearch' ? '#6366f1' : '#020617', color: '#fff', border: '1px solid #1e293b', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>🔍 SAFER Lookup</button>
                      <button onClick={() => setActiveEnterpriseTab('fmcsaForms')} style={{ background: activeEnterpriseTab === 'fmcsaForms' ? '#6366f1' : '#020617', color: '#fff', border: '1px solid #1e293b', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>📥 FMCSA Forms</button>
                      <button onClick={() => setActiveEnterpriseTab('ifta')} style={{ background: activeEnterpriseTab === 'ifta' ? '#6366f1' : '#020617', color: '#fff', border: '1px solid #1e293b', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>⛽ IFTA Tax</button>
                      <button onClick={() => setActiveEnterpriseTab('eld')} style={{ background: activeEnterpriseTab === 'eld' ? '#6366f1' : '#020617', color: '#fff', border: '1px solid #1e293b', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>⏱️ ELD HOS</button>
                      <button onClick={() => setActiveEnterpriseTab('vault')} style={{ background: activeEnterpriseTab === 'vault' ? '#6366f1' : '#020617', color: '#fff', border: '1px solid #1e293b', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>🛡️ Vault</button>
                      <button onClick={() => setActiveEnterpriseTab('rbac')} style={{ background: activeEnterpriseTab === 'rbac' ? '#6366f1' : '#020617', color: '#fff', border: '1px solid #1e293b', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>🔒 RBAC</button>
                    </div>

                    <div style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', minHeight: '300px' }}>
                      {activeEnterpriseTab === 'settlements' && (
                        <div>
                          <h4 style={{ color: '#4ade80', marginBottom: '8px', fontSize: '1.1rem' }}>Driver Weekly Settlements & Factoring Integration</h4>
                          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '16px' }}>Automatic deduction calculator for fuel advances, insurance escrow, and quickpay factoring via TriumphPay (Customer PII Masked).</p>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div style={{ background: '#090d16', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Gross Fleet Load Pool (Aggregate)</span>
                              <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#fff' }}>$42,150.00</div>
                            </div>
                            <div style={{ background: '#090d16', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Factoring & Escrow Reserve</span>
                              <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#f59e0b' }}>-$3,161.25</div>
                            </div>
                          </div>
                          <div style={{ marginTop: '14px', background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.3)', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Net Distributable Settlement Pool:</span>
                            <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#4ade80' }}>$38,988.75</span>
                          </div>
                        </div>
                      )}

                      {activeEnterpriseTab === 'saferSearch' && (
                        <div>
                          <h4 style={{ color: '#38bdf8', marginBottom: '8px', fontSize: '1.1rem' }}>FMCSA SAFER System Carrier Search</h4>
                          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '14px' }}>Query live US DOT / MC numbers to verify operating authority status, safety ratings, and insurance verification before dispatching.</p>
                          
                          <form onSubmit={handleSaferSearch} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                            <input 
                              type="text" 
                              value={saferQuery} 
                              onChange={(e) => setSaferQuery(e.target.value)} 
                              placeholder="Enter MC# or DOT# (e.g. 3849102)" 
                              style={{ flex: 1, padding: '10px', background: '#090d16', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }} 
                              required
                            />
                            <button type="submit" style={{ background: '#38bdf8', color: '#0f172a', border: 'none', padding: '10px 18px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                              {saferLoading ? 'Searching...' : 'Search SAFER'}
                            </button>
                          </form>

                          {saferResult && (
                            <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '8px', padding: '14px', fontSize: '0.85rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '8px', marginBottom: '10px' }}>
                                <div>
                                  <strong style={{ fontSize: '0.95rem', color: '#fff' }}>{saferResult.legalName}</strong>
                                  <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>DBA: {saferResult.dba} | DOT#: {saferResult.dotNumber} | MC#: {saferResult.mcNumber}</div>
                                </div>
                                <span style={{ background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', border: '1px solid rgba(74, 222, 128, 0.3)', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.75rem' }}>
                                  {saferResult.status}
                                </span>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '10px' }}>
                                <div style={{ background: '#020617', padding: '8px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                                  <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Safety Rating</span>
                                  <div style={{ color: '#4ade80', fontWeight: 'bold' }}>{saferResult.safetyRating}</div>
                                </div>
                                <div style={{ background: '#020617', padding: '8px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                                  <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Power Units / Drivers</span>
                                  <div style={{ color: '#fff', fontWeight: 'bold' }}>{saferResult.powerUnits} Trucks / {saferResult.drivers} Drivers</div>
                                </div>
                                <div style={{ background: '#020617', padding: '8px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                                  <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>BIPD Insurance</span>
                                  <div style={{ color: '#38bdf8', fontWeight: 'bold' }}>{saferResult.insurances.bipd}</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {activeEnterpriseTab === 'fmcsaForms' && (
                        <div>
                          <h4 style={{ color: '#a855f7', marginBottom: '8px', fontSize: '1.1rem' }}>Official FMCSA Forms & Document Downloads</h4>
                          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '16px' }}>Quick access repository for federal motor carrier regulatory filings, operating authority packets, and lease templates.</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '210px', overflowY: 'auto' }}>
                            {fmcsaFormsList.map((form, idx) => (
                              <div key={idx} style={{ background: '#090d16', border: '1px solid #1e293b', padding: '10px 14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <span style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', marginRight: '8px' }}>
                                    {form.code}
                                  </span>
                                  <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{form.name}</span>
                                </div>
                                <a 
                                  href={form.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  style={{ background: '#1e293b', color: '#38bdf8', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                  📥 Download PDF
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeEnterpriseTab === 'ifta' && (
                        <div>
                          <h4 style={{ color: '#f59e0b', marginBottom: '8px', fontSize: '1.1rem' }}>Quarterly IFTA Fuel Tax Automation</h4>
                          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '16px' }}>Automatic mileage and fuel receipt aggregation by jurisdiction to streamline quarterly IFTA reporting.</p>
                          <div style={{ background: '#090d16', padding: '16px', borderRadius: '8px', border: '1px solid #1e293b', textAlign: 'center' }}>
                            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Active Q3 Tax Calculation Status</span>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#4ade80', marginTop: '6px' }}>All Jurisdictions Synced & Balanced</div>
                          </div>
                        </div>
                      )}

                      {activeEnterpriseTab === 'eld' && (
                        <div>
                          <h4 style={{ color: '#38bdf8', marginBottom: '8px', fontSize: '1.1rem' }}>ELD Hours of Service (HOS) Streaming</h4>
                          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '16px' }}>Real-time driver duty status logs, violation alerts, and FMCSA compliance records.</p>
                          <div style={{ background: '#090d16', padding: '16px', borderRadius: '8px', border: '1px solid #1e293b', textAlign: 'center' }}>
                            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Connected Telematics Stream</span>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#38bdf8', marginTop: '6px' }}>100% Compliant Logs Active</div>
                          </div>
                        </div>
                      )}

                      {activeEnterpriseTab === 'vault' && (
                        <div>
                          <h4 style={{ color: '#ec4899', marginBottom: '8px', fontSize: '1.1rem' }}>FMCSA Document Compliance Vault</h4>
                          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '16px' }}>Secure storage for driver qualifications, medical certificates, drug testing records, and insurance policies.</p>
                          <div style={{ background: '#090d16', padding: '16px', borderRadius: '8px', border: '1px solid #1e293b', textAlign: 'center' }}>
                            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Vault Status</span>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ec4899', marginTop: '6px' }}>Zero Expiring Documents</div>
                          </div>
                        </div>
                      )}

                      {activeEnterpriseTab === 'rbac' && (
                        <div>
                          <h4 style={{ color: '#818cf8', marginBottom: '8px', fontSize: '1.1rem' }}>Role-Based Access Control (RBAC)</h4>
                          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '16px' }}>Manage granular permissions for dispatchers, fleet managers, safety officers, and accountants.</p>
                          <div style={{ background: '#090d16', padding: '16px', borderRadius: '8px', border: '1px solid #1e293b', textAlign: 'center' }}>
                            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Active Roles Configured</span>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#818cf8', marginTop: '6px' }}>Master Admin Access Enabled</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {authMode === 'login' && (
                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '6px', color: '#fff' }}>Welcome Back</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '20px' }}>Log in to access your Trucking Edge Enterprise dashboard.</p>
                    
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>Email Address</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>Password</label>
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} />
                    </div>

                    <button 
                      type="button" 
                      onClick={() => onLoginSuccess()} 
                      style={{ width: '100%', background: '#6366f1', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Log In to Dashboard
                    </button>
                  </div>
                )}

                {authMode === 'signup' && (
                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '6px', color: '#38bdf8' }}>Enterprise Access Portal ({selectedPlan})</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '20px' }}>Complete your registration to deploy your dedicated fleet management suite.</p>
                    <button 
                      type="button" 
                      onClick={() => onLoginSuccess()} 
                      style={{ width: '100%', background: '#10b981', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Complete & Open Dashboard
                    </button>
                  </div>
                )}

                {authMode === 'dispatchForm' && (
                  <form onSubmit={handleDispatchSubmit}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '6px', color: '#10b981' }}>Apply for Dispatch Services</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '20px' }}>
                      Tiered commission rate based on your fleet size: <strong style={{ color: '#4ade80' }}>{getDispatchRate(truckCount)}</strong> for {truckCount} truck(s).
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Company Name</label>
                        <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="ABC Logistics" style={{ width: '100%', padding: '8px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} required />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>MC / DOT Number</label>
                        <input type="text" value={mcNumber} onChange={(e) => setMcNumber(e.target.value)} placeholder="MC123456" style={{ width: '100%', padding: '8px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} required />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Contact Email</label>
                        <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="dispatch@abclogistics.com" style={{ width: '100%', padding: '8px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} required />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Contact Phone</label>
                        <input type="text" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="(555) 000-0000" style={{ width: '100%', padding: '8px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} required />
                      </div>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Physical Business Address</label>
                      <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Highway Rd, City, State, ZIP" style={{ width: '100%', padding: '8px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Equipment Type</label>
                        <select value={truckType} onChange={(e) => setTruckType(e.target.value)} style={{ width: '100%', padding: '8px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff' }}>
                          <option value="Semi-Truck">Semi-Truck</option>
                          <option value="Box Truck">Box Truck</option>
                          <option value="Hotshot">Hotshot</option>
                          <option value="Power Only">Power Only</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Active Fleet Size ({truckCount} Trucks)</label>
                        <input type="range" min="1" max="20" value={truckCount} onChange={(e) => setTruckCount(Number(e.target.value))} style={{ width: '100%', accentColor: '#10b981', marginTop: '10px' }} />
                      </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Electronic Signature (Type Full Legal Name)</label>
                      <input type="text" value={signature} onChange={(e) => setSignature(e.target.value)} placeholder="John Doe" style={{ width: '100%', padding: '8px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} required />
                    </div>

                    <button type="submit" style={{ width: '100%', background: '#10b981', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Submit Dispatch Agreement & Open Suite
                    </button>
                  </form>
                )}

                {authMode === 'mcLeaseForm' && (
                  <form onSubmit={handleMcLeaseSubmit}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '6px', color: '#f59e0b' }}>Apply for MC Lease Program</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '20px' }}>Lease under our established authority or combine with full-service dispatching.</p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Company / Owner Name</label>
                        <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="John Doe Trucking" style={{ width: '100%', padding: '8px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} required />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Current MC / DOT (if applicable)</label>
                        <input type="text" value={mcNumber} onChange={(e) => setMcNumber(e.target.value)} placeholder="None / Pending" style={{ width: '100%', padding: '8px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} required />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Contact Email</label>
                        <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="owner@trucking.com" style={{ width: '100%', padding: '8px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} required />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Contact Phone</label>
                        <input type="text" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="(555) 000-0000" style={{ width: '100%', padding: '8px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} required />
                      </div>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Residential / Business Address</label>
                      <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="456 Fleet Ave, City, State, ZIP" style={{ width: '100%', padding: '8px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} required />
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Lease Program Option</label>
                      <select value={mcLeaseOption} onChange={(e) => setMcLeaseOption(e.target.value as any)} style={{ width: '100%', padding: '8px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff' }}>
                        <option value="leaseOnly">MC Lease Only (Access to Authority & Insurance)</option>
                        <option value="leaseWithDispatch">MC Lease + Full Dedicated Dispatching</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Electronic Signature</label>
                      <input type="text" value={signature} onChange={(e) => setSignature(e.target.value)} placeholder="Jane Smith" style={{ width: '100%', padding: '8px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} required />
                    </div>

                    <button type="submit" style={{ width: '100%', background: '#f59e0b', color: '#0f172a', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Submit MC Lease Application
                    </button>
                  </form>
                )}

                {authMode === 'demoBookingForm' && (
                  <form onSubmit={handleDemoSubmit}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '6px', color: '#38bdf8' }}>Schedule Enterprise Walkthrough</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '20px' }}>Book a 1-on-1 live demonstration of the Trucking Edge Enterprise platform with a logistics expert.</p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Your Full Name</label>
                        <input type="text" value={demoName} onChange={(e) => setDemoName(e.target.value)} placeholder="Alex Johnson" style={{ width: '100%', padding: '8px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} required />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Work Email</label>
                        <input type="email" value={demoEmail} onChange={(e) => setDemoEmail(e.target.value)} placeholder="alex@fleet.com" style={{ width: '100%', padding: '8px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} required />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Phone Number</label>
                        <input type="text" value={demoPhone} onChange={(e) => setDemoPhone(e.target.value)} placeholder="(555) 000-0000" style={{ width: '100%', padding: '8px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} required />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Preferred Date</label>
                        <input type="date" value={demoDate} onChange={(e) => setDemoDate(e.target.value)} style={{ width: '100%', padding: '8px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} required />
                      </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Preferred Time Slot</label>
                      <select value={demoTime} onChange={(e) => setDemoTime(e.target.value)} style={{ width: '100%', padding: '8px', background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff' }}>
                        <option value="09:00 AM">09:00 AM EST</option>
                        <option value="10:00 AM">10:00 AM EST</option>
                        <option value="01:00 PM">01:00 PM EST</option>
                        <option value="03:30 PM">03:30 PM EST</option>
                      </select>
                    </div>

                    <button type="submit" style={{ width: '100%', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Confirm Demo Booking
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;