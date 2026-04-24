import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Auth({ onGuest }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setMessage('Check your email for a confirmation link.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }

    setLoading(false);
  }

  function toggleMode() {
    setMode(m => (m === 'signin' ? 'signup' : 'signin'));
    setError('');
    setMessage('');
  }

  const colorLetters = ['C','O','L','O','R'];
  const isSignUp = mode === 'signup';

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 game-scroll animate-scan-in"
      style={{ background: 'var(--bg)', position: 'relative', zIndex: 1 }}
    >
      {/* Animated title */}
      <div className="text-center mb-8 select-none">
        <h1 style={{ fontFamily: 'var(--font-pixel)', fontSize: 28, lineHeight: 1.3, letterSpacing: '0.05em' }}>
          {colorLetters.map((ch, i) => (
            <span key={i} className="color-letter" style={{ animationDelay: `${-(i * 0.8)}s` }}>
              {ch}
            </span>
          ))}
          <br />
          <span style={{ color: 'var(--text)' }}>SWITCH</span>
        </h1>
        <p style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: 8,
          color: 'var(--muted)',
          letterSpacing: '0.25em',
          marginTop: 10,
          animation: 'glowPulse 1.4s ease-in-out infinite',
        }}>
          TUBE CHALLENGE
        </p>
      </div>

      {/* Auth card */}
      <div className="retro-card w-full" style={{ maxWidth: 360 }}>
        <h2 style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: 10,
          color: 'var(--accent)',
          letterSpacing: '0.12em',
          marginBottom: 20,
          textAlign: 'center',
        }}>
          {isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontFamily: 'var(--font-pixel)', fontSize: 7, color: 'var(--muted)', letterSpacing: '0.1em' }}>
              EMAIL
            </label>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                background: 'var(--raised)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                padding: '10px 12px',
                borderRadius: 4,
                outline: 'none',
                width: '100%',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontFamily: 'var(--font-pixel)', fontSize: 7, color: 'var(--muted)', letterSpacing: '0.1em' }}>
              PASSWORD
            </label>
            <input
              type="password"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                background: 'var(--raised)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                padding: '10px 12px',
                borderRadius: 4,
                outline: 'none',
                width: '100%',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
            />
          </div>

          {error && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--danger)', textAlign: 'center' }}>
              {error}
            </p>
          )}
          {message && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--success)', textAlign: 'center' }}>
              {message}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-neon" style={{ marginTop: 4, width: '100%' }}>
            {loading ? 'PLEASE WAIT...' : isSignUp ? 'SIGN UP' : 'INSERT COIN'}
          </button>
        </form>

        <p style={{ marginTop: 18, textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--muted)' }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={toggleMode}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent)',
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', maxWidth: 360, marginTop: 18 }}>
        <hr style={{ flex: 1, borderColor: 'var(--border)' }} />
        <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 7, color: 'var(--muted)' }}>OR</span>
        <hr style={{ flex: 1, borderColor: 'var(--border)' }} />
      </div>

      <button
        type="button"
        onClick={onGuest}
        className="btn-ghost"
        style={{ marginTop: 12, width: '100%', maxWidth: 360 }}
      >
        Continue as Guest
      </button>
    </div>
  );
}
