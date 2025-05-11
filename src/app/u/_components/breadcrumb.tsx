"use client"
import React, { Fragment } from 'react'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,

} from "@/components/ui/breadcrumb"
import { useSettingsStore } from '@/store/settings'
import { usePathname } from 'next/navigation'
import { useMailStore } from '@/store/mails'
import { capitalCase } from 'change-case'
import { SyncButton } from './syncButton'
const BreadcrumbInfo = () => {
    const { selected_mailbox } = useMailStore()
    const {activeItem}= useSettingsStore()
    const pathname = usePathname()
    return (
        <Fragment>
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    {pathname === "/v2/u/mail" && <>
                        <BreadcrumbLink href="/v2/u/mail">Mail</BreadcrumbLink>
                        <BreadcrumbSeparator />
                        <BreadcrumbPage>{capitalCase(selected_mailbox || "Inbox")}</BreadcrumbPage>
                    </>}
                    {pathname === "/v2/u/settings" && <>
                        <BreadcrumbLink href="/v2/u/mail">Settings</BreadcrumbLink>
                        <BreadcrumbSeparator />
                        <BreadcrumbPage>{activeItem}</BreadcrumbPage>
                    </>}
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
        {pathname === "/v2/u/mail" && <SyncButton />}
    </Fragment>
    )
}

export default BreadcrumbInfo