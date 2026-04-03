'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#080c14] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="z-10 text-center flex flex-col items-center">
        <h1 
          style={{ fontSize: 'clamp(80px, 15vw, 160px)' }}
          className="font-extrabold leading-none bg-gradient-to-br from-[#e2f0ff] via-[#38bdf8] to-[#2563eb] text-transparent bg-clip-text"
        >
          404
        </h1>
        <h2 className="text-[20px] text-[#7096b8] mt-2 font-medium">Page not found</h2>
        <p className="text-[14px] text-[#3d5a7a] mt-2">The page you're looking for doesn't exist</p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Link 
            href="/dashboard"
            className="bg-gradient-to-r from-[#0ea5e9] to-[#2563eb] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Go to Dashboard
          </Link>
          <Link 
            href="/"
            className="bg-white/5 border border-white/10 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>

      {[...Array(6)].map((_, i) => (
        <div 
          key={i}
          className="absolute rounded-full bg-sky-500/30"
          style={{
            width: `${Math.random() * 4 + 4}px`,
            height: `${Math.random() * 4 + 4}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite alternate`,
            animationDelay: `${Math.random() * 5}s`
          }}
        />
      ))}

      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0) translateX(0); }
          100% { transform: translateY(-100px) translateX(50px); }
        }
      `}</style>
    </div>
  )
}
