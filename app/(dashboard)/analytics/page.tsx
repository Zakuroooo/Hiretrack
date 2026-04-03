'use client'

import { useQuery } from '@tanstack/react-query'
import axios from '@/lib/axios'
import { motion } from 'framer-motion'
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer
} from 'recharts'
import {
  TrendingUp, Award, Target,
  BarChart3, Calendar
} from 'lucide-react'
import AnimatedCounter from '@/components/ui/AnimatedCounter'
import PageTransition from '@/components/ui/PageTransition'
import Link from 'next/link'

const customTooltipStyle = {
  background: '#0d1421',
  border: '1px solid rgba(14,165,233,0.2)',
  borderRadius: '10px',
  color: '#e2f0ff',
  fontSize: '13px'
};

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => axios.get('/api/analytics').then(r => r.data.data),
    staleTime: 5 * 60 * 1000
  })

  if (isLoading) {
    return (
      <PageTransition>
        <div className="max-w-6xl mx-auto p-6 md:p-8">
          <div className="flex items-center gap-3 mb-7">
            <div className="w-[22px] h-[22px] rounded bg-slate-800 animate-pulse"></div>
            <div>
              <div className="w-32 h-6 bg-slate-800 rounded animate-pulse mb-2"></div>
              <div className="w-64 h-4 bg-slate-800 rounded animate-pulse"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[100px] bg-[#0d1421] border border-white/5 rounded-2xl p-5 animate-pulse"></div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
             <div className="h-[320px] bg-[#0d1421] border border-white/5 rounded-2xl p-5 animate-pulse"></div>
             <div className="h-[320px] bg-[#0d1421] border border-white/5 rounded-2xl p-5 animate-pulse"></div>
          </div>
        </div>
      </PageTransition>
    )
  }

  const {
    statusDistribution = [],
    monthlyTrend = [],
    topCompanies = [],
    total = 0,
    thisMonth = 0,
    monthOverMonthChange = "0",
    successRate = "0.0"
  } = data || {}

  const change = Number(monthOverMonthChange)

  // Insights logic
  const insights = []
  if (total === 0) {
    insights.push({
      icon: Target,
      color: '#0ea5e9',
      title: 'Get Started',
      text: 'Start tracking your applications to unlock insights.'
    })
  } else {
    const sr = Number(successRate)
    if (sr > 0) {
      insights.push({
        icon: Award,
        color: '#22c55e', 
        title: 'Great Progress!',
        text: `You have a ${successRate}% offer rate. Keep it up!`
      })
    }
  
    const appliedCount = statusDistribution.find((s: any) => s.status === 'Applied')?.count || 0
    if (appliedCount > 5 && sr < 10) {
      insights.push({
        icon: TrendingUp,
        color: '#f59e0b',
        title: 'Improve Your Match Rate',
        text: 'Try using the AI Resume Match tool to tailor your resume for each job.'
      })
    }
  
    if (thisMonth === 0) {
      insights.push({
        icon: Calendar,
        color: '#a78bfa',
        title: 'Stay Consistent',
        text: "You haven't tracked any applications this week. Consistency is key!"
      })
    }
  
    if (total > 10) {
      insights.push({
        icon: BarChart3,
        color: '#38bdf8',
        title: 'Strong Pipeline',
        text: `You have ${total} applications tracked. Great job staying organized!`
      })
    }
  }

  const chartCardClass = "bg-[#0d1421] border border-white/5 rounded-2xl p-5 md:p-6 hover:border-sky-500/20 hover:-translate-y-0.5 transition-all duration-200"

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        <header className="mb-7">
          <div className="flex items-center gap-3">
            <BarChart3 size={22} className="text-[#0ea5e9]" />
            <div className="space-y-0">
              <h1 className="text-[22px] font-bold text-[#e2f0ff] leading-tight">Analytics</h1>
              <p className="text-[#7096b8] text-sm leading-tight">Track your job search performance</p>
            </div>
          </div>
        </header>

        {total === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center bg-[#0d1421] border border-white/5 rounded-2xl p-12 text-center mt-8"
          >
            <BarChart3 size={64} className="text-[#1e3a5f] mb-4" />
            <h2 className="text-[#4a6080] text-lg font-semibold mb-2">No data yet</h2>
            <p className="text-[#3d5a7a] text-sm mb-6">Start adding applications to see analytics</p>
            <Link 
              href="/dashboard/board"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Go to Job Board &rarr;
            </Link>
          </motion.div>
        ) : (
          <>
            {/* SECTION 1 - TOP STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0 }}
                className={chartCardClass}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Award size={20} color="#22c55e" />
                  <span className="text-[#7096b8] text-xs">Success Rate</span>
                </div>
                <div className="text-[36px] font-bold text-[#22c55e] mb-1">
                  {successRate}%
                </div>
                <div className="text-[#4a6080] text-xs">applications led to offer</div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className={chartCardClass}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={20} color="#0ea5e9" />
                  <span className="text-[#7096b8] text-xs">This Month</span>
                </div>
                <div className="text-[36px] font-bold text-[#e2f0ff] mb-1">
                  <AnimatedCounter value={thisMonth} />
                </div>
                <div className={`text-xs ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {change >= 0 ? `▲ +${change}% vs last month` : `▼ ${Math.abs(change)}% vs last month`}
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className={chartCardClass}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Target size={20} color="#a78bfa" />
                  <span className="text-[#7096b8] text-xs">Total Applications</span>
                </div>
                <div className="text-[36px] font-bold text-[#a78bfa] mb-1">
                  <AnimatedCounter value={total} />
                </div>
                <div className="text-[#4a6080] text-xs">across all stages</div>
              </motion.div>
            </div>

            {/* SECTION 2 - CHARTS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Status Distribution */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className={chartCardClass}
              >
                <h3 className="text-[15px] font-semibold text-[#e2f0ff] mb-5">Application Status</h3>
                
                {statusDistribution.length === 0 ? (
                  <div className="h-[220px] flex items-center justify-center text-[#4a6080] text-sm">
                    No status data available
                  </div>
                ) : (
                  <>
                    <div className="flex justify-center flex-col items-center">
                      <PieChart width={300} height={220}>
                        <Pie
                          data={statusDistribution}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={3}
                        >
                          {statusDistribution.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={customTooltipStyle} itemStyle={{ color: '#e2f0ff' }} />
                      </PieChart>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 justify-center mt-4">
                      {statusDistribution.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="text-[12px] text-[#7096b8]">{item.status}</span>
                          <span className="text-[12px] font-semibold text-[#e2f0ff]">{item.count}</span>
                          <span className="text-[11px] text-[#4a6080]">({item.percentage}%)</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>

              {/* Monthly Trend */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className={chartCardClass}
              >
                <h3 className="text-[15px] font-semibold text-[#e2f0ff] mb-5">Monthly Trend</h3>

                {monthlyTrend.length === 0 ? (
                  <div className="h-[220px] flex items-center justify-center text-[#4a6080] text-sm">
                    No trend data available
                  </div>
                ) : (
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis 
                          dataKey="month" 
                          tick={{ fill: '#4a6080', fontSize: 11 }} 
                          axisLine={false} 
                          tickLine={false}
                          dy={10} 
                        />
                        <YAxis 
                          tick={{ fill: '#4a6080', fontSize: 11 }} 
                          axisLine={false} 
                          tickLine={false}
                          width={20}
                        />
                        <RechartsTooltip contentStyle={customTooltipStyle} />
                        <Legend wrapperStyle={{ fontSize: 12, color: '#7096b8', paddingTop: 10 }} />
                        <Line 
                          type="monotone" 
                          dataKey="applied" 
                          stroke="#38bdf8" 
                          strokeWidth={2} 
                          dot={{ fill: '#38bdf8', r: 3 }} 
                          name="Applied" 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="interviews" 
                          stroke="#a78bfa" 
                          strokeWidth={2} 
                          dot={{ fill: '#a78bfa', r: 3 }} 
                          name="Interviews" 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="offers" 
                          stroke="#22c55e" 
                          strokeWidth={2} 
                          dot={{ fill: '#22c55e', r: 3 }} 
                          name="Offers" 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </motion.div>
            </div>

            {/* SECTION 3 - BOTTOM ROW */}
            <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-4 mb-6">
              {/* Top Companies */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className={chartCardClass}
              >
                <h3 className="text-[15px] font-semibold text-[#e2f0ff] mb-5">Most Applied Companies</h3>
                
                {topCompanies.length === 0 ? (
                  <p className="text-[#4a6080] text-sm">Apply to more jobs to see patterns</p>
                ) : (
                  <div className="space-y-3">
                    {topCompanies.map((item: any, idx: number) => {
                      const maxCount = Math.max(...topCompanies.map((c: any) => c.count));
                      const widthPercent = (item.count / maxCount) * 100;
                      
                      return (
                        <div key={idx} className="mb-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[13px] text-[#e2f0ff] truncate pr-2 flex-1">{item.company}</span>
                            <span className="text-xs bg-blue-500/10 text-[#0ea5e9] px-2.5 py-0.5 rounded-full font-medium shrink-0">
                              {item.count}
                            </span>
                          </div>
                          
                          <div className="w-full h-1.5 bg-white/5 rounded-full mt-1.5 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${widthPercent}%` }}
                              transition={{ duration: 0.8, delay: idx * 0.1 }}
                              className="h-full rounded-full bg-gradient-to-r from-[#0ea5e9] to-blue-600"
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </motion.div>

              {/* Insights */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className={chartCardClass}
              >
                <h3 className="text-[15px] font-semibold text-[#e2f0ff] mb-5">Job Search Insights</h3>
                
                <div className="flex flex-col">
                  {insights.slice(0, 4).map((insight, idx) => {
                    const Icon = insight.icon;
                    return (
                      <div 
                        key={idx} 
                        className={`flex gap-3 items-start py-3 ${idx !== Math.min(insights.length, 4) - 1 ? 'border-b border-white/5' : ''}`}
                      >
                        <div 
                          className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${insight.color}22` }}
                        >
                          <Icon size={16} color={insight.color} />
                        </div>
                        <div>
                          <h4 className="text-[13px] font-semibold text-[#e2f0ff] leading-none mb-1 mt-0.5">{insight.title}</h4>
                          <p className="text-[12px] text-[#7096b8] leading-relaxed mt-1.5">{insight.text}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </PageTransition>
  )
}
