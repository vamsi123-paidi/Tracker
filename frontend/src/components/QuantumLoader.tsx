'use client';

import React, { useState, useEffect } from 'react';

interface QuantumLoaderProps {
  message?: string;
}

export const QuantumLoader: React.FC<QuantumLoaderProps> = ({ message }) => {
  const [logIndex, setLogIndex] = useState(0);
  const telemetryLogs = [
    'INITIALIZING SECURE PROTOCOLS...',
    'ESTABLISHING HANDSHAKE WITH VERIFIER CORES...',
    'COMPILING DEPLOYED BINDINGS AND DEPENDENCY SCHEMAS...',
    'EVALUATING DOM & FUNCTIONAL SYNTAX TREE...',
    'COMPUTING COMPLEXITY SCORES AND TELEMETRY TELEPORT...',
    'TRANSMITTING ENCRYPTED BYTE ARRAYS TO API DATABASE...',
    'CALIBRATING PORTAL RANKS & COMPLETED MILESTONES...',
    'INTEGRATING LEDGER INDEX UPDATES...',
    'FINISHING DATA TRANSCEIVER HANDSHAKE...',
    'SYNC COMPLETE. REDIRECTING...'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLogIndex((prev) => (prev < telemetryLogs.length - 1 ? prev + 1 : prev));
    }, 550);
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
          boxShadow: 'inset 0 0 15px rgba(139, 92, 246, 0.1)',
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
          boxShadow: '0 0 15px rgba(6, 182, 212, 0.15)',
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
          boxShadow: 'inset 0 0 10px rgba(59, 130, 246, 0.2)',
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
        fontSize: '0.78rem',
        boxShadow: 'var(--card-shadow)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--neon-secondary)', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.4rem', marginBottom: '0.6rem', fontSize: '0.7rem', fontWeight: 600 }}>
          <span>PORTAL VERIFIER TELEMETRY</span>
          <span style={{ animation: 'pulseGlobe 1s infinite' }}>● ACTIVE</span>
        </div>
        <div style={{ color: '#a0aec0', minHeight: '60px' }}>
          {telemetryLogs.slice(0, logIndex + 1).map((log, i) => (
            <div key={i} style={{ marginBottom: '4px', opacity: i === logIndex ? 1 : 0.65, color: i === logIndex ? 'var(--neon-green)' : '#a0aec0' }}>
              &gt; {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
