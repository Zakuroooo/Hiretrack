'use client'

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, Eye, EyeOff, Sparkles, User, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PasswordStrength from '@/components/auth/PasswordStrength';
import { useWindowSize } from '@/hooks/useWindowSize';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const { width } = useWindowSize();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      if (registerUser) {
        await registerUser(data.name, data.email, data.password);
      }
      toast.success('Account created! Welcome to HireTrack');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      background: '#080c14',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      padding: '40px 20px'
    }}>
      {/* Back to Home Button */}
      <button
        onClick={() => router.push('/')}
        style={{
          position: 'absolute',
          top: 24,
          left: 32,
          zIndex: 10,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          color: '#7096b8',
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          padding: '8px 12px',
          borderRadius: 8,
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = '#e2f0ff';
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = '#7096b8';
          e.currentTarget.style.background = 'none';
        }}
      >
        <ArrowLeft size={16} />
        Back to home
      </button>

      {/* Aurora Blobs */}
      <div style={{
        position: 'absolute', pointerEvents: 'none', zIndex: 0,
        top: '-100px', left: '-100px', width: '500px', height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)',
        filter: 'blur(40px)'
      }} />
      <div style={{
        position: 'absolute', pointerEvents: 'none', zIndex: 0,
        bottom: '-100px', right: '-100px', width: '450px', height: '450px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)',
        filter: 'blur(50px)'
      }} />
      <div style={{
        position: 'absolute', pointerEvents: 'none', zIndex: 0,
        top: '40%', right: '-50px', width: '300px', height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%)',
        filter: 'blur(30px)'
      }} />

      {/* Floating Cards */}
      <motion.div
        style={{
          display: width < 1024 ? 'none' : 'block',
          position: 'absolute', zIndex: 1, top: '15%', left: '2%',
          background: 'rgba(13,20,33,0.95)', border: '1px solid rgba(34,197,94,0.3)',
          borderRadius: '14px', padding: width < 1280 ? '12px 14px' : '16px 20px', backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          width: 'fit-content', minWidth: '180px', maxWidth: '220px'
        }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
          <span style={{ color: '#4ade80', fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap' }}>Offer Received!</span>
        </div>
        <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px', whiteSpace: 'nowrap' }}>Senior Frontend Dev at Google</div>
        <div style={{ color: '#e2f0ff', fontSize: '11px', marginTop: '2px', whiteSpace: 'nowrap' }}>🎉 Congratulations!</div>
      </motion.div>

      <motion.div
        style={{
          display: width < 1024 ? 'none' : 'block',
          position: 'absolute', zIndex: 1, top: '42%', left: '1%',
          background: 'rgba(13,20,33,0.95)', border: '1px solid rgba(56,189,248,0.3)',
          borderRadius: '14px', padding: width < 1280 ? '12px 14px' : '14px 18px', backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          width: 'fit-content', minWidth: '180px', maxWidth: '220px'
        }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#38bdf8' }} />
          <span style={{ color: '#38bdf8', fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap' }}>Interview Scheduled</span>
        </div>
        <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px', whiteSpace: 'nowrap' }}>Stripe · Tomorrow 2:00 PM</div>
      </motion.div>

      <motion.div
        style={{
          display: width < 1024 ? 'none' : 'block',
          position: 'absolute', zIndex: 1, top: '65%', left: '2%',
          background: 'rgba(13,20,33,0.95)', border: '1px solid rgba(14,165,233,0.3)',
          borderRadius: '14px', padding: width < 1280 ? '12px 14px' : '16px 20px', backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          width: 'fit-content', minWidth: '180px', maxWidth: '220px'
        }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={14} color="#0ea5e9" />
          <span style={{ color: '#e2f0ff', fontWeight: 500, fontSize: '13px', whiteSpace: 'nowrap' }}>AI Match Score</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '4px' }}>
          <span style={{
            fontSize: '28px', fontWeight: 700,
            background: 'linear-gradient(135deg,#38bdf8,#2563eb)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>94</span>
          <span style={{ color: '#7096b8', fontSize: '11px', whiteSpace: 'nowrap' }}>/ 100 match score</span>
        </div>
      </motion.div>

      {/* Center Column */}
      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '420px' }}>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', justifyContent: 'center' }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 16px', borderRadius: '20px',
            background: 'rgba(14,165,233,0.08)',
            border: '1px solid rgba(14,165,233,0.2)',
            color: '#38bdf8', fontSize: '12px',
            marginBottom: '24px'
          }}>
            ✦ Join 2,800+ job seekers
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}
        >
          <Zap size={24} color="#0ea5e9" />
          <span style={{
            fontSize: '28px', fontWeight: 700,
            background: 'linear-gradient(135deg,#e2f0ff 0%,#38bdf8 40%,#2563eb 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>HireTrack</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          style={{ fontSize: '32px', fontWeight: 700, color: '#e2f0ff', textAlign: 'center', marginBottom: '8px' }}
        >
          Create your account
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ fontSize: '15px', color: '#7096b8', textAlign: 'center', marginBottom: '32px' }}
        >
          Start tracking your job search today
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          style={{
            background: 'rgba(13,20,33,0.85)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '20px',
            padding: '32px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
            width: '100%'
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>

            {/* Name Field */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#7096b8', display: 'block', marginBottom: '8px' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} size={16} color="#3d5a7a" />
                <input
                  type="text"
                  placeholder="John Doe"
                  {...register('name')}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
                    padding: '12px 16px 12px 44px', color: '#e2f0ff', fontSize: '15px',
                    outline: 'none', transition: 'all 0.2s ease', boxSizing: 'border-box'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#0ea5e9'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              {errors.name && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '4px' }}>{errors.name.message}</p>}
            </div>

            {/* Email Field */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#7096b8', display: 'block', marginBottom: '8px' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} size={16} color="#3d5a7a" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
                    padding: '12px 16px 12px 44px', color: '#e2f0ff', fontSize: '15px',
                    outline: 'none', transition: 'all 0.2s ease', boxSizing: 'border-box'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#0ea5e9'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              {errors.email && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '4px' }}>{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#7096b8', display: 'block', marginBottom: '8px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} size={16} color="#3d5a7a" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
                    padding: '12px 44px 12px 44px', color: '#e2f0ff', fontSize: '15px',
                    outline: 'none', transition: 'all 0.2s ease', boxSizing: 'border-box'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#0ea5e9'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev: boolean) => !prev)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={16} color="#3d5a7a" /> : <Eye size={16} color="#3d5a7a" />}
                </button>
              </div>
              <div style={{ marginTop: '8px' }}>
                <PasswordStrength password={watch('password') || ''} />
              </div>
              {errors.password && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '4px' }}>{errors.password.message}</p>}
            </div>

            {/* Confirm Password Field */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#7096b8', display: 'block', marginBottom: '8px' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} size={16} color="#3d5a7a" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
                    padding: '12px 44px 12px 44px', color: '#e2f0ff', fontSize: '15px',
                    outline: 'none', transition: 'all 0.2s ease', boxSizing: 'border-box'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#0ea5e9'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev: boolean) => !prev)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center'
                  }}
                >
                  {showConfirm ? <EyeOff size={16} color="#3d5a7a" /> : <Eye size={16} color="#3d5a7a" />}
                </button>
              </div>
              {errors.confirmPassword && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '4px' }}>{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%', height: '48px', marginTop: '16px',
                background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
                border: 'none', borderRadius: '10px', color: 'white',
                fontSize: '15px', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease', display: 'flex',
                alignItems: 'center', justifyContent: 'center', gap: '8px',
                opacity: isLoading ? 0.7 : 1
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { if (!isLoading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(14,165,233,0.35)'; } }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { if (!isLoading) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; } }}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Creating Account...</span>
                </>
              ) : (
                "Create Account"
              )}
            </button>

            <div style={{ color: '#3d5a7a', fontSize: '12px', textAlign: 'center', marginTop: '12px' }}>
              By signing up you agree to our Terms of Service
            </div>

            <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
              <span style={{ color: '#3d5a7a', fontSize: '13px' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <span style={{ color: '#7096b8', fontSize: '14px' }}>Already have an account? </span>
              <a href="/login" style={{ color: '#38bdf8', fontWeight: 500, textDecoration: 'none', fontSize: '14px' }}>
                Sign in →
              </a>
            </div>

          </form>
        </motion.div>

        <div style={{ textAlign: 'center', marginTop: '24px', color: '#3d5a7a', fontSize: '12px' }}>
          Secure · Private · Free
        </div>

      </div>
    </div>
  );
}
