'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Briefcase, Sparkles, Clock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await axios.get('/notifications');
      return res.data.data;
    },
    refetchInterval: 30000 
  });

  const markReadMutation = useMutation({
    mutationFn: async (notificationId?: string) => {
      await axios.patch('/notifications', notificationId ? { notificationId } : { markAllRead: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const handleNotificationClick = (n: any) => {
    if (!n.read) markReadMutation.mutate(n._id);
    if (n.relatedApplication) {
      router.push(`/dashboard/board?app=${n.relatedApplication}`);
    }
    setOpen(false);
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'status_change': return <Briefcase size={16} color="#38bdf8" />;
      case 'ai_complete': return <Sparkles size={16} color="#a78bfa" />;
      case 'reminder': return <Clock size={16} color="#eab308" />;
      default: return <Bell size={16} color="#94a3b8" />;
    }
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '36px', height: '36px', borderRadius: '8px',
          background: open ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)', 
          border: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: open ? '#7096b8' : '#4a6080',
          position: 'relative', transition: 'all 0.15s ease',
        }}
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '-4px', right: '-4px',
            width: '16px', height: '16px', borderRadius: '50%',
            background: '#0ea5e9', fontSize: '9px', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 600, border: '2px solid #080c14',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '48px', right: '-40px',
          width: '360px', background: '#0d1421',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px',
          zIndex: 100, boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)'
          }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#e2f0ff' }}>Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => markReadMutation.mutate(undefined)}
                style={{
                  background: 'none', border: 'none', color: '#0ea5e9',
                  fontSize: '12px', cursor: 'pointer', padding: 0
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {isLoading ? (
              <div style={{ padding: '32px', textAlign: 'center' }}>
                <LoadingSpinner size="sm" />
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: '#1e3a5f', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', margin: '0 auto 12px'
                }}>
                  <Bell size={20} color="#7096b8" />
                </div>
                <p style={{ color: '#4a6080', fontSize: '14px', margin: '0 0 4px 0', fontWeight: 500 }}>All caught up!</p>
                <p style={{ color: '#3d5a7a', fontSize: '12px', margin: 0 }}>No notifications yet</p>
              </div>
            ) : (
              notifications.map((n: any) => (
                <div 
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  style={{
                    display: 'flex', gap: '12px', padding: '12px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: !n.read ? 'rgba(14,165,233,0.04)' : 'transparent',
                    cursor: 'pointer', transition: 'background 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = !n.read ? 'rgba(14,165,233,0.04)' : 'transparent'; }}
                >
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    {getIcon(n.type)}
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 2px 0', fontSize: '13px', fontWeight: !n.read ? 600 : 500, color: '#e2f0ff' }}>
                      {n.title}
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#7096b8', lineHeight: 1.4 }}>
                      {n.message}
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#4a6080' }}>
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>

                  {!n.read && (
                    <div style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: '#0ea5e9', flexShrink: 0, marginTop: '6px'
                    }} />
                  )}
                </div>
              ))
            )}
          </div>

          <div style={{
            padding: '12px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(0,0,0,0.1)'
          }}>
            <button 
              onClick={() => { setOpen(false); router.push('/dashboard/settings'); }}
              style={{
                background: 'none', border: 'none', color: '#7096b8',
                fontSize: '12px', cursor: 'pointer', padding: 0
              }}
            >
              View all notification settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
