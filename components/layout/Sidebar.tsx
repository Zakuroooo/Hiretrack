'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Kanban,
  Sparkles,
  BarChart3,
  Settings,
  Zap,
  ChevronLeft,
  ChevronRight,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getInitials, truncate } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
  { icon: Kanban, label: 'Job Board', path: '/dashboard/board' },
  { icon: Sparkles, label: 'AI Match', path: '/dashboard/ai-match' },
  { icon: BarChart3, label: 'Analytics', path: '/dashboard/analytics' },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (item: NavItem) => {
    if (item.path === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(item.path);
  };

  const renderNavItem = (item: NavItem) => {
    const active = isActive(item);
    const Icon = item.icon;

    const navLink = (
      <Link href={item.path} style={{ textDecoration: 'none' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: collapsed ? 0 : '12px',
            padding: collapsed ? '10px 0' : '10px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: '10px',
            marginBottom: '2px',
            transition: 'all 0.15s ease',
            cursor: 'pointer',
            position: 'relative',
            background: active ? 'rgba(14,165,233,0.1)' : 'transparent',
          }}
          onMouseEnter={(e) => {
            if (!active) {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            }
          }}
          onMouseLeave={(e) => {
            if (!active) {
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          {/* Active indicator bar */}
          <AnimatePresence>
            {active && (
              <motion.div
                layoutId="sidebar-active-indicator"
                style={{
                  position: 'absolute',
                  left: 0,
                  top: '20%',
                  bottom: '20%',
                  width: '3px',
                  borderRadius: '0 3px 3px 0',
                  background: '#0ea5e9',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </AnimatePresence>

          <Icon
            size={18}
            style={{
              color: active ? '#0ea5e9' : '#4a6080',
              flexShrink: 0,
              transition: 'color 0.15s ease',
            }}
          />

          {!collapsed && (
            <span
              style={{
                fontSize: '14px',
                fontWeight: active ? 500 : 400,
                color: active ? '#e2f0ff' : '#7096b8',
                whiteSpace: 'nowrap',
                transition: 'color 0.15s ease',
              }}
            >
              {item.label}
            </span>
          )}
        </div>
      </Link>
    );

    if (collapsed) {
      return (
        <TooltipProvider key={item.path}>
          <Tooltip>
            <TooltipTrigger asChild>{navLink}</TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {item.label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return <div key={item.path}>{navLink}</div>;
  };

  const userInitials = getInitials(user?.name || 'User');

  return (
    <div
      style={{
        position: 'relative',
        width: collapsed ? '72px' : '260px',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        minHeight: '100vh',
        background: '#0a0e1a',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* Top section */}
      <div
        style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          padding: collapsed ? '0 16px' : '0 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          justifyContent: collapsed ? 'center' : 'space-between',
        }}
      >
        {/* Logo - shown when expanded */}
        {!collapsed && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <Zap size={20} style={{ color: '#0ea5e9' }} />
            <span
              style={{
                fontSize: '18px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #e2f0ff, #38bdf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              HireTrack
            </span>
          </div>
        )}

        {/* Zap icon - shown when collapsed */}
        {collapsed && <Zap size={22} style={{ color: '#0ea5e9' }} />}

        {/* Toggle button */}
        {!collapsed && (
          <button
            onClick={onToggle}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#7096b8',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = '#e2f0ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.color = '#7096b8';
            }}
            title="Collapse sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Expand button when collapsed - shown below header */}
      {collapsed && (
        <div
          style={{
            padding: '8px',
            display: 'flex',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative',
            zIndex: 10,
          }}
        >
          <button
            onClick={onToggle}
            title="Expand sidebar"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#7096b8',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = '#e2f0ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.color = '#7096b8';
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
        {NAV_ITEMS.map(renderNavItem)}
      </nav>

      {/* Bottom section - User */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '12px 8px',
        }}
      >
        {/* User card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: collapsed ? 0 : '12px',
            padding: collapsed ? '10px 0' : '10px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: '10px',
          }}
        >
          {/* Avatar */}
          {collapsed ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'white',
                      flexShrink: 0,
                      cursor: 'default',
                    }}
                  >
                    {userInitials}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {user?.name || 'User'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 600,
                color: 'white',
                flexShrink: 0,
              }}
            >
              {userInitials}
            </div>
          )}

          {/* User info */}
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
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
                {truncate(user?.name || 'User', 16)}
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
                {truncate(user?.email || '', 20)}
              </div>
            </div>
          )}

          {/* Logout button - expanded */}
          {!collapsed && (
            <button
              onClick={logout}
              title="Sign out"
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                borderRadius: '6px',
                color: '#4a6080',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ef4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#4a6080';
              }}
            >
              <LogOut size={15} />
            </button>
          )}
        </div>

        {/* Logout button - collapsed */}
        {collapsed && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '4px',
            }}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={logout}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '8px',
                      borderRadius: '8px',
                      color: '#4a6080',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ef4444';
                      e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#4a6080';
                      e.currentTarget.style.background = 'none';
                    }}
                  >
                    <LogOut size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  Sign out
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    </div>
  );
}
