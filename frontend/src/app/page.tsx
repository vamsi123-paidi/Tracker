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
      position: 'relative',
      zIndex: 1,
      padding: '0 0 4rem 0'
    }}>
      {/* 1. Floating Header Navbar */}
      <header className="glass-panel" style={{
        position: 'sticky',
        top: '1rem',
        width: 'calc(100% - 2rem)',
        maxWidth: '1200px',
        margin: '1rem auto 3rem auto',
        padding: '0.75rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100,
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.4rem', color: 'var(--neon-primary)', textShadow: 'var(--glow-primary)', animation: 'pulseScale 2s infinite' }}>✦</span>
          <span style={{ fontSize: '1.35rem', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '-0.5px' }}>
            <span style={{ color: 'var(--neon-primary)', textShadow: 'var(--glow-primary)' }}>S</span>
            <span style={{ color: 'var(--neon-secondary)', textShadow: 'var(--glow-secondary)' }}>P</span>
            <span style={{ color: 'var(--neon-blue)', textShadow: 'var(--glow-primary)' }}>A</span>
            <span style={{ color: 'var(--neon-yellow)', textShadow: 'var(--glow-yellow)' }}>R</span>
            <span style={{ color: 'var(--neon-green)', textShadow: 'var(--glow-green)' }}>K</span>
            <span style={{ color: 'var(--text-primary)', opacity: 0.85 }}>.io</span>
          </span>
        </div>
 
        {/* Desktop Quick Nav Links */}
        <nav className="desktop-nav" style={{ display: 'flex', gap: '2rem' }}>
          <a href="#features" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--neon-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
            Features
          </a>
          <a href="#statistics" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--neon-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'} onClick={(e) => { e.preventDefault(); document.getElementById('statistics')?.scrollIntoView({ behavior: 'smooth' }); }}>
            Portal Stats
          </a>
          <a href="/login" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#ff6b35'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
            Developer Portal
          </a>
        </nav>

        {/* Right Side Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ThemeToggle />
          {isLoggedIn ? (
            <Link href="/student" className="btn-neon" style={{ padding: '8px 18px', fontSize: '0.8rem', textDecoration: 'none', borderRadius: '8px' }}>
              Dashboard
            </Link>
          ) : (
            <Link href="/login" className="btn-neon" style={{ padding: '8px 18px', fontSize: '0.8rem', textDecoration: 'none', borderRadius: '8px' }}>
              Secure Access
            </Link>
          )}
        </div>
      </header>

      {/* 2. Hero Section */}
      <div className="split-container" style={{ maxWidth: '1200px', width: 'calc(100% - 2rem)', margin: '0 auto 4rem auto' }}>
        {/* Left Side: Marketing Info */}
        <div className="split-right" style={{ flex: 1.2, animationName: 'slideFromLeft', width: 'auto', padding: '3rem 2rem' }}>
          <div style={{
            display: 'inline-block',
            padding: '6px 14px',
            borderRadius: '9999px',
            background: 'rgba(245, 158, 11, 0.05)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            color: 'var(--neon-primary)',
            fontSize: '0.85rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '1.5rem',
            width: 'max-content'
          }}>
            Secure Milestone Hub & Compiler
          </div>

          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 800,
            letterSpacing: '-1.5px',
            lineHeight: '1.1',
            marginBottom: '1.25rem',
            background: 'linear-gradient(to right, var(--neon-primary) 0%, var(--neon-secondary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 30px rgba(245, 158, 11, 0.15)'
          }}>
            Unified Learning & Task Verification Space.
          </h1>

          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '1.05rem',
            lineHeight: '1.7',
            marginBottom: '2.5rem',
            maxWidth: '540px'
          }}>
            SPARK (Student Progress, Assessment, Resources, & Knowledge) accelerates student progression by integrating high-fidelity task verifications, sandboxed multi-pane compilers, proctored examinations, and automated feedback engines inside a single secure portal.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {isLoggedIn ? (
              <Link href="/student" className="btn-neon" style={{ textDecoration: 'none', padding: '12px 24px' }}>
                Enter Portal Workspace →
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn-neon" style={{ textDecoration: 'none', padding: '12px 24px' }}>
                  Secure Sign In
                </Link>
                <a href="#features" className="btn-glass" style={{ textDecoration: 'none', padding: '12px 24px' }}>
                  Explore Platform Features
                </a>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Animated Tech Graphic */}
        <div className="split-left" style={{ borderRight: 'none', borderLeft: '1px solid var(--border-glass)', animationName: 'slideFromRight', padding: '3rem 2rem' }}>
          {/* Laser Scanner Bar */}
          <div className="scanner-bar" />

          {/* Rotating tech circles */}
          <div className="tech-globe">
            <div className="tech-circle" style={{ borderColor: 'var(--neon-secondary)', boxShadow: 'var(--glow-secondary)' }} />
            <div className="tech-circle-inner" style={{ borderColor: 'var(--neon-primary)', boxShadow: 'var(--glow-primary)' }} />
            <div className="tech-circle-center" />
          </div>

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h3 className="text-neon-cyan" style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '0.5px' }}>Omni-Core Active</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>Interactive Handshake Complete</p>
          </div>

          {/* terminal readout */}
          <div className="info-terminal" style={{ color: 'var(--neon-secondary)', textShadow: 'var(--glow-secondary)' }}>
            <div className="terminal-line">&gt; VERIFYING_PORTAL_CORES... OK</div>
            <div className="terminal-line">&gt; INTERACTIVE_CANVAS_MESH... 60FPS</div>
            <div className="terminal-line">&gt; PROCTORED_SECURE_TUNNEL... STABLE</div>
          </div>
        </div>
      </div>

      {/* 3. Interactive Portal Statistics Section */}
      <section id="statistics" className="glass-panel" style={{
        maxWidth: '1200px',
        width: 'calc(100% - 2rem)',
        margin: '0 auto 4rem auto',
        padding: '2.5rem 2rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '2rem',
        textAlign: 'center',
        background: 'rgba(5, 6, 15, 0.45)'
      }}>
        <div>
          <h4 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--neon-primary)', textShadow: 'var(--glow-primary)', fontFamily: 'var(--font-mono)', margin: 0 }}>100+</h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--neon-primary)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', margin: '4px 0 8px 0' }}>SEEDED_CHALLENGES</span>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Progressive HTML/CSS/JS web challenges auto-run in browser sandbox.</p>
        </div>
        <div style={{ borderLeft: '1px solid var(--border-glass)' }} className="stat-divider">
          <h4 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--neon-green)', textShadow: 'var(--glow-green)', fontFamily: 'var(--font-mono)', margin: 0 }}>9+</h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--neon-green)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', margin: '4px 0 8px 0' }}>COMPILER_LANGUAGES</span>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Write and compile scripts in C, C++, Python, Java, JS, Rust, Go, C#, PHP.</p>
        </div>
        <div style={{ borderLeft: '1px solid var(--border-glass)' }} className="stat-divider">
          <h4 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--neon-secondary)', textShadow: 'var(--glow-secondary)', fontFamily: 'var(--font-mono)', margin: 0 }}>🛡️ PROCTOR</h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--neon-secondary)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', margin: '4px 0 8px 0' }}>INTEGRITY_SHIELD</span>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Enforced copy-paste block, tab blur tracker telemetry, and full-screen lockdown.</p>
        </div>
        <div style={{ borderLeft: '1px solid var(--border-glass)' }} className="stat-divider">
          <h4 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--neon-yellow)', textShadow: 'var(--glow-yellow)', fontFamily: 'var(--font-mono)', margin: 0 }}>⚡ AUTO</h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--neon-yellow)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', margin: '4px 0 8px 0' }}>REVIEW_ENGINE</span>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Instant deliverable notes and URL repository checks verify tasks in seconds.</p>
        </div>
      </section>

      {/* 4. Comprehensive Features Grid Section */}
      <section id="features" style={{
        maxWidth: '1200px',
        width: 'calc(100% - 2rem)',
        margin: '0 auto 4rem auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{ color: 'var(--neon-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
            SYSTEM_CAPABILITIES
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginTop: '6px' }}>
            What does SPARK.io provide?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '8px auto 0 auto', maxWidth: '600px' }}>
            Explore the core feature sets engineered to make training verifications fast, immersive, and responsive across all device sizes.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem'
        }}>
          {/* Feature 1 */}
          <div className="glass-panel tilt-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem', background: 'rgba(245, 158, 11, 0.1)', padding: '8px', borderRadius: '10px', color: 'var(--neon-primary)' }}>📊</span>
              <h3 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 600, margin: 0 }}>Milestone Progression Hub</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
              Students track progress checkmarks (grey for not submitted, yellow for pending, red for rejected, and green for approved). Easily upload deliverables screenshot proof and live project links for reviews.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-panel tilt-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', padding: '8px', borderRadius: '10px', color: 'var(--neon-secondary)' }}>💻</span>
              <h3 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 600, margin: 0 }}>Monaco Code Sandbox IDE</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
              A built-in split-layout compiler (HTML, CSS, JS Monaco workspace) displaying sandboxed browser execution iframe. Features autocomplete, line wraps, Emmet tag boilerplate outputs, and auto-close brackets.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-panel tilt-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem', background: 'rgba(0, 255, 135, 0.1)', padding: '8px', borderRadius: '10px', color: 'var(--neon-green)' }}>📝</span>
              <h3 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 600, margin: 0 }}>Proctored Secure Exams</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
              Exams launch inside a secure proctor frame. Tracks browser tab blurs warning telemetry (auto-submits on 3 triggers), locks copy-paste keys, blocks page right-clicks, and evaluates grades dynamically on the server.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="glass-panel tilt-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem', background: 'rgba(255, 208, 0, 0.1)', padding: '8px', borderRadius: '10px', color: 'var(--neon-yellow)' }}>📒</span>
              <h3 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 600, margin: 0 }}>Advanced Notes Workspace</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
              Draft and search lecture notes in a dual-pane workspace. Utilizes quick-insert triggers (💡 Definition blocks, ❓ Q&As, 💻 code snips, 📋 bullet lists), renders markdown preview, and supports download exports as `.md` files.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="glass-panel tilt-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem', background: 'rgba(255, 107, 53, 0.1)', padding: '8px', borderRadius: '10px', color: 'var(--neon-blue)' }}>⚙️</span>
              <h3 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 600, margin: 0 }}>System-Assisted Reviews</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
              An automated auto-review checker evaluates student submission notes and check links immediately upon delivery. Instantly validates live repository links, preventing placeholder submits.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="glass-panel tilt-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem', background: 'rgba(255, 255, 255, 0.04)', padding: '8px', borderRadius: '10px', color: 'var(--text-primary)' }}>👥</span>
              <h3 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 600, margin: 0 }}>Trainer Command Analytics</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
              Trainers parse and bulk-register students from CSV/Excel rosters. Monitor active submissions queue, verify screenshot uploads, inspect student dashboard progress doughnuts, and view 3D cylinder analytics.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Secure themed Footer */}
      <footer style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '2rem auto 0 auto',
        padding: '2rem 1.5rem 0 1.5rem',
        borderTop: '1px solid var(--border-glass)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            © {new Date().getFullYear()} SPARK.io Workspace Core. All rights reserved.
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--neon-green)', background: 'rgba(0,255,135,0.06)', border: '1px solid rgba(0,255,135,0.2)', padding: '3px 8px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
            SSL_SECURE
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--neon-primary)', background: 'rgba(245, 158, 11,0.06)', border: '1px solid rgba(245, 158, 11,0.2)', padding: '3px 8px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
            PROCTOR_ACTIVE
          </span>
        </div>
      </footer>

      {/* Custom responsive overrides */}
      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .stat-divider {
            border-left: none !important;
            border-top: 1px solid var(--border-glass);
            padding-top: 1.5rem;
          }
          h1 {
            font-size: 2.2rem !important;
          }
        }
      `}</style>
    </main>
  );
}
