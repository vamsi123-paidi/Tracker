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
    const columns = Math.floor(width / 40); // Spaced out columns (reduces code density)
    const yPositions = Array(columns).fill(0).map(() => Math.random() * -height);
    const currentChars = Array(columns).fill('').map(() => '');

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

    let lastTime = 0;
    const interval = 130; // Step y-positions every 130ms (~8 steps per second) for a calm, slow progression

    // Render loop
    const draw = (timestamp: number) => {
      const isLight = document.documentElement.classList.contains('light');
      
      if (!lastTime) lastTime = timestamp;
      const elapsed = timestamp - lastTime;

      // Only perform update and redraw at the throttled rate
      if (elapsed > interval) {
        lastTime = timestamp - (elapsed % interval);

        // Semi-transparent background for smooth fading trails (fully blue/purple free!)
        ctx.fillStyle = isLight ? 'rgba(250, 250, 245, 0.25)' : 'rgba(3, 3, 5, 0.25)';
        ctx.fillRect(0, 0, width, height);

        // Character styling
        ctx.font = '12px monospace';

        for (let i = 0; i < yPositions.length; i++) {
          // Keep same character or mutate occasionally (15% chance)
          if (!currentChars[i] || Math.random() > 0.85) {
            currentChars[i] = codingChars[Math.floor(Math.random() * codingChars.length)];
          }
          const char = currentChars[i];
          const x = i * 40;
          const y = yPositions[i];

          // Soft green/gold coloring with low opacity (extremely gentle on eyes)
          if (isLight) {
            ctx.fillStyle = Math.random() > 0.15 
              ? 'rgba(16, 185, 129, 0.04)'  // faint green
              : 'rgba(245, 158, 11, 0.04)'; // faint gold
          } else {
            ctx.fillStyle = Math.random() > 0.15
              ? 'rgba(16, 185, 129, 0.22)'  // soft emerald green
              : 'rgba(245, 158, 11, 0.22)'; // soft solar gold
          }

          ctx.fillText(char, x, y);

          // Reset to top once it reaches bottom with random delay
          if (y > height && Math.random() > 0.95) {
            yPositions[i] = 0;
          } else {
            yPositions[i] += fontSize + 6;
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

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
