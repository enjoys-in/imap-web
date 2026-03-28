"use client"
import React from 'react'
import { LoginForm } from './_components/auth/login-form'
import { StarField } from "@/components/magicui/star-field"

const page = () => {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-gray-50 dark:bg-[#08090a]">
      {/* Deep radial gradient base */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,rgba(99,102,241,0.08),transparent)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,rgba(99,102,241,0.12),transparent)]" />

      {/* Soft orbiting gradient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-indigo-500/[0.05] dark:bg-indigo-600/[0.07] blur-[120px] animate-morph" />
        <div className="absolute bottom-0 right-0 h-80 w-96 rounded-full bg-violet-400/[0.04] dark:bg-violet-600/[0.05] blur-[100px] animate-float" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-cyan-400/[0.03] dark:bg-cyan-500/[0.04] blur-[80px] animate-float" style={{ animationDelay: "-5s" }} />
      </div>

      {/* Star field (dark mode only) */}
      <div className="hidden dark:block">
        <StarField count={100} />
      </div>

      {/* Subtle noise overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.015] dark:opacity-[0.025]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />

      {/* Content */}
      <div className="relative z-10 flex flex-1 w-full max-w-sm flex-col items-center justify-center px-6">
        <LoginForm />
      </div>

      {/* Footer */}
      <div className="relative z-10 pb-8 pt-12 flex items-center gap-4 text-[11px] text-foreground/25">
        <a href="#" className="hover:text-foreground/50 transition-colors">Terms</a>
        <span>·</span>
        <a href="#" className="hover:text-foreground/50 transition-colors">Privacy</a>
      </div>
    </div>
  )
}

export default page