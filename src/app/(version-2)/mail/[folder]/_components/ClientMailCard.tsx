"use client"
import React, { useEffect } from 'react'

import { useCacheStorage } from '@/hooks/useCacheStorage'
import { airsendDB } from '@/db'
import { useParams } from 'next/navigation'
import { useMailStore } from "@/store/mails"
import { ApiResponse } from '@/lib/types'
import { SingleEmailResponse } from '@/lib/types/interfaces/EmailResponse'
import { MailCard } from '@/app/(version-2)/_components/mail/MailCard'

const ClientMailCard = ({ data }: { data?: ApiResponse<SingleEmailResponse> }) => {
    const { folder } = useParams() as { folder: string[] }
    const { all_emails, setAllEmails } = useMailStore()
    const { addItem, getItem } = useCacheStorage()
    const key = `fetch-emails?folder=${folder}` as const

    const storeInDB = async () => {
        await addItem(key, data)
        try {
            await airsendDB.bulkAddItems("imap_mails", data?.result.emails as any)
        } catch (error) {
            // handle duplicate entries here
        }
    }
    const loadMailFromDB = async () => {
        const item = await getItem(key)

        if (item && item.success) {
            setAllEmails(item.result as SingleEmailResponse)
        }
    }
    useEffect(() => {
        if (data) {
            storeInDB()
        }
        loadMailFromDB()
    }, [])

    return (all_emails?.emails || []).length > 0 ? (all_emails?.emails || []).map((item, index) => (
        <MailCard key={index} item={item} />
    )) : (
        <div className='flex items-center justify-center h-full'>
            <h1 className='text-2xl text-gray-500'>{folder} is empty</h1>
        </div>
    )
}

export default ClientMailCard