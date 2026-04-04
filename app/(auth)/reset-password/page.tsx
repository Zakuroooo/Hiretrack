'use client'

import React, { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, Lock, EyeOff, Eye, Check } from 'lucide-react';
import axios from '@/lib/axios';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';

const resetSchema = z.object({
  newPassword: z.string().min(6, 'Min 6 characters'),
  confirmPassword: z.string()
}).refine(d => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(resetSchema)
  });

  const getPasswordStrengthColor = (pwd: string) => {
    if (pwd.length < 6) return '#ef4444';
    if (pwd.length < 8) return '#f59e0b';
    const hasNumber = /\d/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    if (pwd.length >= 8 && hasNumber && hasSpecial) return '#22c55e';
    if (pwd.length >= 8 && hasNumber) return '#eab308';
    return '#f59e0b';
  };

  const newPasswordValue = watch('newPassword') || '';

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await axios.post('/auth/reset-password', { token, newPassword: data.newPassword });
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
          border: '1px solid rgba(239,68,68,0.2)'
        }}>
          <Lock size={28} color="#ef4444" />
        </div>
        <h3 style={{ color: '#e2f0ff', fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Invalid reset link</h3>
        <p style={{ color: '#7096b8', fontSize: '14px', marginBottom: '24px' }}>
          This link is invalid or has expired.
        </p>
        <Link href="/login" style={{ color: '#38bdf8', fontSize: '14px', textDecoration: 'none', fontWeight: 500 }}>
          ← Back to login
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(34,197,94,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
          border: '1px solid rgba(34,197,94,0.2)'
        }}>
          <Check size={28} color="#22c55e" />
        </div>
        <h3 style={{ color: '#e2f0ff', fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Password reset successfully!</h3>
        <p style={{ color: '#7096b8', fontSize: '14px', marginBottom: '24px' }}>
          Redirecting to login...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '13px', fontWeight: 500, color: '#7096b8', display: 'block', marginBottom: '8px' }}>
          New Password
        </label>
        <div style={{ position: 'relative' }}>
          <Lock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} size={16} color="#3d5a7a" />
          <input 
            type={showPassword ? 'text' : 'password'} 
            placeholder="••••••••"
            {...register('newPassword')}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
              padding: '12px 44px 12px 44px', color: '#e2f0ff', fontSize: '15px',
              outline: 'none', transition: 'all 0.2s ease', boxSizing: 'border-box'
            }}
          />
          <button 
            type="button"
            onClick={() => setShowPassword(p => !p)}
            style={{
              position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex'
            }}
          >
            {showPassword ? <EyeOff size={16} color="#3d5a7a" /> : <Eye size={16} color="#3d5a7a" />}
          </button>
        </div>
        {newPasswordValue.length > 0 && (
          <div style={{ marginTop: '8px', height: '4px', borderRadius: '4px', width: '100%', background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            <div style={{ height: '100%', transition: 'all 0.3s ease', width: `${Math.min((newPasswordValue.length / 8) * 100, 100)}%`, backgroundColor: getPasswordStrengthColor(newPasswordValue) }} />
          </div>
        )}
        {errors.newPassword && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '4px' }}>{errors.newPassword?.message as string}</p>}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ fontSize: '13px', fontWeight: 500, color: '#7096b8', display: 'block', marginBottom: '8px' }}>
          Confirm Password
        </label>
        <div style={{ position: 'relative' }}>
          <Lock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} size={16} color="#3d5a7a" />
          <input 
            type={showConfirmPassword ? 'text' : 'password'} 
            placeholder="••••••••"
            {...register('confirmPassword')}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
              padding: '12px 44px 12px 44px', color: '#e2f0ff', fontSize: '15px',
              outline: 'none', boxSizing: 'border-box'
            }}
          />
          <button 
            type="button"
            onClick={() => setShowConfirmPassword(p => !p)}
            style={{
              position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex'
            }}
          >
            {showConfirmPassword ? <EyeOff size={16} color="#3d5a7a" /> : <Eye size={16} color="#3d5a7a" />}
          </button>
        </div>
        {errors.confirmPassword && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '4px' }}>{errors.confirmPassword?.message as string}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        style={{
          width: '100%', height: '48px',
          background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
          border: 'none', borderRadius: '10px', color: 'white',
          fontSize: '15px', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          opacity: isLoading ? 0.7 : 1
        }}
      >
        {isLoading ? <LoadingSpinner size="sm" /> : "Reset Password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{
      position: 'relative', minHeight: '100vh', background: '#080c14',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', padding: '40px 20px'
    }}>
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

      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '420px' }}>
        
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}
        >
          <Zap size={24} color="#0ea5e9" />
          <span style={{ fontSize: '28px', fontWeight: 700, background: 'linear-gradient(135deg,#e2f0ff 0%,#38bdf8 40%,#2563eb 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>HireTrack</span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          style={{ fontSize: '32px', fontWeight: 700, color: '#e2f0ff', textAlign: 'center', marginBottom: '8px' }}
        >
          Reset Password
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          style={{ fontSize: '15px', color: '#7096b8', textAlign: 'center', marginBottom: '32px' }}
        >
          Enter your new password below
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}
          style={{
            background: 'rgba(13,20,33,0.85)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '20px',
            padding: '32px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
          }}
        >
          <Suspense fallback={<div style={{ textAlign: 'center' }}><LoadingSpinner /></div>}>
            <ResetPasswordForm />
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
}
