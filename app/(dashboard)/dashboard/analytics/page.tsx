'use client'

import { useQuery } from '@tanstack/react-query'
import axios from '@/lib/axios'
import { BarChart3, Award, Target, Calendar } from 'lucide-react'
import { PieChart, Pie, Cell, LineChart, Line, XAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import AnimatedCounter from '@/components/ui/AnimatedCounter'
import PageTransition from '@/components/ui/PageTransition'
import Link from 'next/link'

const STAGE_COLORS: Record<string, string> = {
  Applied: '#38bdf8',
  Screening: '#f59e0b',
  Interview: '#a78bfa',
  Offer: '#22c55e',
  Rejected: '#ef4444',
}

const cardStyle = {
  background: '#0d1421',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 16,
  padding: '20px 24px',
}

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => axios.get('/analytics').then(r => r.data.data),
    staleTime: 5 * 60 * 1000
  })

  return (
    <PageTransition>
      <div>
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BarChart3 size={22} color="#0ea5e9" />
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e2f0ff', margin: 0 }}>
              Analytics
            </h1>
          </div>
          <p style={{ fontSize: 14, color: '#7096b8', marginTop: 4 }}>
            Track your job search performance
          </p>
        </div>

        {isLoading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="shimmer-loading" style={{ height: 120, borderRadius: 16 }} />
            ))}
          </div>
        )}

        {!isLoading && (!data || data.total === 0) && (
          <div style={{ ...cardStyle, textAlign: 'center', padding: '60px 24px' }}>
            <BarChart3 size={64} color="#1e3a5f" style={{ margin: '0 auto 16px' }} />
            <div style={{ fontSize: 18, fontWeight: 600, color: '#4a6080' }}>No data yet</div>
            <div style={{ fontSize: 14, color: '#3d5a7a', marginTop: 8, marginBottom: 24 }}>
              Add applications to see analytics
            </div>
            <Link href="/dashboard/board" style={{
              background: 'linear-gradient(135deg,#0ea5e9,#2563eb)',
              color: 'white', padding: '10px 24px',
              borderRadius: 10, fontSize: 14,
              fontWeight: 500, textDecoration: 'none'
            }}>
              Go to Job Board →
            </Link>
          </div>
        )}

        {!isLoading && data && data.total > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: '#7096b8' }}>Success Rate</span>
                  <Award size={20} color="#22c55e" />
                </div>
                <div style={{ fontSize: 36, fontWeight: 700, color: '#22c55e' }}>
                  {data.successRate}%
                </div>
                <div style={{ fontSize: 12, color: '#4a6080', marginTop: 4 }}>
                  applications led to offer
                </div>
              </div>

              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: '#7096b8' }}>This Month</span>
                  <Calendar size={20} color="#0ea5e9" />
                </div>
                <div style={{ fontSize: 36, fontWeight: 700, color: '#e2f0ff' }}>
                  <AnimatedCounter value={data.thisMonth} />
                </div>
                <div style={{ fontSize: 12, color: Number(data.monthOverMonthChange) >= 0 ? '#22c55e' : '#ef4444', marginTop: 4 }}>
                  {Number(data.monthOverMonthChange) >= 0 ? '▲' : '▼'} {data.monthOverMonthChange}% vs last month
                </div>
              </div>

              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: '#7096b8' }}>Total Applications</span>
                  <Target size={20} color="#a78bfa" />
                </div>
                <div style={{ fontSize: 36, fontWeight: 700, color: '#a78bfa' }}>
                  <AnimatedCounter value={data.total} />
                </div>
                <div style={{ fontSize: 12, color: '#4a6080', marginTop: 4 }}>
                  across all stages
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={cardStyle}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#e2f0ff', marginBottom: 16 }}>
                  Application Status
                </div>
                <div style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.statusDistribution}
                        dataKey="count"
                        nameKey="status"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                      >
                        {data.statusDistribution.map((entry: any, i: number) => (
                          <Cell key={i} fill={STAGE_COLORS[entry.status] || '#38bdf8'} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          background: '#0d1421',
                          border: '1px solid rgba(14,165,233,0.2)',
                          borderRadius: 10,
                          color: '#e2f0ff',
                          fontSize: 13
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12, justifyContent: 'center' }}>
                  {data.statusDistribution.map((s: any) => (
                    <div key={s.status} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: STAGE_COLORS[s.status] }} />
                      <span style={{ fontSize: 11, color: '#7096b8' }}>{s.status}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#e2f0ff' }}>{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={cardStyle}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#e2f0ff', marginBottom: 16 }}>
                  Monthly Trend
                </div>
                <div style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="month" tick={{ fill: '#4a6080', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <RechartsTooltip contentStyle={{ background: '#0d1421', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 10, color: '#e2f0ff', fontSize: 13 }} />
                      <Line type="monotone" dataKey="applied" stroke="#38bdf8" strokeWidth={2} dot={{ fill: '#38bdf8', r: 3 }} name="Applied" />
                      <Line type="monotone" dataKey="interviews" stroke="#a78bfa" strokeWidth={2} dot={{ fill: '#a78bfa', r: 3 }} name="Interviews" />
                      <Line type="monotone" dataKey="offers" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 3 }} name="Offers" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 16 }}>
              <div style={cardStyle}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#e2f0ff', marginBottom: 16 }}>
                  Most Applied Companies
                </div>
                {data.topCompanies.length === 0 ? (
                  <div style={{ fontSize: 13, color: '#3d5a7a' }}>No data yet</div>
                ) : (
                  data.topCompanies.map((c: any, i: number) => {
                    const maxCount = data.topCompanies[0]?.count || 1
                    return (
                      <div key={i} style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 13, color: '#e2f0ff' }}>{c.company}</span>
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#38bdf8', background: 'rgba(56,189,248,0.1)', padding: '2px 8px', borderRadius: 20 }}>
                            {c.count}
                          </span>
                        </div>
                        <div style={{ height: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 4, marginTop: 6 }}>
                          <div style={{ height: '100%', width: `${(c.count / maxCount) * 100}%`, background: 'linear-gradient(90deg,#0ea5e9,#2563eb)', borderRadius: 4, transition: 'width 0.8s ease' }} />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              <div style={cardStyle}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#e2f0ff', marginBottom: 16 }}>
                  Insights
                </div>
                {([
                  data.successRate > 0 && { icon: '🏆', color: '#22c55e', title: 'Great Progress!', text: `You have a ${data.successRate}% offer rate. Keep it up!` },
                  data.thisMonth === 0 && { icon: '📅', color: '#a78bfa', title: 'Stay Consistent', text: "You haven't tracked any applications this month." },
                  data.total > 3 && { icon: '📊', color: '#38bdf8', title: 'Strong Pipeline', text: `You have ${data.total} applications tracked. Great job!` },
                  { icon: '✨', color: '#f59e0b', title: 'Improve Your Score', text: 'Use AI Resume Match to tailor your resume for each job.' }
                ] as any[]).filter(Boolean).slice(0, 4).map((insight: any, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${insight.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>
                      {insight.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#e2f0ff' }}>{insight.title}</div>
                      <div style={{ fontSize: 12, color: '#7096b8', lineHeight: 1.5, marginTop: 2 }}>{insight.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </PageTransition>
  )
}