'use client';

import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 160px)',
        gap: '16px',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          background: 'rgba(14,165,233,0.08)',
          border: '1px solid rgba(14,165,233,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <BarChart3 size={28} style={{ color: '#0ea5e9' }} />
      </div>
      <div
        style={{
          color: '#e2f0ff',
          fontSize: '24px',
          fontWeight: 600,
        }}
      >
        Analytics
      </div>
      <div
        style={{
          color: '#4a6080',
          fontSize: '14px',
        }}
      >
        Coming Soon
      </div>
    </motion.div>
  );
}
