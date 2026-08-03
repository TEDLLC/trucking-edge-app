import React, { useState, useEffect } from 'react';

export const AnimatedWalkthrough: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState('2026-08-15');
  const [selectedTime, setSelectedTime] = useState('11:00 AM');
  const [isAnimating, setIsAnimating] = useState(false);

  // Simulated auto-playback loop for landing page demo
  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setStep((prev) => (prev >= 3 ? 1 : prev + 1));
        setIsAnimating(false);
      }, 400);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', background: '#090d16', border: '1px solid #1e293b', borderRadius: '16px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)', fontFamily: 'sans-serif', color: '#f8fafc', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background ambient glow matching branding */}
      <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '180px', height: '180px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }}></div>

      {/* Header & Step Tracker */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #1e293b', paddingBottom: '16px' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '1px' }}>Interactive Walkthrough Simulation</span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginTop: '4px' }}>Book Enterprise Suite Demo</h3>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{ width: s === step ? '24px' : '8px', height: '8px', borderRadius: '4px', background: s <= step ? '#38bdf8' : '#1e293b', transition: 'all 0.3s ease' }} />
          ))}
        </div>
      </div>

      {/* Animated Step Content Container */}
      <div style={{ opacity: isAnimating ? 0 : 1, transform: isAnimating ? 'translateY(10px)' : 'translateY(0)', transition: 'all 0.3s ease-in-out' }}>
        {step === 1 && (
          <div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '16px' }}>Step 1: Select your preferred consultation date with our logistics architecture team.</p>
            <div style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Enterprise Strategy Date</label>
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)} 
                style={{ width: '100%', padding: '12px', background: '#090d16', border: '1px solid #38bdf8', borderRadius: '8px', color: '#fff', fontSize: '1rem', outline: 'none' }} 
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '16px' }}>Step 2: Choose an available time window for your live TMS & PII masking walkthrough.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'].map((time) => (
                <div 
                  key={time} 
                  onClick={() => setSelectedTime(time)}
                  style={{ padding: '14px', background: selectedTime === time ? 'rgba(56, 189, 248, 0.15)' : '#020617', border: selectedTime === time ? '1px solid #38bdf8' : '1px solid #1e293b', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', fontWeight: selectedTime === time ? 'bold' : 'normal', color: selectedTime === time ? '#38bdf8' : '#cbd5e1', transition: 'all 0.2s' }}
                >
                  {time} EST
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(74, 222, 128, 0.15)', border: '1px solid #4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#4ade80', fontSize: '1.2rem' }}>
              ✓
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', marginBottom: '6px' }}>Walkthrough Confirmed!</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5' }}>
              Your session is locked in for <strong style={{ color: '#38bdf8' }}>{selectedDate}</strong> at <strong style={{ color: '#38bdf8' }}>{selectedTime}</strong>. Calendar invite generated automatically.
            </p>
          </div>
        )}
      </div>

      {/* Interactive Footer Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #1e293b' }}>
        <button 
          onClick={() => setStep((prev) => (prev > 1 ? prev - 1 : 3))}
          style={{ background: 'transparent', border: '1px solid #1e293b', color: '#94a3b8', padding: '8px 16px', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}
        >
          {step === 1 ? 'Restart' : 'Back'}
        </button>
        <button 
          onClick={() => setStep((prev) => (prev >= 3 ? 1 : prev + 1))}
          style={{ background: '#38bdf8', color: '#0f172a', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)' }}
        >
          {step === 3 ? 'Book Another' : 'Continue ➔'}
        </button>
      </div>

    </div>
  );
};