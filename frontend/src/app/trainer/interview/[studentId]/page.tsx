'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { getAuthToken } from '@/utils/api';

export default function TrainerInterviewPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.studentId as string;
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }
    // Very basic check, in production we'd verify the JWT role
    setIsAuthorized(true);
  }, [router]);

  if (!isAuthorized) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
        <p className="text-muted">Authorizing secure tunnel...</p>
      </div>
    );
  }

  const roomName = `spark-interview-room-${studentId}-secure`;

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}>
      {/* Header bar */}
      <div style={{
        padding: '1rem 2rem',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-glass)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => router.push('/trainer')}
            className="glass-button secondary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            ← Back to Dashboard
          </button>
          <div>
            <h1 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-primary)' }}>Virtual Interview Room</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
              Session ID: <span style={{ fontFamily: 'var(--font-mono)' }}>{studentId.substring(0, 8)}...</span>
            </p>
          </div>
        </div>
        <div className="badge primary">TRAINER MODE</div>
      </div>

      {/* Video Container */}
      <div style={{ flex: 1, position: 'relative' }}>
        <JitsiMeeting
          domain="meet.jit.si"
          roomName={roomName}
          configOverwrite={{
            startWithAudioMuted: true,
            disableModeratorIndicator: true,
            startScreenSharing: true,
            enableEmailInStats: false,
          }}
          interfaceConfigOverwrite={{
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true
          }}
          userInfo={{
            displayName: 'Trainer (Host)',
            email: ''
          }}
          onApiReady={(externalApi) => {
            // Can attach listeners here
          }}
          getIFrameRef={(iframeRef) => {
            iframeRef.style.height = '100%';
            iframeRef.style.width = '100%';
          }}
        />
      </div>
    </div>
  );
}
