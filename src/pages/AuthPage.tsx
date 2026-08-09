import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useRegionStore, type UserRegion } from '../services/useRegion';

export const AuthPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [region, setRegion] = useState<UserRegion>('US');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { error } = isSignUp
      ? await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { region },
          },
        })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMsg(error.message);
    } else {
      // Save region to global store on successful authentication
      useRegionStore.getState().setUserRegion(region);
    }

    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#090d16', color: '#fff' }}>
      <form onSubmit={handleAuth} style={{ width: '320px', padding: '24px', background: '#1e293b', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
        <h2 style={{ marginTop: 0, textAlign: 'center' }}>{isSignUp ? 'Create Account' : 'Sign In'}</h2>

        {errorMsg && <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>{errorMsg}</p>}

        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Email</label>
        <input 
          type="email" 
          required 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '16px', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
        />

        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Password</label>
        <input 
          type="password" 
          required 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '16px', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
        />

        {/* Region Selection Dropdown */}
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Operating Region</label>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value as UserRegion)}
          style={{ width: '100%', padding: '8px', marginBottom: '20px', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff', outline: 'none' }}
        >
          <option value="US">🇺🇸 United States (FMCSA)</option>
          <option value="EU">🇪🇺 European Union (EC 561/2006)</option>
        </select>

        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', padding: '10px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>

        <p style={{ marginTop: '16px', fontSize: '0.85rem', textAlign: 'center', cursor: 'pointer', color: '#94a3b8' }} onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </p>
      </form>
    </div>
  );
};

export default AuthPage;