"use client"
import React, { useEffect } from 'react'


import { airsendDB } from '@/db'
import { useParams } from 'next/navigation'
import { useMailStore } from "@/store/mails"
import { ApiResponse } from '@/lib/types'
import { SingleEmailResponse } from '@/lib/types/interfaces/EmailResponse'
import { MailCard } from '@/app/u/_components/mail/MailCard'

const ClientMailCard = ({ data }: { data?: ApiResponse<SingleEmailResponse> }) => {
    const { folder } = useParams() as { folder: string[] }
    const { all_emails, setAllEmails } = useMailStore()


    const storeInDB = async () => {

        try {
          await airsendDB.bulkPutItems("imap_mails", data?.result.emails as any)
          setAllEmails(data?.result as any)
        } catch (error) {

        }
    }

    useEffect(() => {
        if (data) {
            storeInDB()
        }

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