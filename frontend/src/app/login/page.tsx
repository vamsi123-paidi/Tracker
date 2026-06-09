'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, setAuthToken, getAuthToken } from '@/utils/api';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If already logged in, fetch user details and redirect
    const token = getAuthToken();
    if (token) {
      api.get('/auth/me')
        .then((user) => {
          if (user.role === 'trainer') router.push('/trainer');
          else router.push('/student');
        })
        .catch(() => {
          // Token is invalid, let them log in
        });
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await api.post('/auth/login', { email, password });
      setAuthToken(data.token);

      if (data.user.role === 'trainer') {
        router.push('/trainer');
      } else {
        router.push('/student');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      zIndex: 1
    }}>
      {/* Theme toggle fixed in top-right */}
      <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 10 }}>
        <ThemeToggle />
      </div>

      {/* Holographic Dual Panel Container */}
      <div className="holo-container">
        {/* Left Panel: Holographic Simulator Graphic */}
        <div className="holo-left">
          {/* Laser Scanner Bar */}
          <div className="holo-scanner-bar" />

          {/* Glowing rotating Concentric circles */}
          <div className="holo-globe">
            <div className="holo-circle" />
            <div className="holo-circle-inner" />
            <div className="holo-circle-center" />
          </div>

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h3 className="text-neon-cyan" style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.5px' }}>Task Tracker Interface</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>Milestone Verification Core</p>
          </div>
          {/* Code Terminal Output lines */}
          <div className="holo-terminal">
            <div className="holo-line">&gt; DECRYPTING_SECURE_PORTALS... OK</div>
            <div className="holo-line">&gt; SYSTEM_STATUS: ONLINE</div>
            <div className="holo-line">&gt; CONNECTION: ENCRYPTED_JWT</div>
            <div className="holo-line">&gt; SHIELD_CORE_INTEGRITY: 100%</div>
          </div>
        </div>

        {/* Right Panel: Secure Login Form */}
        <div className="holo-right">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 className="text-neon-cyan" style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
              Secure Login
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '0.5rem' }}>
              Access your student or trainer portal
            </p>
          </div>

          {error && (
            <div style={{
              background: 'rgba(255, 0, 85, 0.08)',
              border: '1px solid rgba(255, 0, 85, 0.2)',
              color: 'var(--neon-red)',
              padding: '12px 16px',
              borderRadius: '10px',
              fontSize: '0.88rem',
              marginBottom: '2rem',
              textAlign: 'center',
              boxShadow: 'var(--glow-red)'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px' }}>
                EMAIL_ADDRESS
              </label>
              <input
                type="email"
                required
                className="glass-input"
                placeholder="student@college.edu or trainer@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px' }}>
                ACCESS_PASSWORD
              </label>
              <input
                type="password"
                required
                className="glass-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" disabled={isLoading} className="btn-neon" style={{ marginTop: '0.75rem', width: '100%' }}>
              {isLoading ? 'DECRYPTING...' : 'INITIALIZE_SESSION'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
