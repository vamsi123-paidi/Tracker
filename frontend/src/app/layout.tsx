import type { Metadata } from 'next';
import { ParticleBg } from '@/components/ParticleBg';
import './globals.css';

export const metadata: Metadata = {
  title: 'Task Tracker - Student Portal',
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
        <div className="aurora-bg">
          <div className="aurora-blob aurora-blob-1"></div>
          <div className="aurora-blob aurora-blob-2"></div>
          <div className="aurora-blob aurora-blob-3"></div>
        </div>
        {children}
      </body>
    </html>
  );
}
