'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Search, Menu, X } from 'lucide-react';
import { LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getInitials } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import NotificationBell from './NotificationBell';
import { useWindowSize } from '@/hooks/useWindowSize';

interface HeaderProps {
  sidebarCollapsed: boolean;
  onSidebarToggle: () => void;
  showMenuButton?: boolean;
}

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/board': 'Job Board',
  '/dashboard/ai-match': 'AI Match',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/settings': 'Settings',
};

export default function Header({
  sidebarCollapsed,
  onSidebarToggle,
  showMenuButton = false,
}: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { width } = useWindowSize();
  const isMobile = width < 768;
  const isSmall = width < 480;

  const currentPageTitle = PAGE_TITLES[pathname] || 'Dashboard';
  const userInitials = getInitials(user?.name || 'User');
  
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header
      style={{
        height: '64px',
        background: 'rgba(8,12,20,0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: '16px',
      }}
    >
      {/* Mobile menu button */}
      {showMenuButton && (
        <button
          onClick={onSidebarToggle}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#7096b8',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.color = '#e2f0ff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            e.currentTarget.style.color = '#7096b8';
          }}
        >
          <Menu size={18} />
        </button>
      )}

      {/* Left side - Title & breadcrumb */}
      <div>
        <div
          style={{
            fontSize: isMobile ? '15px' : '18px',
            fontWeight: 600,
            color: '#e2f0ff',
            lineHeight: 1.3,
          }}
        >
          {currentPageTitle}
        </div>
        {!isMobile && (
          <div
            style={{
              fontSize: '12px',
              color: '#3d5a7a',
              lineHeight: 1.3,
            }}
          >
            HireTrack / {currentPageTitle}
          </div>
        )}
      </div>

      {/* Right side */}
      <div
        style={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {/* Search Input inline */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: isMobile ? '160px' : '240px' }}
              exit={{ opacity: 0, width: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <input
                autoFocus
                type="text"
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (searchQuery.trim()) {
                      router.push(`/dashboard/board?search=${encodeURIComponent(searchQuery)}`);
                      setSearchOpen(false);
                    }
                  } else if (e.key === 'Escape') {
                    setSearchOpen(false);
                  }
                }}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(14,165,233,0.3)',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  color: '#e2f0ff',
                  fontSize: '14px',
                  width: isMobile ? '160px' : '240px',
                  outline: 'none',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search button toggle — hidden on very small screens */}
        {!isSmall && (
          <button
            onClick={() => {
              if (searchOpen && searchQuery.trim()) {
                router.push(`/dashboard/board?search=${encodeURIComponent(searchQuery)}`);
                setSearchOpen(false);
              } else {
                setSearchOpen(!searchOpen);
              }
            }}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: searchOpen ? 'rgba(14,165,233,0.1)' : 'rgba(255,255,255,0.04)',
              border: searchOpen ? '1px solid rgba(14,165,233,0.3)' : '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: searchOpen ? '#0ea5e9' : '#4a6080',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!searchOpen) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.color = '#7096b8';
              }
            }}
            onMouseLeave={(e) => {
              if (!searchOpen) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.color = '#4a6080';
              }
            }}
            title={searchOpen ? "Close Search" : "Search"}
          >
            {searchOpen ? <X size={16} /> : <Search size={16} />}
          </button>
        )}

        {/* Notification bell */}
        <NotificationBell />

        {/* Divider */}
        <div
          style={{
            width: '1px',
            height: '24px',
            background: 'rgba(255,255,255,0.08)',
            margin: '0 4px',
          }}
        />

        {/* User avatar + dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: 600,
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              transition: 'box-shadow 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                '0 0 0 2px #080c14, 0 0 0 4px rgba(14,165,233,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
            title={user?.name || 'User'}
          >
            {userInitials}
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '48px',
                right: 0,
                background: '#0d1421',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '8px',
                minWidth: '200px',
                zIndex: 100,
                boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
              }}
            >
              {/* User info */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px 12px',
                  marginBottom: '4px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'white',
                    flexShrink: 0,
                  }}
                >
                  {userInitials}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#e2f0ff',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {user?.name || 'User'}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#4a6080',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {user?.email || ''}
                  </div>
                </div>
              </div>

              {/* Settings */}
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  router.push('/dashboard/settings');
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#7096b8',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.color = '#e2f0ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = '#7096b8';
                }}
              >
                <Settings size={14} />
                Settings
              </button>

              {/* Sign Out */}
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#7096b8',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.06)';
                  e.currentTarget.style.color = '#ef4444';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = '#7096b8';
                }}
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
