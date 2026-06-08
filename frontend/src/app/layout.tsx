import type { Metadata } from 'next';
import { ParticleBg } from '@/components/ParticleBg';
import './globals.css';

export const metadata: Metadata = {
  title: 'HoloTrack.io - Secure Student Task Tracker',
  description: 'An advanced, high-fidelity secure analytics dashboard for student tasks and reviews.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ParticleBg />
        <div className="glow-spot-1" />
        <div className="glow-spot-2" />
        {children}
      </body>
    </html>
  );
}
