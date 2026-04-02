import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import CustomCursor from '@/components/ui/CustomCursor';
import { Toaster } from 'sonner';
import ReactQueryProvider from '@/components/providers/ReactQueryProvider';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
});

export const metadata: Metadata = {
  title: 'HireTrack — AI Job Tracker',
  description: 'Track your job applications with AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geist.variable} font-sans bg-[#080c14] min-h-screen antialiased`}
        suppressHydrationWarning
      >
        <ReactQueryProvider>
          <CustomCursor />
          {children}
          <Toaster
            theme="dark"
            toastOptions={{
              style: {
                background: '#0d1421',
                border: '1px solid rgba(14,165,233,0.2)',
                color: '#e2f0ff',
              },
            }}
          />
        </ReactQueryProvider>
      </body>
    </html>
  );
}