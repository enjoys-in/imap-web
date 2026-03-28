"use client"
import { buttonVariants } from "@/components/ui/button"
import { cn, } from "@/lib/utils"

import Link from "next/link"
import { Suspense, useCallback, useEffect, useState } from "react"

import Badge from "@/components/common/badges"
import { RefreshCcw } from "lucide-react"


import { sentenceCase } from 'change-case'
import { MailBoxIcon } from "./MailboxIcons"

import { API } from "@/lib/api/handler"
import { idbInstance } from "@/db"
import { useMailStore } from "@/store/mails"
import { usePathname } from "next/navigation"

export function ListFolders() {

    const pathname = usePathname()

    const [hoveredPath, setHoveredPath] = useState<string | null>(null);
    const { all_mailbox, selected_mailbox, setSelectedMailbox, setAllMailbox, setError } = useMailStore()


    const fetchMailboxData = useCallback(async (current_mailbox: string) => {
        try {
            const { data } = await API.syncSelectedFolder(current_mailbox)
            if (!data.success) {
                return setError(data.message)
            }
            await idbInstance.updateItem("mailboxes", current_mailbox, data.result)
            const currentMailboxes = useMailStore.getState().all_mailbox
            const index = currentMailboxes.findIndex(box => box.path === current_mailbox);
            if (index !== -1) {
                const updated = [...currentMailboxes]
                updated[index] = data.result
                setAllMailbox(updated)
            }
        } catch (error) {

        }
    }, [setAllMailbox, setError])
    // write func to fetch from index db and then api if not exist
    const fetchMailboxes = useCallback(async () => {
        try {
            const MailBoxes = await idbInstance.getAllItems("mailboxes")

            if (MailBoxes?.length === 0) {
                const { data } = await API.fetchMailboxes()
                if (!data.success) {
                    return setError(data.message)
                }
                await idbInstance.bulkPutItems("mailboxes", data.result)
                return setAllMailbox(data.result as any)
            }
            setAllMailbox(MailBoxes as any)
        } catch (error) {


        }
    }, [])

    useEffect(() => {
        if (all_mailbox.length === 0) {
            fetchMailboxes()
        }
    }, [])
    return all_mailbox.length > 0 ? (
        <Suspense fallback={<SkeletonMenuItem />}>
            {all_mailbox.map((folder) => {
                const isSelected = selected_mailbox === folder.path;
                const isHovered = hoveredPath === folder.path;
                const isActive = isSelected || pathname.toLocaleLowerCase().includes(folder.path.toLowerCase());

                return (
                    <div
                        key={folder.name}
                        className={cn(
                            "flex justify-between items-center px-3 py-1.5 group rounded-xl mx-1 mb-0.5 smooth-transition cursor-pointer",
                            isActive 
                              ? "bg-primary/10 text-primary shadow-sm" 
                              : "hover:bg-secondary/60 text-foreground"
                        )}
                        onMouseEnter={() => setHoveredPath(folder.path)}
                        onMouseLeave={() => setHoveredPath(null)}
                    >

                        <Link href={`/u/mail/${folder.path}`} className="flex items-center gap-2.5 flex-1" onClick={() => setSelectedMailbox(folder.path)}>
                            <MailBoxIcon name={folder.name} key={folder.specialUse} />
                            <span
                                className={cn(
                                    "text-sm truncate font-medium smooth-transition",
                                    isActive ? "text-primary font-semibold" : "text-foreground"
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
    ) : Array(6).fill(0).map((_, i) => <SkeletonMenuItem key={i} />)
}


function SkeletonMenuItem() {
    return (
        <div className="flex justify-between items-center px-3 py-2 mx-1 rounded-xl animate-pulse">
            <div className="flex items-center gap-2.5 w-3/4">
                <div className="w-5 h-5 bg-muted rounded-lg" />
                <div className="h-4 bg-muted rounded-lg w-3/5" />
            </div>
            <div className="flex items-center gap-2 w-1/4 justify-end">
                <div className="w-6 h-6 bg-primary/20 rounded-full" />
            </div>
        </div>
    )
}