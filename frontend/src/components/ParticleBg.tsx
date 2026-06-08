'use client';

import React, { useEffect, useRef } from 'react';

export const ParticleBg: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse tracking state
    const mouse = {
      x: -1000,
      y: -1000,
      active: false,
      radius: 220,
    };

    // Color cache updated dynamically based on theme
    const colors = {
      primary: '#00f2fe',
      secondary: '#bd00ff',
      blue: '#0052ff',
    };

    const updateColors = () => {
      if (typeof window === 'undefined') return;
      const styles = getComputedStyle(document.documentElement);
      colors.primary = styles.getPropertyValue('--neon-primary').trim() || '#00f2fe';
      colors.secondary = styles.getPropertyValue('--neon-secondary').trim() || '#bd00ff';
      colors.blue = styles.getPropertyValue('--neon-blue').trim() || '#0052ff';
    };

    // Initialize colors
    updateColors();

    // Observe theme class updates on documentElement
    const observer = new MutationObserver(() => {
      updateColors();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Resize handler
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    // Mouse handlers
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Grid config for the wave net
    const cols = 22;
    const rows = 9;
    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Increment animation timeline
      time += 0.015;

      // Generate grid node positions and apply waving offsets
      const nodes: { x: number; y: number; originalY: number; mouseDist: number }[][] = [];

      for (let r = 0; r < rows; r++) {
        const rowNodes = [];
        // Center the wave grid vertically
        const baseY = height * 0.15 + (r / (rows - 1)) * (height * 0.7);

        for (let c = 0; c < cols; c++) {
          const baseX = (c / (cols - 1)) * width;

          // Wave calculations based on math functions
          const wave1 = Math.sin(c * 0.25 + time) * Math.cos(r * 0.3 + time * 0.8) * 30;
          const wave2 = Math.sin(r * 0.4 - time * 0.5) * 15;
          const wave3 = Math.cos((baseX + baseY) * 0.002 + time) * 12;

          let targetY = baseY + wave1 + wave2 + wave3;
          let targetX = baseX + Math.sin(r * 0.5 + time) * 10;

          // Mouse interaction logic (repelling/pulling nodes slightly)
          let mouseDist = 0;
          if (mouse.active) {
            const dx = targetX - mouse.x;
            const dy = targetY - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            mouseDist = dist;

            if (dist < mouse.radius) {
              const force = (1 - dist / mouse.radius) * 35;
              // Push away from mouse
              const angle = Math.atan2(dy, dx);
              targetX += Math.cos(angle) * force * 0.5;
              targetY += Math.sin(angle) * force;
            }
          }

          rowNodes.push({
            x: targetX,
            y: targetY,
            originalY: baseY,
            mouseDist,
          });
        }
        nodes.push(rowNodes);
      }

      // Draw grid lines
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const current = nodes[r][c];

          // Calculate depth-based opacity (fade near top and bottom edges)
          const verticalProgress = current.originalY / height;
          let edgeAlpha = 1;
          if (verticalProgress < 0.25) {
            edgeAlpha = verticalProgress / 0.25;
          } else if (verticalProgress > 0.75) {
            edgeAlpha = (1 - verticalProgress) / 0.25;
          }
          edgeAlpha = Math.max(0, Math.min(1, edgeAlpha));

          // Draw horizontal connections
          if (c < cols - 1) {
            const next = nodes[r][c + 1];
            ctx.beginPath();
            ctx.moveTo(current.x, current.y);
            ctx.lineTo(next.x, next.y);

            // Create linear gradient for neon cyber feel
            const grad = ctx.createLinearGradient(current.x, current.y, next.x, next.y);
            const a1 = Math.max(0.04, Math.min(0.25, 1 - (current.mouseDist / 300))) * edgeAlpha;
            const a2 = Math.max(0.04, Math.min(0.25, 1 - (next.mouseDist / 300))) * edgeAlpha;
            
            grad.addColorStop(0, hexToRgba(colors.primary, a1));
            grad.addColorStop(1, hexToRgba(colors.secondary, a2));

            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }

          // Draw vertical connections
          if (r < rows - 1) {
            const down = nodes[r + 1][c];
            ctx.beginPath();
            ctx.moveTo(current.x, current.y);
            ctx.lineTo(down.x, down.y);

            const a1 = Math.max(0.02, Math.min(0.18, 1 - (current.mouseDist / 300))) * edgeAlpha;
            const a2 = Math.max(0.02, Math.min(0.18, 1 - (down.mouseDist / 300))) * edgeAlpha;

            ctx.strokeStyle = hexToRgba(colors.blue, (a1 + a2) / 2);
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }

          // Randomly draw small glowing datalinks (intersections)
          if ((r + c) % 3 === 0) {
            const mouseFactor = mouse.active && current.mouseDist < mouse.radius ? (1 - current.mouseDist / mouse.radius) * 2 : 0;
            const radius = (1.5 + mouseFactor) * edgeAlpha;
            
            if (radius > 0.1) {
              ctx.beginPath();
              ctx.arc(current.x, current.y, radius, 0, Math.PI * 2);
              
              // Blinking effect
              const blink = Math.sin(time * 3 + r * c) * 0.4 + 0.6;
              const alpha = Math.max(0.08, Math.min(0.8, (0.2 + mouseFactor * 0.3) * blink)) * edgeAlpha;

              ctx.fillStyle = hexToRgba(colors.primary, alpha);
              
              // Add subtle glow shadow for nodes that are active near mouse
              if (mouseFactor > 0.5) {
                ctx.shadowBlur = 8;
                ctx.shadowColor = colors.primary;
              } else {
                ctx.shadowBlur = 0;
              }

              ctx.fill();
              ctx.shadowBlur = 0; // reset
            }
          }
        }
      }

      animationId = requestAnimationFrame(render);
    };

    // Helper to convert hex to rgba string
    const hexToRgba = (hex: string, alpha: number) => {
      const cleanHex = hex.replace('#', '');
      let r = 0, g = 0, b = 0;
      if (cleanHex.length === 3) {
        r = parseInt(cleanHex[0] + cleanHex[0], 16);
        g = parseInt(cleanHex[1] + cleanHex[1], 16);
        b = parseInt(cleanHex[2] + cleanHex[2], 16);
      } else if (cleanHex.length === 6) {
        r = parseInt(cleanHex.substring(0, 2), 16);
        g = parseInt(cleanHex.substring(2, 4), 16);
        b = parseInt(cleanHex.substring(4, 6), 16);
      }
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    render();

    // Cleanups
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="aurora-bg">
      {/* Background drifting glow blobs */}
      <div className="aurora-blob aurora-blob-1" />
      <div className="aurora-blob aurora-blob-2" />
      <div className="aurora-blob aurora-blob-3" />
      
      {/* 3D Scrolling cyber grid layer */}
      <div className="cyber-grid-container">
        <div className="cyber-grid" />
      </div>

      {/* Holographic Wave Canvas Overlay */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />
    </div>
  );
};

