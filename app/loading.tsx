'use client'

import { Zap } from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#080c14] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="z-10 text-center flex flex-col items-center">
        <Zap size={32} className="text-[#0ea5e9] animate-pulse mb-3" />
        <h1 className="text-[20px] font-bold bg-gradient-to-br from-[#e2f0ff] via-[#38bdf8] to-[#2563eb] text-transparent bg-clip-text mb-6">
          HireTrack
        </h1>
        <LoadingSpinner size="md" />
      </div>
    </div>
  )
}
