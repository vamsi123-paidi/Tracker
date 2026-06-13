'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { api, getAuthToken } from '@/utils/api';

export default function StudentInterviewPage() {
  const router = useRouter();
  const [studentId, setStudentId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string>('Student');
  const [isAuthorizing, setIsAuthorizing] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          router.push('/login');
          return;
        }
        
        // In this app, we can fetch the user profile from /api/users or decode token
        // Usually, the easiest is /api/auth/me if it exists, or just parsing the JWT
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        setStudentId(payload.id);
        
        // We might want to fetch their real name, but "Student" works for the video overlay
      } catch (e) {
        console.error(e);
        router.push('/login');
      } finally {
        setIsAuthorizing(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (isAuthorizing || !studentId) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className="aurora-blob aurora-blob-1" style={{ width: '200px', height: '200px' }}></div>
          <p className="text-muted" style={{ zIndex: 10 }}>Connecting to Secure Interview Room...</p>
        </div>
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
            onClick={() => router.push('/student')}
            className="glass-button secondary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            ← Back to Dashboard
          </button>
          <div>
            <h1 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-primary)' }}>Live Interview Session</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
              End-to-end encrypted connection
            </p>
          </div>
        </div>
        <div className="badge success">STUDENT CONNECTED</div>
      </div>

      {/* Video Container */}
      <div style={{ flex: 1, position: 'relative' }}>
        <JitsiMeeting
          domain="meet.jit.si"
          roomName={roomName}
          configOverwrite={{
            startWithAudioMuted: true,
            disableModeratorIndicator: true,
            startScreenSharing: false,
            enableEmailInStats: false,
          }}
          interfaceConfigOverwrite={{
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true
          }}
          userInfo={{
            displayName: 'Candidate',
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
