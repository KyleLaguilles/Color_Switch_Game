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
      // on success App.jsx picks up the session change automatically
    }

    setLoading(false);
  }

  function toggleMode() {
    setMode(m => (m === 'signin' ? 'signup' : 'signin'));
    setError('');
    setMessage('');
  }

  const title = 'ColorSwitch'.split('');
  const isSignUp = mode === 'signup';

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'var(--bg)' }}
    >
      {/* Animated title */}
      <h1
        className="mb-8 text-5xl font-black tracking-tight select-none"
        style={{ fontFamily: "'Big Shoulders Display', sans-serif" }}
      >
        {title.map((ch, i) => (
          <span
            key={i}
            className="color-letter"
            style={{ animationDelay: `${i * 0.3}s` }}
          >
            {ch}
          </span>
        ))}
      </h1>

      {/* Card */}
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <h2
          className="text-xl font-bold mb-6 text-center"
          style={{ color: 'var(--text)' }}
        >
          {isSignUp ? 'Create account' : 'Sign in'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2"
              style={{
                background: 'var(--raised)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                ringColor: 'var(--accent)',
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
              Password
            </label>
            <input
              type="password"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2"
              style={{
                background: 'var(--raised)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            />
          </div>

          {error && (
            <p className="text-sm text-center" style={{ color: 'var(--danger)' }}>
              {error}
            </p>
          )}

          {message && (
            <p className="text-sm text-center" style={{ color: 'var(--success)' }}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg py-2.5 text-sm font-bold tracking-wide transition-opacity disabled:opacity-50"
            style={{ background: 'var(--accent)', color: 'oklch(10% 0.02 280)' }}
          >
            {loading ? 'Please wait…' : isSignUp ? 'Sign up' : 'Sign in'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm" style={{ color: 'var(--muted)' }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={toggleMode}
            className="font-semibold hover:underline"
            style={{ color: 'var(--accent)' }}
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>

      <div className="mt-5 flex items-center gap-3 w-full max-w-sm">
        <hr className="flex-1" style={{ borderColor: 'var(--border)' }} />
        <span className="text-xs" style={{ color: 'var(--muted)' }}>or</span>
        <hr className="flex-1" style={{ borderColor: 'var(--border)' }} />
      </div>

      <button
        type="button"
        onClick={onGuest}
        className="mt-3 w-full max-w-sm rounded-lg py-2.5 text-sm font-semibold border transition-all duration-150 hover:brightness-125 active:scale-95"
        style={{
          background: 'transparent',
          borderColor: 'oklch(100% 0 0 / 0.22)',
          color: 'var(--text)',
        }}
      >
        Continue as Guest
      </button>
    </div>
  );
}
