'use client';

import React from 'react';

export const ParticleBg: React.FC = () => {
  return (
    <div className="aurora-bg">
      {/* Background drifting glow blobs (hardware-accelerated in CSS) */}
      <div className="aurora-blob aurora-blob-1" />
      <div className="aurora-blob aurora-blob-2" />
      <div className="aurora-blob aurora-blob-3" />
      
      {/* 3D Scrolling cyber grid layer (hardware-accelerated in CSS) */}
      <div className="cyber-grid-container">
        <div className="cyber-grid" />
      </div>
    </div>
  );
};

