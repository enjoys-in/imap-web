"use client"
import React from 'react'

import { cn } from '@/lib/utils'
import { useMailStore } from '@/store/mails';

export const MailList = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const { checkedItems } = useMailStore()
  return (
    <div className={cn("smooth-transition rounded-2xl overflow-hidden", checkedItems.length > 0 && "mt-8", className)}>
      {children}
    </div>
  )
}
