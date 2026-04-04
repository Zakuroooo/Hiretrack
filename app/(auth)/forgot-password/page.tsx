'use client'

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, Mail, Check } from 'lucide-react';
import axios from '@/lib/axios';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';

const forgotSchema = z.object({
  email: z.string().email('Invalid email')
});

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, getValues } = useForm({
    resolver: zodResolver(forgotSchema)
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await axios.post('/auth/forgot-password', { email: data.email });
      setSuccess(true);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

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
          Forgot Password
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          style={{ fontSize: '15px', color: '#7096b8', textAlign: 'center', marginBottom: '32px' }}
        >
          Enter your email and we'll send you a reset link
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
          {success ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(34,197,94,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                border: '1px solid rgba(34,197,94,0.2)'
              }}>
                <Check size={28} color="#22c55e" />
              </div>
              <h3 style={{ color: '#e2f0ff', fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Check your email!</h3>
              <p style={{ color: '#7096b8', fontSize: '14px', marginBottom: '24px' }}>
                We sent a reset link to <strong style={{ color: '#e2f0ff' }}>{getValues().email}</strong>
              </p>
              <p style={{ color: '#4a6080', fontSize: '13px', marginBottom: '24px' }}>
                Didn't receive it? Check spam or try again
              </p>
              <Link href="/login" style={{ color: '#38bdf8', fontSize: '14px', textDecoration: 'none', fontWeight: 500 }}>
                ← Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
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
                  />
                </div>
                {errors.email && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '4px' }}>{errors.email?.message as string}</p>}
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
              >
                {isLoading ? <LoadingSpinner size="sm" /> : "Send Reset Link"}
              </button>

              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <Link href="/login" style={{ color: '#7096b8', fontSize: '14px', textDecoration: 'none' }}>
                  ← Back to login
                </Link>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
