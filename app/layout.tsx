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
  title: {
    default: 'HireTrack — AI Job Application Tracker',
    template: '%s | HireTrack',
  },
  description:
    'Track every job application, ace interviews, and land your dream role faster with AI-powered resume matching and beautiful analytics.',
  keywords: [
    'job tracker',
    'job application tracker',
    'AI resume matcher',
    'job search',
    'interview tracker',
    'career tools',
    'HireTrack',
  ],
  authors: [{ name: 'Pranay Sarkar', url: 'https://github.com/Zakuroooo' }],
  creator: 'Pranay Sarkar',
  metadataBase: new URL('https://hiretrack-brown.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://hiretrack-brown.vercel.app',
    title: 'HireTrack — AI Job Application Tracker',
    description:
      'Track every job application and land your dream role faster with AI-powered insights.',
    siteName: 'HireTrack',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'HireTrack — AI Job Application Tracker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HireTrack — AI Job Application Tracker',
    description: 'Track every job application and land your dream role faster.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
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