'use client';

import { useState, useEffect } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import PageTransition from '@/components/ui/PageTransition';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(false);
        setMobileSidebarOpen(false);
      }
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <AuthGuard>
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          background: '#080c14',
          position: 'relative',
        }}
      >
        {/* Mobile overlay */}
        {isMobile && mobileSidebarOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 49,
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          style={{
            ...(isMobile
              ? {
                  position: 'fixed',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  zIndex: 50,
                  transform: mobileSidebarOpen
                    ? 'translateX(0)'
                    : 'translateX(-100%)',
                  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }
              : {}),
          }}
        >
          <Sidebar
            collapsed={isMobile ? false : sidebarCollapsed}
            onToggle={() => {
              if (isMobile) {
                setMobileSidebarOpen(false);
              } else {
                setSidebarCollapsed(!sidebarCollapsed);
              }
            }}
          />
        </div>

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minWidth: 0,
          }}
        >
          <Header
            sidebarCollapsed={sidebarCollapsed}
            onSidebarToggle={() => {
              if (isMobile) {
                setMobileSidebarOpen(!mobileSidebarOpen);
              } else {
                setSidebarCollapsed(!sidebarCollapsed);
              }
            }}
            showMenuButton={isMobile}
          />
          <main
            style={{
              flex: 1,
              overflowY: 'auto',
              background: '#080c14',
              padding: '24px',
            }}
          >
            <PageTransition>{children}</PageTransition>
          </main>
          <footer style={{
            borderTop: '1px solid rgba(255,255,255,0.04)',
            padding: '12px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
          }}>
            <span style={{ fontSize: 12, color: '#3d5a7a' }}>
              © 2026 HireTrack. All rights reserved.
            </span>
            <span style={{ fontSize: 12, color: '#3d5a7a' }}>
              Built by{' '}
              <a 
                href="https://github.com/Zakuroooo" 
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#4a6080', textDecoration: 'none' }}
              >
                Pranay Sarkar
              </a>
            </span>
          </footer>
        </div>
      </div>
    </AuthGuard>
  );
}
