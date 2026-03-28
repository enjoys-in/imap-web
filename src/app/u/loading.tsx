import { LogoImage } from '@/components/logo-image'
import React from 'react'

const loading = () => {
    return (
        <section className='h-screen w-full flex flex-col justify-center items-center bg-background gap-6'>
            <div className='flex items-center justify-center animate-float'>
                <div className="relative">
                    <LogoImage />
                    <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl animate-glow-pulse" />
                </div>
            </div>
            <div className="flex gap-1.5 items-center">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse-dot" />
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse-dot" style={{ animationDelay: "0.2s" }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse-dot" style={{ animationDelay: "0.4s" }} />
            </div>
        </section>
    )
}

export default loading
