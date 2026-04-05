'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useInView } from 'framer-motion';
import {
  Zap,
  Kanban,
  Sparkles,
  BarChart3,
  Shield,
  Clock,
} from 'lucide-react';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { useAuthStore } from '@/lib/store/authStore';
import { toast } from 'sonner';
import { useWindowSize } from '@/hooks/useWindowSize';

/* ─── Shared animation variant ─────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

/* ─── Inline pulse keyframe (injected once) ─────────────────────── */
const pulseStyle = `
  @keyframes ht-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(0.85); }
  }
`;

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { width } = useWindowSize();
  const isMobile = width < 768;

  /* Redirect logged-in users straight to dashboard */
  useEffect(() => {
    if (user) router.push('/dashboard');
  }, [user, router]);

  /* Stats section inView trigger */
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-80px' });

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <style>{pulseStyle}</style>

      {/* ══════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════ */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(8,12,20,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          height: '64px',
          padding: isMobile ? '0 20px' : '0 48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'default' }}>
          <Zap size={isMobile ? 18 : 22} color="#0ea5e9" />
          <span
            style={{
              fontWeight: 700,
              fontSize: isMobile ? '16px' : '20px',
              background: 'linear-gradient(135deg,#e2f0ff,#38bdf8,#2563eb)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            HireTrack
          </span>
        </div>

        {/* Nav actions */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {!isMobile && (
            <a
              href="/login"
              style={{
                color: '#7096b8',
                fontSize: '14px',
                textDecoration: 'none',
                marginRight: '16px',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#e2f0ff')}
              onMouseLeave={e => (e.currentTarget.style.color = '#7096b8')}
            >
              Sign In
            </a>
          )}
          <button
            onClick={() => router.push('/register')}
            style={{
              background: 'linear-gradient(135deg,#0ea5e9,#2563eb)',
              padding: isMobile ? '6px 14px' : '8px 20px',
              borderRadius: '8px',
              color: 'white',
              fontSize: isMobile ? '13px' : '14px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(14,165,233,0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Get Started Free
          </button>
        </div>
      </nav>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: '#080c14',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        {/* Aurora blobs */}
        <div
          style={{
            position: 'absolute', top: '-200px', left: '-200px',
            width: '700px', height: '700px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)',
            filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute', bottom: '-200px', right: '-200px',
            width: '600px', height: '600px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37,99,235,0.10) 0%, transparent 70%)',
            filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute', top: '30%', left: '30%',
            width: '500px', height: '500px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%)',
            filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0,
          }}
        />

        {/* Center content */}
        <div
          style={{
            position: 'relative', zIndex: 1,
            maxWidth: '820px', textAlign: 'center',
            padding: '80px 24px 60px',
          }}
        >
          {/* Announcement pill */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(14,165,233,0.08)',
              border: '1px solid rgba(14,165,233,0.2)',
              borderRadius: '20px', padding: '6px 16px',
              marginBottom: '32px', cursor: 'default',
            }}
          >
            <span
              style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: '#38bdf8', display: 'inline-block',
                animation: 'ht-pulse 2s ease-in-out infinite',
              }}
            />
            <span style={{ color: '#38bdf8', fontSize: '13px' }}>
              Now with AI Resume Matching
            </span>
            <span style={{ color: '#38bdf8' }}>→</span>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div
              style={{
                fontSize: 'clamp(40px, 6vw, 72px)',
                fontWeight: 800,
                color: '#e2f0ff',
                lineHeight: 1.1,
                marginBottom: '12px',
              }}
            >
              Track every opportunity.
            </div>
            <div
              style={{
                fontSize: 'clamp(40px, 6vw, 72px)',
                fontWeight: 800,
                lineHeight: 1.1,
                marginBottom: '28px',
                background: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 50%, #2563eb 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Land your dream role.
            </div>
          </motion.div>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              fontSize: '18px', color: '#7096b8',
              maxWidth: '540px', margin: '0 auto 40px',
              lineHeight: 1.7,
            }}
          >
            A premium job search workspace with AI-powered insights,
            beautiful analytics, and drag-and-drop application tracking.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'center' : undefined,
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={() => router.push('/register')}
              style={{
                background: 'linear-gradient(135deg,#0ea5e9,#2563eb)',
                padding: '14px 32px', borderRadius: '12px',
                fontSize: '16px', fontWeight: 600, color: 'white',
                border: 'none', cursor: 'pointer',
                boxShadow: '0 0 30px rgba(14,165,233,0.2)',
                transition: 'all 0.2s ease',
                width: isMobile ? '100%' : undefined,
                maxWidth: isMobile ? '320px' : undefined,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(14,165,233,0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 0 30px rgba(14,165,233,0.2)';
              }}
            >
              Start Tracking Free →
            </button>
            <button
              onClick={scrollToFeatures}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.12)',
                padding: '14px 32px', borderRadius: '12px',
                fontSize: '16px', color: '#7096b8', cursor: 'pointer',
                transition: 'all 0.2s ease',
                width: isMobile ? '100%' : undefined,
                maxWidth: isMobile ? '320px' : undefined,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                e.currentTarget.style.color = '#e2f0ff';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                e.currentTarget.style.color = '#7096b8';
              }}
            >
              See how it works ↓
            </button>
          </motion.div>

          {/* Social proof avatars */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{
              marginTop: '32px',
              display: width < 480 ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'center', gap: '0',
            }}
          >
            {[
              { initials: 'PS', bg: '#0ea5e9' },
              { initials: 'AK', bg: '#2563eb' },
              { initials: 'MR', bg: '#7c3aed' },
              { initials: 'JL', bg: '#059669' },
              { initials: 'SK', bg: '#dc2626' },
            ].map((av, i) => (
              <div
                key={av.initials}
                style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: av.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 600, color: 'white',
                  border: '2px solid #080c14',
                  marginLeft: i === 0 ? '0' : '-8px',
                  position: 'relative', zIndex: 5 - i,
                }}
              >
                {av.initials}
              </div>
            ))}
            <span style={{ color: '#7096b8', fontSize: '13px', marginLeft: '12px' }}>
              Trusted by 2,800+ job seekers
            </span>
          </motion.div>

          {/* Dashboard preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            style={{ maxWidth: '900px', margin: '60px auto 0' }}
          >
            {/* Browser chrome */}
            <div
              style={{
                background: '#0d1421',
                borderRadius: '16px 16px 0 0',
                padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: '8px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderBottomColor: 'rgba(255,255,255,0.06)',
              }}
            >
              {[['#ff5f57','r'], ['#ffbd2e','y'], ['#28c840','g']].map(([color]) => (
                <div
                  key={color}
                  style={{ width: '12px', height: '12px', borderRadius: '50%', background: color }}
                />
              ))}
              <div
                style={{
                  flex: 1, maxWidth: '300px', margin: '0 auto',
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: '6px', padding: '4px 12px',
                  fontSize: '12px', color: '#3d5a7a', textAlign: 'center',
                }}
              >
                app.hiretrack.io/dashboard
              </div>
            </div>

            {/* Dashboard content */}
            <div
              style={{
                background: 'rgba(13,20,33,0.95)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderTop: 'none',
                borderRadius: '0 0 16px 16px',
                padding: '20px',
                boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
              }}
            >
              {/* Mini stat cards */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {[
                  { value: '48', color: '#e2f0ff', label: 'Applications' },
                  { value: '5',  color: '#38bdf8', label: 'Interviews' },
                  { value: '87%',color: '#4ade80', label: 'Response Rate' },
                  { value: '94', color: '#a78bfa', label: 'AI Score' },
                ].map(card => (
                  <div
                    key={card.label}
                    style={{
                      flex: '1', minWidth: '100px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '10px', padding: '12px 16px',
                    }}
                  >
                    <div style={{ fontSize: '24px', fontWeight: 700, color: card.color }}>
                      {card.value}
                    </div>
                    <div style={{ fontSize: '11px', color: '#7096b8', marginTop: '2px' }}>
                      {card.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Mini kanban */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                {[
                  {
                    label: 'Applied', color: '#38bdf8',
                    bg: 'rgba(56,189,248,0.03)',
                    cards: ['Google · SWE Intern', 'Amazon · SDE-1', 'Meta · Frontend'],
                  },
                  {
                    label: 'Screening', color: '#fbbf24',
                    bg: 'rgba(245,158,11,0.03)',
                    cards: ['Stripe · Backend', 'Razorpay · Full Stack'],
                  },
                  {
                    label: 'Interview', color: '#a78bfa',
                    bg: 'rgba(167,139,250,0.03)',
                    cards: ['Zepto · SWE-2'],
                  },
                  {
                    label: 'Offer', color: '#4ade80',
                    bg: 'rgba(34,197,94,0.03)',
                    cards: ['Groww 🎉'],
                  },
                ].map(col => (
                  <div
                    key={col.label}
                    style={{
                      flex: '1', minWidth: '100px',
                      background: col.bg,
                      borderRadius: '8px', padding: '10px',
                      borderTop: `2px solid ${col.color}`,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                      }}
                    >
                      <span style={{ color: col.color, fontSize: '11px', fontWeight: 600 }}>
                        {col.label}
                      </span>
                      <span
                        style={{
                          background: `${col.color}22`,
                          color: col.color, fontSize: '10px',
                          padding: '1px 6px', borderRadius: '10px',
                        }}
                      >
                        {col.cards.length}
                      </span>
                    </div>
                    {col.cards.map(c => {
                      const [company, role] = c.split(' · ');
                      return (
                        <div
                          key={c}
                          style={{
                            background: '#0d1421',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '6px', padding: '8px 10px',
                            marginBottom: '6px',
                          }}
                        >
                          <div style={{ color: '#e2f0ff', fontSize: '12px', fontWeight: 500 }}>
                            {company}
                          </div>
                          {role && (
                            <div style={{ color: '#7096b8', fontSize: '10px' }}>{role}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════ */}
      <section
        id="features"
        style={{ paddingTop: '120px', paddingBottom: '120px', background: '#080c14' }}
      >
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          style={{ textAlign: 'center', marginBottom: '60px' }}
        >
          <div
            style={{
              color: '#38bdf8', fontSize: '12px',
              letterSpacing: '0.12em', fontWeight: 600,
              marginBottom: '16px', textTransform: 'uppercase',
            }}
          >
            Features
          </div>
          <div
            style={{ fontSize: '40px', fontWeight: 700, marginBottom: '16px' }}
          >
            <span style={{ color: '#e2f0ff' }}>Everything you need</span>{' '}
            <span
              style={{
                background: 'linear-gradient(135deg,#38bdf8,#0ea5e9,#2563eb)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}
            >
              to land the job
            </span>
          </div>
          <p style={{ color: '#7096b8', fontSize: '17px' }}>
            Stop losing track. Start winning interviews.
          </p>
        </motion.div>

        {/* Bento grid */}
        <div
          style={{
            maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '0 16px' : '0 24px',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : width < 1024 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            gap: '16px',
          }}
        >
          {/* Card 1 — wide */}
          <FeatureCard
            delay={0}
            style={{ gridColumn: isMobile ? 'span 1' : 'span 2', background: 'rgba(14,165,233,0.04)', border: '1px solid rgba(14,165,233,0.12)', padding: isMobile ? '20px' : '28px' }}
          >
            <Kanban size={32} color="#0ea5e9" />
            <h3 style={{ color: '#e2f0ff', fontSize: '20px', fontWeight: 600, marginTop: '16px' }}>
              Drag &amp; Drop Job Board
            </h3>
            <p style={{ color: '#7096b8', fontSize: '14px', lineHeight: 1.6, marginTop: '12px' }}>
              Visualize your entire job search in one place. Move applications
              through stages effortlessly with a beautiful kanban board.
            </p>
          </FeatureCard>

          {/* Card 2 — AI */}
          <FeatureCard delay={0.1}>
            <Sparkles size={28} color="#0ea5e9" />
            <h3 style={{ color: '#e2f0ff', fontSize: '18px', fontWeight: 600, marginTop: '16px' }}>
              AI Resume Matching
            </h3>
            <p style={{ color: '#7096b8', fontSize: '14px', lineHeight: 1.6, marginTop: '12px' }}>
              Get instant compatibility scores and specific tips to improve your chances.
            </p>
            <div
              style={{
                marginTop: '16px',
                fontSize: '36px', fontWeight: 800,
                background: 'linear-gradient(135deg,#38bdf8,#2563eb)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}
            >
              94/100
            </div>
          </FeatureCard>

          {/* Card 3 — Analytics */}
          <FeatureCard delay={0.2}>
            <BarChart3 size={28} color="#22c55e" />
            <h3 style={{ color: '#e2f0ff', fontSize: '18px', fontWeight: 600, marginTop: '16px' }}>
              Smart Analytics
            </h3>
            <p style={{ color: '#7096b8', fontSize: '14px', lineHeight: 1.6, marginTop: '12px' }}>
              Track response rates, interview conversion, and weekly trends with beautiful charts.
            </p>
          </FeatureCard>

          {/* Card 4 — Timeline */}
          <FeatureCard delay={0.3}>
            <Clock size={28} color="#f59e0b" />
            <h3 style={{ color: '#e2f0ff', fontSize: '18px', fontWeight: 600, marginTop: '16px' }}>
              Application Timeline
            </h3>
            <p style={{ color: '#7096b8', fontSize: '14px', lineHeight: 1.6, marginTop: '12px' }}>
              Full history for every application. Never forget when you applied or what you wrote.
            </p>
          </FeatureCard>

          {/* Card 5 — Security, wide */}
          <FeatureCard
            delay={0.4}
            style={{ gridColumn: isMobile ? 'span 1' : 'span 2', background: 'rgba(13,20,33,0.9)', padding: isMobile ? '20px' : '28px' }}
          >
            <Shield size={28} color="#0ea5e9" />
            <h3 style={{ color: '#e2f0ff', fontSize: '18px', fontWeight: 600, marginTop: '16px' }}>
              Secure &amp; Private
            </h3>
            <p style={{ color: '#7096b8', fontSize: '14px', lineHeight: 1.6, marginTop: '12px' }}>
              Your job search data is encrypted and completely private. We never sell your data
              or share it with employers.
            </p>
          </FeatureCard>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section
        style={{
          paddingTop: '100px', paddingBottom: '100px',
          background: 'rgba(13,20,33,0.5)',
        }}
      >
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          style={{ textAlign: 'center', marginBottom: '60px' }}
        >
          <div
            style={{
              color: '#38bdf8', fontSize: '12px',
              letterSpacing: '0.12em', fontWeight: 600,
              marginBottom: '16px', textTransform: 'uppercase',
            }}
          >
            How It Works
          </div>
          <div style={{ fontSize: '36px', fontWeight: 700, color: '#e2f0ff' }}>
            From chaos to clarity in{' '}
            <span
              style={{
                background: 'linear-gradient(135deg,#38bdf8,#2563eb)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}
            >
              3 steps
            </span>
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'flex-start',
            justifyContent: 'center',
            maxWidth: '900px', margin: '0 auto',
            padding: isMobile ? '0 20px' : '0 24px', gap: isMobile ? '32px' : '0',
          }}
        >
          {[
            {
              num: '1',
              title: 'Add Applications',
              desc: 'Log jobs you apply to in seconds. Company, role, date, job description — all in one place.',
            },
            {
              num: '2',
              title: 'Track Progress',
              desc: 'Move cards across your kanban board as you advance through each hiring stage.',
            },
            {
              num: '3',
              title: 'Get AI Insights',
              desc: 'Let AI analyze your resume against job descriptions and tell you exactly how to improve.',
            },
          ].map((step, i) => (
            <div
              key={step.num}
              style={{
                display: 'flex', alignItems: 'flex-start',
                flex: isMobile ? 'unset' : '1',
                minWidth: isMobile ? 'unset' : '220px',
                width: isMobile ? '100%' : undefined,
              }}
            >
              <div
                style={{
                  textAlign: isMobile ? 'left' : 'center',
                  padding: isMobile ? '0' : '0 32px',
                  flex: 1,
                }}
              >
                <div
                  style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: 'linear-gradient(135deg,#0ea5e9,#2563eb)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px', fontWeight: 700, color: 'white',
                    boxShadow: '0 0 20px rgba(14,165,233,0.3)',
                    margin: '0 auto 20px',
                  }}
                >
                  {step.num}
                </div>
                <div style={{ color: '#e2f0ff', fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                  {step.title}
                </div>
                <div style={{ color: '#7096b8', fontSize: '14px', lineHeight: 1.6 }}>
                  {step.desc}
                </div>
              </div>
              {i < 2 && !isMobile && (
                <div
                  style={{
                    fontSize: '28px', color: '#1e3a5f',
                    alignSelf: 'flex-start', marginTop: '10px',
                    flexShrink: 0,
                  }}
                >
                  →
                </div>
              )}
            </div>
          ))}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════
          STATS
      ══════════════════════════════════════════ */}
      <section
        ref={statsRef}
        style={{
          paddingTop: '80px', paddingBottom: '80px',
          background: '#080c14',
        }}
      >
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)',
            gap: isMobile ? '32px 24px' : '0',
            justifyItems: 'center',
            maxWidth: '900px',
            margin: '0 auto',
            padding: isMobile ? '0 24px' : '0',
          }}
        >
          {[
            { display: '2,800+', label: 'Job seekers using HireTrack', animate: false },
            { display: null,     label: 'User satisfaction rate',      animate: true,  numVal: 94, suffix: '%' },
            { display: '3.2x',  label: 'Faster job search',           animate: false },
            { display: '50K+',  label: 'Applications tracked',        animate: false },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: isMobile ? '36px' : '52px', fontWeight: 800,
                  background: 'linear-gradient(135deg,#e2f0ff 0%,#38bdf8 40%,#2563eb 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  lineHeight: 1.1,
                }}
              >
                {stat.animate ? (
                  statsInView ? (
                    <AnimatedCounter value={stat.numVal!} suffix={stat.suffix} duration={1400} />
                  ) : (
                    <span>0{stat.suffix}</span>
                  )
                ) : (
                  stat.display
                )}
              </div>
              <div style={{ color: '#7096b8', fontSize: '15px', marginTop: '4px' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════
          FINAL CTA + FOOTER
      ══════════════════════════════════════════ */}
      <section
        style={{
          paddingTop: '100px', paddingBottom: '100px',
          background: '#080c14',
        }}
      >
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto', padding: '0 24px' }}
        >
          <div
            style={{
              fontSize: '44px', fontWeight: 800,
              background: 'linear-gradient(135deg,#e2f0ff 0%,#38bdf8 50%,#2563eb 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              marginBottom: '16px', lineHeight: 1.1,
            }}
          >
            Ready to land your dream job?
          </div>
          <p
            style={{
              color: '#7096b8', fontSize: '17px',
              marginBottom: '36px', lineHeight: 1.7,
            }}
          >
            Join thousands of job seekers who found their roles faster with
            HireTrack. It&apos;s completely free.
          </p>
          <button
            onClick={() => router.push('/register')}
            style={{
              background: 'linear-gradient(135deg,#0ea5e9,#2563eb)',
              padding: '16px 48px', borderRadius: '12px',
              fontSize: '17px', fontWeight: 600, color: 'white',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 0 40px rgba(14,165,233,0.25)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(14,165,233,0.45)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 0 40px rgba(14,165,233,0.25)';
            }}
          >
            Get Started Free →
          </button>
        </motion.div>

        {/* Footer */}
        <footer
          style={{
            marginTop: '80px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            flexWrap: 'wrap', gap: '16px',
            padding: isMobile ? '32px 20px' : '40px 48px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={16} color="#0ea5e9" />
              <span style={{ color: '#7096b8', fontSize: '14px', fontWeight: 600 }}>HireTrack</span>
            </div>
            <div style={{ color: '#3d5a7a', fontSize: '12px', marginTop: '4px' }}>
              © 2026 HireTrack. All rights reserved.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <span
              onClick={() => toast.info('Privacy policy coming soon')}
              style={{ color: '#3d5a7a', fontSize: '13px', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#7096b8')}
              onMouseLeave={e => (e.currentTarget.style.color = '#3d5a7a')}
            >
              Privacy
            </span>
            <span
              onClick={() => toast.info('Terms of service coming soon')}
              style={{ color: '#3d5a7a', fontSize: '13px', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#7096b8')}
              onMouseLeave={e => (e.currentTarget.style.color = '#3d5a7a')}
            >
              Terms
            </span>
            <a
              href="https://github.com/Zakuroooo/Hiretrack"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#3d5a7a', fontSize: '13px', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#7096b8')}
              onMouseLeave={e => (e.currentTarget.style.color = '#3d5a7a')}
            >
              GitHub →
            </a>
          </div>
        </footer>
      </section>
    </>
  );
}

/* ─── Feature Card sub-component ──────────────────────────────── */
function FeatureCard({
  children,
  delay = 0,
  style = {},
}: {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay }}
      whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(0,0,0,0.3)' }}
      style={{
        background: '#0d1421',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px',
        padding: '28px',
        transition: 'border-color 0.2s ease',
        cursor: 'default',
        ...style,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(14,165,233,0.2)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor =
          (style as React.CSSProperties & { border?: string }).border?.includes('rgba(14,165,233')
            ? 'rgba(14,165,233,0.12)'
            : 'rgba(255,255,255,0.06)';
      }}
    >
      {children}
    </motion.div>
  );
}
