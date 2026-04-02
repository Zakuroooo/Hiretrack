'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';
import { motion } from 'framer-motion';
import {
  Briefcase,
  TrendingUp,
  MessageSquare,
  Trophy,
  Sparkles,
  Plus,
  BarChart3,
} from 'lucide-react';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageTransition from '@/components/ui/PageTransition';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { format } from 'date-fns';
import Link from 'next/link';

// ── Stage colors ──
const STAGE_COLORS: Record<string, string> = {
  Applied: '#38bdf8',
  Screening: '#f59e0b',
  Interview: '#a78bfa',
  Offer: '#22c55e',
  Rejected: '#ef4444',
};

const STAGE_BG: Record<string, string> = {
  Applied: 'rgba(56,189,248,0.1)',
  Screening: 'rgba(245,158,11,0.1)',
  Interview: 'rgba(167,139,250,0.1)',
  Offer: 'rgba(34,197,94,0.1)',
  Rejected: 'rgba(239,68,68,0.1)',
};

const AVATAR_COLORS = [
  { bg: 'rgba(14,165,233,0.15)', text: '#38bdf8' },
  { bg: 'rgba(167,139,250,0.15)', text: '#a78bfa' },
  { bg: 'rgba(34,197,94,0.15)', text: '#4ade80' },
  { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24' },
];

const STAGES = ['Applied', 'Screening', 'Interview', 'Offer', 'Rejected'] as const;

// ── Types ──
interface DashboardStats {
  totalApplications: number;
  byStatus: Record<string, number>;
  thisWeek: number;
  responseRate: string;
  interviewCount: number;
  offerCount: number;
  recentApplications: Array<{
    _id: string;
    company: string;
    role: string;
    status: string;
    appliedDate: string;
    location?: string;
    createdAt: string;
  }>;
  weeklyActivity: Array<{ day: string; count: number }>;
}

// ── Shimmer skeleton block ──
function Skeleton({ height, style }: { height: number | string; style?: React.CSSProperties }) {
  return (
    <div
      className="shimmer-loading"
      style={{
        height,
        borderRadius: 16,
        ...style,
      }}
    />
  );
}

// ── Custom tooltip for chart ──
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: '#0d1421',
        border: '1px solid rgba(14,165,233,0.2)',
        borderRadius: 8,
        padding: '8px 12px',
        color: '#e2f0ff',
        fontSize: 12,
      }}
    >
      <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
      <p style={{ margin: 0, color: '#38bdf8' }}>
        {payload[0].value} application{payload[0].value !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

// ── Responsive styles helper ──
const cardStyle: React.CSSProperties = {
  background: '#0d1421',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 16,
  padding: '20px 24px',
  transition: 'all 0.2s ease',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // ── Fetch stats ──
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => axios.get('/dashboard/stats').then((r) => r.data.data),
    staleTime: 30000,
  });

  // ── Quick add form ──
  const [quickAdd, setQuickAdd] = useState({
    company: '',
    role: '',
    status: 'Applied',
  });

  const addMutation = useMutation({
    mutationFn: (data: { company: string; role: string; status: string }) =>
      axios.post('/applications', data),
    onSuccess: () => {
      toast.success('Application added!');
      setQuickAdd({ company: '', role: '', status: 'Applied' });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: () => toast.error('Failed to add application'),
  });

  // ── Greeting ──
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // ── Total for pipeline proportions ──
  const totalForPipeline = stats
    ? STAGES.reduce((sum, s) => sum + (stats.byStatus[s] || 0), 0)
    : 0;

  return (
    <PageTransition>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* ─── SECTION 1: Greeting ─── */}
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#e2f0ff',
              margin: 0,
            }}
          >
            {greeting}, {user?.name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p
            style={{
              fontSize: 14,
              color: '#7096b8',
              marginTop: 4,
            }}
          >
            Here&apos;s your job search overview
          </p>
        </div>

        {/* ─── SECTION 2: Stat Cards ─── */}
        {isLoading ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 16,
              marginBottom: 32,
            }}
          >
            <Skeleton height={120} />
            <Skeleton height={120} />
            <Skeleton height={120} />
            <Skeleton height={120} />
            <style>{`@media (min-width: 768px) { .stat-grid { grid-template-columns: repeat(4, 1fr) !important; } }`}</style>
          </div>
        ) : stats ? (
          <div
            className="stat-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 16,
              marginBottom: 32,
            }}
          >
            <style>{`@media (min-width: 768px) { .stat-grid { grid-template-columns: repeat(4, 1fr) !important; } }`}</style>

            {/* Card 1 — Total Applications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="card-hover"
              style={{ ...cardStyle, cursor: 'default' }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                <span style={{ fontSize: 12, color: '#7096b8', fontWeight: 500 }}>
                  Total Applications
                </span>
                <Briefcase size={20} style={{ color: '#0ea5e9' }} />
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#e2f0ff' }}>
                <AnimatedCounter value={stats.totalApplications} />
              </div>
              <div
                style={{
                  fontSize: 13,
                  marginTop: 6,
                  color: stats.thisWeek > 0 ? '#22c55e' : '#7096b8',
                }}
              >
                {stats.thisWeek > 0
                  ? `+${stats.thisWeek} this week`
                  : 'No new this week'}
              </div>
            </motion.div>

            {/* Card 2 — Response Rate */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="card-hover"
              style={{ ...cardStyle, cursor: 'default' }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                <span style={{ fontSize: 12, color: '#7096b8', fontWeight: 500 }}>
                  Response Rate
                </span>
                <TrendingUp
                  size={20}
                  style={{
                    color:
                      parseFloat(stats.responseRate) > 20 ? '#22c55e' : '#f59e0b',
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color:
                    parseFloat(stats.responseRate) > 20 ? '#22c55e' : '#f59e0b',
                }}
              >
                <AnimatedCounter
                  value={parseFloat(stats.responseRate)}
                  suffix="%"
                />
              </div>
              <div style={{ fontSize: 13, marginTop: 6, color: '#7096b8' }}>
                Applications past screening
              </div>
            </motion.div>

            {/* Card 3 — Interviews */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="card-hover"
              style={{ ...cardStyle, cursor: 'default' }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                <span style={{ fontSize: 12, color: '#7096b8', fontWeight: 500 }}>
                  Interviews
                </span>
                <MessageSquare size={20} style={{ color: '#a78bfa' }} />
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#a78bfa' }}>
                <AnimatedCounter value={stats.interviewCount} />
              </div>
              <div style={{ fontSize: 13, marginTop: 6, color: '#7096b8' }}>
                Active interview stages
              </div>
            </motion.div>

            {/* Card 4 — Offers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="card-hover"
              style={{ ...cardStyle, cursor: 'default' }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                <span style={{ fontSize: 12, color: '#7096b8', fontWeight: 500 }}>
                  Offers
                </span>
                <Trophy size={20} style={{ color: '#f59e0b' }} />
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: stats.offerCount > 0 ? '#22c55e' : '#e2f0ff',
                }}
              >
                <AnimatedCounter value={stats.offerCount} />
              </div>
              <div
                style={{
                  fontSize: 13,
                  marginTop: 6,
                  color: stats.offerCount > 0 ? '#22c55e' : '#7096b8',
                }}
              >
                {stats.offerCount > 0 ? '🎉 Congratulations!' : 'Keep applying!'}
              </div>
            </motion.div>
          </div>
        ) : null}

        {/* ─── SECTION 3: Application Pipeline ─── */}
        {isLoading ? (
          <Skeleton height={140} style={{ marginBottom: 32 }} />
        ) : stats ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            style={{ ...cardStyle, marginBottom: 32 }}
          >
            <h2
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: '#e2f0ff',
                marginBottom: 16,
              }}
            >
              Application Pipeline
            </h2>
            <div
              style={{
                display: 'flex',
                gap: 8,
                overflowX: 'auto',
                alignItems: 'center',
                paddingBottom: 4,
              }}
            >
              {STAGES.map((stage, idx) => {
                const count = stats.byStatus[stage] || 0;
                const pct =
                  totalForPipeline > 0
                    ? (count / totalForPipeline) * 100
                    : 0;

                return (
                  <div key={stage} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                    <div style={{ flex: 1, minWidth: 80, textAlign: 'center' }}>
                      {/* Bar */}
                      <div
                        style={{
                          height: 6,
                          borderRadius: 3,
                          background: `${STAGE_COLORS[stage]}20`,
                          marginBottom: 8,
                          overflow: 'hidden',
                        }}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.4 + idx * 0.1, ease: 'easeOut' }}
                          style={{
                            height: '100%',
                            borderRadius: 3,
                            background: STAGE_COLORS[stage],
                          }}
                        />
                      </div>
                      <div
                        style={{
                          fontSize: 20,
                          fontWeight: 700,
                          color: STAGE_COLORS[stage],
                        }}
                      >
                        {count}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: '#7096b8',
                          marginTop: 2,
                        }}
                      >
                        {stage}
                      </div>
                    </div>

                    {/* Arrow between stages */}
                    {idx < STAGES.length - 1 && (
                      <span
                        style={{
                          color: '#1e3a5f',
                          fontSize: 18,
                          flexShrink: 0,
                          padding: '0 4px',
                          alignSelf: 'center',
                        }}
                      >
                        →
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : null}

        {/* ─── SECTION 4: Two-column — Chart + Recent ─── */}
        {isLoading ? (
          <div
            className="two-col-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 16,
              marginBottom: 32,
            }}
          >
            <style>{`@media (min-width: 768px) { .two-col-grid { grid-template-columns: 3fr 2fr !important; } }`}</style>
            <Skeleton height={280} />
            <Skeleton height={280} />
          </div>
        ) : stats ? (
          <div
            className="two-col-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 16,
              marginBottom: 32,
            }}
          >
            <style>{`@media (min-width: 768px) { .two-col-grid { grid-template-columns: 3fr 2fr !important; } }`}</style>

            {/* LEFT — Weekly Activity Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              style={cardStyle}
            >
              <h2
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#e2f0ff',
                  marginBottom: 16,
                }}
              >
                Weekly Activity
              </h2>

              {!stats.weeklyActivity ||
              stats.weeklyActivity.every((d) => d.count === 0) ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 40,
                    gap: 8,
                  }}
                >
                  <BarChart3 size={40} style={{ color: '#1e3a5f' }} />
                  <span style={{ color: '#7096b8', fontSize: 14 }}>
                    No activity yet
                  </span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.weeklyActivity}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.04)"
                    />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: '#4a6080', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <RechartsTooltip content={<ChartTooltip />} />
                    <Bar
                      dataKey="count"
                      fill="#0ea5e9"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </motion.div>

            {/* RIGHT — Recent Applications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              style={cardStyle}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <h2
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: '#e2f0ff',
                    margin: 0,
                  }}
                >
                  Recent Applications
                </h2>
                <Link
                  href="/dashboard/board"
                  style={{
                    color: '#38bdf8',
                    fontSize: 13,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  View all →
                </Link>
              </div>

              {!stats.recentApplications ||
              stats.recentApplications.length === 0 ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 40,
                    gap: 8,
                  }}
                >
                  <Briefcase size={32} style={{ color: '#1e3a5f' }} />
                  <span style={{ color: '#7096b8', fontSize: 14 }}>
                    No applications yet
                  </span>
                </div>
              ) : (
                <div>
                  {stats.recentApplications.map((app, idx) => {
                    const colorSet =
                      AVATAR_COLORS[idx % AVATAR_COLORS.length];

                    return (
                      <div
                        key={app._id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '10px 0',
                          borderBottom:
                            idx < stats.recentApplications.length - 1
                              ? '1px solid rgba(255,255,255,0.04)'
                              : 'none',
                        }}
                      >
                        {/* Company avatar */}
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: colorSet.bg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 14,
                            fontWeight: 700,
                            color: colorSet.text,
                            flexShrink: 0,
                          }}
                        >
                          {app.company[0].toUpperCase()}
                        </div>

                        {/* Middle */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: '#e2f0ff',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {app.company}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: '#7096b8',
                              marginTop: 2,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {app.role}
                            {app.appliedDate && (
                              <> · {format(new Date(app.appliedDate), 'MMM d')}</>
                            )}
                          </div>
                        </div>

                        {/* Status badge */}
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 500,
                            padding: '3px 8px',
                            borderRadius: 20,
                            background: STAGE_BG[app.status] || STAGE_BG.Applied,
                            color:
                              STAGE_COLORS[app.status] || STAGE_COLORS.Applied,
                            flexShrink: 0,
                          }}
                        >
                          {app.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        ) : null}

        {/* ─── SECTION 5: Quick Add Application ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.4 }}
          style={{
            background: 'rgba(14,165,233,0.04)',
            border: '1px solid rgba(14,165,233,0.12)',
            borderRadius: 16,
            padding: '20px 24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 4,
            }}
          >
            <Sparkles size={18} style={{ color: '#0ea5e9' }} />
            <h2
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: '#e2f0ff',
                margin: 0,
              }}
            >
              Quick Add Application
            </h2>
          </div>
          <p
            style={{
              fontSize: 12,
              color: '#7096b8',
              marginBottom: 16,
            }}
          >
            Track a new job application in seconds
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!quickAdd.company.trim() || !quickAdd.role.trim()) return;
              addMutation.mutate(quickAdd);
            }}
            className="quick-add-form"
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <style>{`
              @media (max-width: 640px) {
                .quick-add-form > input, .quick-add-form > select, .quick-add-form > button {
                  width: 100% !important;
                  flex: unset !important;
                }
              }
              .quick-add-input:focus {
                border-color: #0ea5e9 !important;
                outline: none;
              }
              .quick-add-input::placeholder {
                color: #3d5a7a;
              }
            `}</style>

            <input
              className="quick-add-input"
              type="text"
              placeholder="Company name"
              value={quickAdd.company}
              onChange={(e) =>
                setQuickAdd((prev) => ({ ...prev, company: e.target.value }))
              }
              style={{
                flex: 1,
                minWidth: 140,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                padding: '10px 14px',
                color: '#e2f0ff',
                fontSize: 14,
                transition: 'border-color 0.2s ease',
              }}
            />

            <input
              className="quick-add-input"
              type="text"
              placeholder="Job role"
              value={quickAdd.role}
              onChange={(e) =>
                setQuickAdd((prev) => ({ ...prev, role: e.target.value }))
              }
              style={{
                flex: 1,
                minWidth: 140,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                padding: '10px 14px',
                color: '#e2f0ff',
                fontSize: 14,
                transition: 'border-color 0.2s ease',
              }}
            />

            <select
              value={quickAdd.status}
              onChange={(e) =>
                setQuickAdd((prev) => ({ ...prev, status: e.target.value }))
              }
              style={{
                minWidth: 120,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                padding: '10px 14px',
                color: '#e2f0ff',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              {STAGES.map((s) => (
                <option key={s} value={s} style={{ background: '#0d1421' }}>
                  {s}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={
                !quickAdd.company.trim() ||
                !quickAdd.role.trim() ||
                addMutation.isPending
              }
              style={{
                background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
                border: 'none',
                borderRadius: 8,
                padding: '10px 20px',
                color: 'white',
                fontSize: 14,
                fontWeight: 500,
                cursor:
                  !quickAdd.company.trim() ||
                  !quickAdd.role.trim() ||
                  addMutation.isPending
                    ? 'not-allowed'
                    : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                opacity:
                  !quickAdd.company.trim() ||
                  !quickAdd.role.trim() ||
                  addMutation.isPending
                    ? 0.5
                    : 1,
                transition: 'all 0.2s ease',
              }}
            >
              {addMutation.isPending ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Plus size={16} /> Add
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </PageTransition>
  );
}
