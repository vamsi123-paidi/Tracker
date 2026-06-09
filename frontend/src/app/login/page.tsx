'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, setAuthToken, getAuthToken } from '@/utils/api';
import { ThemeToggle } from '@/components/ThemeToggle';

// Cybernetic Telemetry Loading Overlay
const QuantumLoader: React.FC<{ message?: string }> = ({ message }) => {
  const [logIndex, setLogIndex] = useState(0);
  const telemetryLogs = [
    'ESTABLISHING SECURE PROTOCOLS...',
    'ESTABLISHING HANDSHAKE WITH VERIFIER CORES...',
    'TRANSMITTING ENCRYPTED ACCESS KEY...',
    'AUTHENTICATING SESSION JWT SIGNATURES...',
    'SYNC COMPLETE. REDIRECTING...'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLogIndex((prev) => (prev < telemetryLogs.length - 1 ? prev + 1 : prev));
    }, 450);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(2, 2, 7, 0.93)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999999,
      padding: '2rem'
    }}>
      {/* Dynamic 3D Concentric Ring Spinner */}
      <div style={{ position: 'relative', width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', marginBottom: '2.5rem' }}>
        {/* Outer clockwise circle */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          border: '3px dashed var(--neon-primary)',
          animation: 'rotateCW 10s linear infinite',
          boxShadow: 'inset 0 0 15px rgba(245, 158, 11, 0.1)',
          opacity: 0.8
        }} />
        
        {/* Middle counter-clockwise circle */}
        <div style={{
          position: 'absolute',
          width: '80%',
          height: '80%',
          borderRadius: '50%',
          border: '2px dotted var(--neon-secondary)',
          animation: 'rotateCCW 6s linear infinite',
          boxShadow: '0 0 15px rgba(16, 185, 129, 0.15)',
          opacity: 0.7
        }} />

        {/* Inner clockwise circle */}
        <div style={{
          position: 'absolute',
          width: '60%',
          height: '60%',
          borderRadius: '50%',
          border: '3px double var(--neon-blue)',
          animation: 'rotateCW 3s linear infinite',
          boxShadow: 'inset 0 0 10px rgba(255, 107, 53, 0.2)',
          opacity: 0.6
        }} />

        {/* Pulsing Core */}
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--neon-primary) 0%, var(--neon-secondary) 100%)',
          boxShadow: 'var(--glow-primary)',
          animation: 'pulseScale 1.5s ease-in-out infinite'
        }} />

        {/* Scanning laser line overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, transparent, var(--neon-green), transparent)',
          boxShadow: 'var(--glow-green)',
          opacity: 0.7,
          animation: 'scanVertically 3.5s ease-in-out infinite',
          pointerEvents: 'none'
        }} />
      </div>

      {/* Upload Telemetry Message */}
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: 700,
        color: '#fff',
        letterSpacing: '1px',
        marginBottom: '0.75rem',
        fontFamily: 'var(--font-mono)',
        textTransform: 'uppercase',
        textShadow: '0 0 10px rgba(255, 255, 255, 0.2)'
      }}>
        {message || 'SYNCING WITH SECURE DATABASE'}
      </h3>

      {/* Terminal Readout Logs */}
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '480px',
        background: 'rgba(0, 0, 0, 0.4)',
        borderColor: 'var(--border-glass)',
        padding: '1rem 1.25rem',
        borderRadius: '10px',
        fontFamily: 'monospace',
        fontSize: '0.8rem',
        lineHeight: '1.5',
        color: 'var(--text-muted)'
      }}>
        <div style={{ color: 'var(--neon-green)', fontWeight: 600, display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px' }}>
          <span>🛰️ CORE_NODE_STATUS</span>
          <span style={{ animation: 'pulseScale 1s infinite' }}>ONLINE</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {telemetryLogs.slice(0, logIndex + 1).map((log, idx) => (
            <div key={idx} style={{
              color: idx === logIndex ? 'var(--neon-primary)' : 'var(--text-muted)',
              display: 'flex',
              gap: '6px',
              textShadow: idx === logIndex ? '0 0 6px rgba(245, 158, 11, 0.3)' : 'none'
            }}>
              <span>&gt;</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

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

      {/* Dual Panel Container */}
      <div className="split-container">
        {/* Left Panel: Info Panel */}
        <div className="split-left">
          {/* Laser Scanner Bar */}
          <div className="scanner-bar" />

          {/* Glowing rotating Concentric circles */}
          <div className="tech-globe">
            <div className="tech-circle" />
            <div className="tech-circle-inner" />
            <div className="tech-circle-center" />
          </div>

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h3 className="text-neon-cyan" style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.5px' }}>Task Tracker Interface</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>Milestone Verification Core</p>
          </div>
          {/* Code Terminal Output lines */}
          <div className="info-terminal">
            <div className="terminal-line">&gt; DECRYPTING_SECURE_PORTALS... OK</div>
            <div className="terminal-line">&gt; SYSTEM_STATUS: ONLINE</div>
            <div className="terminal-line">&gt; CONNECTION: ENCRYPTED_JWT</div>
            <div className="terminal-line">&gt; SHIELD_CORE_INTEGRITY: 100%</div>
          </div>
        </div>

        {/* Right Panel: Secure Login Form */}
        <div className="split-right">
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

            <button type="submit" disabled={isLoading} className="btn-neon btn-decrypt" style={{ marginTop: '0.75rem', width: '100%', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.3s ease' }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              {isLoading ? 'DECRYPTING...' : 'INITIALIZE_SESSION'}
            </button>
          </form>
        </div>
      </div>

      {isLoading && (
        <QuantumLoader message="DECRYPTING LOGIN CREDENTIALS" />
      )}
    </main>
  );
}
