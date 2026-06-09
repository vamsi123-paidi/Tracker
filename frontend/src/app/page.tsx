'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAuthToken } from '@/utils/api';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!getAuthToken());
  }, []);

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1.5rem',
      position: 'relative',
      zIndex: 1
    }}>
      {/* Theme toggle fixed in top-right */}
      <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 10 }}>
        <ThemeToggle />
      </div>

      {/* Hero Dual Panel Container */}
      <div className="split-container" style={{ marginBottom: '4rem' }}>
        {/* Left Side: Marketing Info */}
        <div className="split-right" style={{ flex: 1.1, animationName: 'slideFromLeft', width: 'auto' }}>
          <div style={{
            display: 'inline-block',
            padding: '6px 14px',
            borderRadius: '9999px',
            background: 'rgba(0, 242, 254, 0.05)',
            border: '1px solid rgba(0, 242, 254, 0.2)',
            color: 'var(--neon-primary)',
            fontSize: '0.85rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '1.5rem',
            width: 'max-content'
          }}>
            Secure Tracking Workspace
          </div>

          <h1 className="text-neon-cyan" style={{
            fontSize: '3rem',
            fontWeight: 800,
            letterSpacing: '-1px',
            marginBottom: '1rem',
            background: 'linear-gradient(to right, var(--neon-primary), var(--neon-secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            TaskTracker.io
          </h1>

          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '1.05rem',
            lineHeight: '1.6',
            marginBottom: '2.5rem'
          }}>
            A modern, high-fidelity secure workspace for students and trainers. Track deliverables, upload verification proofs, and review progression milestones with instant 3D analytics.
          </p>

          <div style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            {isLoggedIn ? (
              <Link href="/login" className="btn-neon" style={{ textDecoration: 'none' }}>
                Enter Workspace
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn-neon" style={{ textDecoration: 'none' }}>
                  Secure Sign In
                </Link>
                <a href="#features" className="btn-glass" style={{ textDecoration: 'none' }}>
                  Explore Features
                </a>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Animated Tech Graphic */}
        <div className="split-left" style={{ borderRight: 'none', borderLeft: '1px solid var(--border-glass)', animationName: 'slideFromRight' }}>
          {/* Laser Scanner Bar */}
          <div className="scanner-bar" />

          {/* Rotating tech circles */}
          <div className="tech-globe">
            <div className="tech-circle" style={{ borderColor: 'var(--neon-secondary)' }} />
            <div className="tech-circle-inner" style={{ borderColor: 'var(--neon-primary)' }} />
            <div className="tech-circle-center" />
          </div>

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h3 className="text-neon-purple" style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '0.5px' }}>Analytical Core</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>System Active & Synchronized</p>
          </div>

          {/* terminal readout */}
          <div className="info-terminal" style={{ color: 'var(--neon-secondary)', textShadow: 'var(--glow-secondary)' }}>
            <div className="terminal-line">&gt; SEEDING_SYSTEM_CORE... ACTIVE</div>
            <div className="terminal-line">&gt; LOAD_CAPACITY: NOMINAL</div>
            <div className="terminal-line">&gt; ENCRYPTED_BARRIER: STABLE</div>
          </div>
        </div>
      </div>

      {/* Feature Cards section below */}
      <div id="features" style={{
        maxWidth: '920px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '2rem'
      }}>
        <div className="glass-panel tilt-card">
          <h3 style={{ color: 'var(--neon-primary)', marginBottom: '0.5rem', fontWeight: 600 }}>Secure Sessions</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Enforced JWT logins, salted crypt-hashes, and college-segmented resource barriers keep submissions clean.
          </p>
        </div>

        <div className="glass-panel tilt-card">
          <h3 style={{ color: 'var(--neon-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>Bulk Provisioning</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Trainers upload student spreadsheets directly to parse, hash, and register student credentials instantly.
          </p>
        </div>

        <div className="glass-panel tilt-card">
          <h3 style={{ color: 'var(--neon-green)', marginBottom: '0.5rem', fontWeight: 600 }}>Real-time Reviews</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Screenshot uploading automatically linked via Cloudinary streams or disk fallbacks with Approve/Reject queues.
          </p>
        </div>
      </div>
    </main>
  );
}
