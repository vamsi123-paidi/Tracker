'use client';

import React, { useEffect, useRef } from 'react';

export const ParticleBg: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Matrix columns setup
    const fontSize = 14;
    const columns = Math.floor(width / 24);
    const yPositions = Array(columns).fill(0).map(() => Math.random() * -height);

    // Coding character pool
    const codingChars = [
      '0', '1', '{', '}', '[', ']', '<', '>', ';', '(', ')', 
      '=', '+', '-', '&', '|', '!', 'const', 'let', 'if', 
      'for', 'function', 'return', 'import', 'export', '=>'
    ];

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Render loop
    const draw = () => {
      const isLight = document.documentElement.classList.contains('light');
      
      // Semi-transparent background for trails effect (fully blue/purple free!)
      ctx.fillStyle = isLight ? 'rgba(250, 250, 245, 0.12)' : 'rgba(3, 3, 5, 0.12)';
      ctx.fillRect(0, 0, width, height);

      // Character styling
      ctx.font = '12px monospace';

      for (let i = 0; i < yPositions.length; i++) {
        // Random character from pool
        const char = codingChars[Math.floor(Math.random() * codingChars.length)];
        const x = i * 24;
        const y = yPositions[i];

        // Soft green/gold coloring (completely blue, magenta, purple free!)
        if (isLight) {
          // Subtle coding watermark for light mode readability
          ctx.fillStyle = Math.random() > 0.15 
            ? 'rgba(16, 185, 129, 0.08)'  // light green
            : 'rgba(245, 158, 11, 0.08)'; // light gold
        } else {
          // High contrast neon coding rain for dark mode
          ctx.fillStyle = Math.random() > 0.15
            ? '#10b981'  // emerald green
            : '#f59e0b'; // solar gold
        }

        ctx.fillText(char, x, y);

        // Reset to top once it reaches bottom with random delay
        if (y > height && Math.random() > 0.975) {
          yPositions[i] = 0;
        } else {
          yPositions[i] += fontSize + 4;
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="aurora-bg">
      {/* Drifting radial gradient glow blobs */}
      <div className="aurora-blob aurora-blob-1" />
      <div className="aurora-blob aurora-blob-2" />
      
      {/* 3D scrolling grid backdrop */}
      <div className="cyber-grid-container">
        <div className="cyber-grid" />
      </div>

      {/* Code Rain Matrix canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -2,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
