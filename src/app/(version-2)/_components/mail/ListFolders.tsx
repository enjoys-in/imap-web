"use client"
import { buttonVariants } from "@/components/ui/button"
import { cn, } from "@/lib/utils"

import Link from "next/link"
import { Suspense, useCallback, useEffect, useState } from "react"

import Badge from "@/components/common/badges"
import { RefreshCcw } from "lucide-react"


import { sentenceCase } from 'change-case'
import { MailBoxIcon } from "./MailboxIcons"
import { useCacheStorage } from "@/hooks/useCacheStorage"
import { API } from "@/lib/api/handler"
import { airsendDB } from "@/db"
import { useMailStore } from "@/store/mails"
import { usePathname } from "next/navigation"

export function ListFolders() {

    const pathname = usePathname()
    const { getItem, addItem } = useCacheStorage()
    const [hoveredPath, setHoveredPath] = useState<string | null>(null);
    const { all_mailbox, selected_mailbox, setSelectedMailbox, setAllMailbox, setError } = useMailStore()


    const fetchMailboxData = useCallback(async (current_mailbox: string) => {
        try {
            // sync with db as well
            const { data } = await API.syncSelectedFolder(current_mailbox)
            if (!data.success) {
                return setError(data.message)
            }
            await addItem(`fetch-mailbox?folder=${current_mailbox}`, data)
            await airsendDB.updateItem("mailboxes", current_mailbox, data.result)
            const index = all_mailbox.findIndex(box => box.path === current_mailbox);
            if (index !== -1) {
                all_mailbox[index] = data.result
                setAllMailbox(all_mailbox)
            }
        } catch (error) {

        }
    }, [])
    // write func to fetch from index db and cache storage and then api if not exist

    const fetchMailboxes = useCallback(async () => {
        try {
            const MailBoxes = await airsendDB.getAllItems("mailboxes")

            if (MailBoxes?.length === 0) {
                const item = await getItem("fetch-mailboxes" as const)

                if (item && item.success) {
                    setAllMailbox(item.result as any)
                    return await airsendDB.bulkAddItems("mailboxes", item.result as any)
                }

                const { data } = await API.fetchMailboxes()
                if (!data.success) {
                    return setError(data.message)
                }
                await addItem("fetch-mailboxes", data)
                await airsendDB.bulkAddItems("mailboxes", data.result)
                return setAllMailbox(data.result as any)

            }
            setAllMailbox(MailBoxes)
        } catch (error) {


        }
    }, [])

    useEffect(() => {
        if (all_mailbox.length === 0) {
            fetchMailboxes()
        }
    }, [])
    return (
        <Suspense fallback={<SkeletonMenuItem />}>
            {all_mailbox.map((folder) => {
                const isSelected = selected_mailbox === folder.path;
                const isHovered = hoveredPath === folder.path;

                return (
                    <div
                        key={folder.name}
                        className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            "flex justify-between items-center px-2 border-none  group rounded-none",
                            (isSelected || pathname.toLocaleLowerCase().includes(folder.path.toLowerCase())) ? "dark:bg-[#5a62ff4d]" : "bg-neutral-800"
                        )}
                        onMouseEnter={() => setHoveredPath(folder.path)}
                        onMouseLeave={() => setHoveredPath(null)}
                    >

                        <Link href={`${folder.path}`} className="flex items-center gap-2" onClick={() => setSelectedMailbox(folder.path)}>
                            <MailBoxIcon name={folder.name} key={folder.specialUse} />
                            <span
                                className={cn(
                                    "text-sm truncate hover:text-[#5a61ff] font-bold",
                                    isSelected ? "dark:text-[#5a61ff] font-bold" : "dark:text-zinc-300"
                                )}
                            >
                                {sentenceCase(folder.name)}
                            </span>
                        </Link>

                        <div className="flex items-center gap-2">
                            {isHovered && (
                                <span
                                    className="pointer-events-auto text-muted-foreground text-xs w-6 h-6 flex items-center justify-center rounded-full cursor-pointer hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        fetchMailboxData(folder.path);
                                    }}
                                >
                                    <RefreshCcw size={14} />
                                </span>
                            )}
                            <Badge text={String(folder.unseen_count)} variant="blue" className="w-6 h-6 flex items-center justify-center text-xs" />
                        </div>
                    </div>
                );
            })}
        </Suspense>
    );
}

function SkeletonMenuItem() {
    return (
        <div className={`flex items-center justify-between p-2 rounded  "bg-gray-800"`}>
            <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-gray-700 rounded animate-pulse" />
                <div className="w-16 h-4 bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="w-4 h-4 bg-gray-700 rounded-full animate-pulse" />
        </div>
    )
}