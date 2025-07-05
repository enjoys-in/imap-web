import React, { Suspense } from 'react'
import { MailDisplaySkeleton } from './_components/mail-skeleton'
import serverAxios from '@/lib/api/serverAxios'

import { ApiResponse } from '@/lib/types';

import { MailDisplay } from './_components/DisplayMailBody';

const page = async ({ params }: any) => {
  const { folder, uid_message_id } = await params
  const [uid, message_id] = decodeURIComponent(uid_message_id).split('$')
  try {
    const { data } = await serverAxios.get<ApiResponse<string>>(`/api/v1/imap/fetch-email-body?folder=${folder}&uid=${uid}&message_id=${message_id}`)

    if (!data.success) {
      throw data.message
    }

    return (
      <Suspense fallback={<MailDisplaySkeleton />}>
        <MailDisplay folder={folder} uid={uid} message_id={message_id} result={data.result} />
      </Suspense>
    )
  } catch (error) {
    return <MailDisplaySkeleton />

  }
}


export default page