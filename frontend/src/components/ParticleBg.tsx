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

    // Particles configuration
    const densityRatio = 20000; // 1 particle per 20000 pixels
    const particleCount = Math.min(65, Math.max(25, Math.floor((width * height) / densityRatio)));
    
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }
    const particles: Particle[] = [];

    // Initialize particles with randomized velocity directions
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.5 + 1.2,
      });
    }

    // Cursor tracking state
    const mouse = { x: -1000, y: -1000, active: false };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.active = false;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    const getThemeColors = () => {
      const isLight = document.documentElement.classList.contains('light');
      return {
        particleColor: isLight ? 'rgba(255, 87, 34, 0.4)' : 'rgba(245, 158, 11, 0.45)',
        linkColor: isLight ? 'rgba(255, 87, 34, 0.07)' : 'rgba(245, 158, 11, 0.08)',
        mouseLinkColor: isLight ? 'rgba(0, 168, 204, 0.15)' : 'rgba(16, 185, 129, 0.15)',
      };
    };

    let themeColors = getThemeColors();

    // Listen for dark/light class toggles on HTML element
    const observer = new MutationObserver(() => {
      themeColors = getThemeColors();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Render loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        // Cursor attraction physics
        if (mouse.active) {
          const dx = mouse.x - p1.x;
          const dy = mouse.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            // Subtle pull
            p1.vx += (dx / dist) * 0.006;
            p1.vy += (dy / dist) * 0.006;

            // Render laser link to cursor
            ctx.beginPath();
            ctx.strokeStyle = themeColors.mouseLinkColor;
            ctx.lineWidth = (1 - dist / 200) * 0.7;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }

        // Apply friction to control mouse pull velocity buildup
        p1.vx *= 0.98;
        p1.vy *= 0.98;

        // Bounded speed
        const speed = Math.sqrt(p1.vx * p1.vx + p1.vy * p1.vy);
        const maxSpeed = 0.7;
        if (speed > maxSpeed) {
          p1.vx = (p1.vx / speed) * maxSpeed;
          p1.vy = (p1.vy / speed) * maxSpeed;
        }

        // Update positions
        p1.x += p1.vx;
        p1.y += p1.vy;

        // Bounce walls
        if (p1.x < 0 || p1.x > width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > height) p1.vy *= -1;

        // Draw node
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fillStyle = themeColors.particleColor;
        ctx.fill();

        // Connect nearby nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.strokeStyle = themeColors.linkColor;
            ctx.lineWidth = (1 - dist / 110) * 0.55;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="aurora-bg">
      {/* Drifting radial gradient glow blobs */}
      <div className="aurora-blob aurora-blob-1" />
      <div className="aurora-blob aurora-blob-2" />
      <div className="aurora-blob aurora-blob-3" />
      
      {/* 3D scrolling grid backdrop */}
      <div className="cyber-grid-container">
        <div className="cyber-grid" />
      </div>

      {/* Dynamic plexus canvas */}
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
