import React from 'react';

interface LandingPageProps {
  onGuestLogin: () => void;
  onAccessCommandCenter?: () => void;
}

export default function LandingPage({ onGuestLogin, onAccessCommandCenter }: LandingPageProps) {
  return (
    <div style={{ minHeight: '100vh', background: '#090d16', color: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', boxSizing: 'border-box' }}>
      
      {/* Navigation Bar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 48px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: '#111827', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.5rem' }}>🚛</span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.025em', margin: 0, color: '#fff' }}>TRUCKING EDGE</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={onGuestLogin}
            style={{ background: 'transparent', color: '#cbd5e1', border: '1px solid #374151', padding: '8px 16px', borderRadius: '6px', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Guest Portal
          </button>
          {onAccessCommandCenter && (
            <button 
              onClick={onAccessCommandCenter}
              style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer', transition: 'background 0.2s' }}
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: 'rgba(37, 99, 235, 0.1)', color: '#38bdf8', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8125rem', fontWeight: '600', marginBottom: '24px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
          🚀 Next-Generation Enterprise Fleet TMS & Dispatch
        </div>
        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '800', letterSpacing: '-0.025em', margin: '0 0 20px 0', lineHeight: '1.1', color: '#f8fafc' }}>
          Maximize Your Fleet RPM & <span style={{ color: '#38bdf8' }}>Streamline Dispatch</span>
        </h1>
        <p style={{ fontSize: '1.125rem', color: '#94a3b8', maxWidth: '700px', margin: '0 auto 40px auto', lineHeight: '1.6' }}>
          Trucking Edge empowers independent carriers and dispatchers with live MC search tools, automated IFTA tracking, profit calculator suites, and seamless load management.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button 
            onClick={onGuestLogin}
            style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '8px', fontWeight: '600', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)', transition: 'background 0.2s' }}
          >
            Explore Interactive Portal
          </button>
          {onAccessCommandCenter && (
            <button 
              onClick={onAccessCommandCenter}
              style={{ background: '#1f2937', color: '#f8fafc', border: '1px solid #374151', padding: '14px 28px', borderRadius: '8px', fontWeight: '600', fontSize: '1rem', cursor: 'pointer', transition: 'background 0.2s' }}
            >
              Enterprise Login
            </button>
          )}
        </div>
      </section>

      {/* Feature Grid Overview */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 80px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          
          <div style={{ background: '#111827', padding: '32px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '16px' }}>📊</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0 0 10px 0', color: '#fff' }}>Live RPM & Profitability</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: '1.5', margin: 0 }}>
              Calculate net profit per mile instantly by factoring in fuel burn, empty deadhead miles, and operational costs.
            </p>
          </div>

          <div style={{ background: '#111827', padding: '32px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '16px' }}>⛽</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0 0 10px 0', color: '#fff' }}>Interactive Fuel Mapping</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: '1.5', margin: 0 }}>
              Locate nearby travel centers, filter diesel prices across interstate corridors, and optimize your fueling stops.
            </p>
          </div>

          <div style={{ background: '#111827', padding: '32px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🏛️</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0 0 10px 0', color: '#fff' }}>Compliance & IFTA Support</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: '1.5', margin: 0 }}>
              Keep track of driver hours of service (HOS), ELD records, state fuel mileage summaries, and seamless tax reporting.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '24px 48px', textAlign: 'center', background: '#111827', color: '#94a3b8', fontSize: '0.8125rem' }}>
        <p style={{ margin: 0 }}>© 2026 Trucking Edge Dispatch Systems. All rights reserved.</p>
      </footer>

    </div>
  );
}