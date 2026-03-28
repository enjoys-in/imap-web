"use client"
import React, { useCallback } from 'react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Star, Trash2, Archive, Flag, MoreVertical } from "lucide-react";
import { Badge } from '@/components/ui/badge';

import { cn, dateToFromNowDaily, formattedName } from '@/lib/utils';
import { encryptDataAction } from '@/lib/actions/crypto.actions';
import { useMailStore } from "@/store/mails"

import { RiAttachment2 } from '@remixicon/react';

import { useParams, useRouter } from 'next/navigation';
import { EmailContextMenu } from './EmailContextMenu';
import { EmailOnly } from '@/lib/types/interfaces/EmailResponse';

export const MailCard = ({ item }: { item: EmailOnly }) => {
    const router = useRouter()
    const params = useParams()

    const [hovered, setHovered] = React.useState(false);
    const { checkedItems, setCheckedItems } = useMailStore()

    const handleCheckChange = useCallback(
        (id: number, isChecked: boolean) => {
            if (isChecked) {
                setCheckedItems([...checkedItems, id])
            } else {
                setCheckedItems(checkedItems.filter((itemId) => itemId !== id))
            }
        },
        [checkedItems]
    )
    const anyChecked = checkedItems.length > 0;
    const handleClick = async () => {
        setCheckedItems([])
        const encryptedId = await encryptDataAction(item.message_id)
        router.push(`${params?.folder}/${item.uid}$${encryptedId}`)
    }
    const handleHoveredIconClick = (action: string) => {
        console.log(action)
    }
    return (
        <EmailContextMenu>
            <div
                onClick={handleClick}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className={cn(
                    "group gpu-accelerate cursor-pointer rounded-xl mx-1 mb-0.5 smooth-transition border border-transparent",
                    "hover:bg-secondary/60 hover:border-border/40 hover:shadow-elevated",
                    checkedItems.includes(item.uid) && "bg-primary/5 border-primary/20"
                )}>

                <div className="flex justify-between items-center py-2.5 px-3">
                    <div className="flex items-center flex-1 min-w-0">
                        {/* Checkbox */}
                        <div className={cn("mr-2 smooth-transition", (hovered || anyChecked) ? "opacity-100 w-5" : "opacity-0 w-0 overflow-hidden")}>
                            <Checkbox
                                className="rounded-md border-border/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary smooth-transition"
                                checked={checkedItems.includes(item.uid)}
                                onClick={(e) => e.stopPropagation()}
                                onCheckedChange={(isChecked) => handleCheckChange(item.uid, !!isChecked)}
                            />
                        </div>
                        
                        {/* Avatar */}
                        <div className="relative mr-3 shrink-0">
                            <Avatar className="h-9 w-9 ring-2 ring-primary/10 smooth-transition group-hover:ring-primary/20">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{formattedName(item.from)}</AvatarFallback>
                            </Avatar>
                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-background" />
                        </div>
                        
                        {/* Content */}
                        <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm truncate">{item.from}</span>
                                {item?.attachments && item?.attachments.length > 0 && (
                                    <span className="shrink-0 text-muted-foreground">
                                        <RiAttachment2 className="w-3.5 h-3.5" />
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="text-sm font-medium truncate">{item.subject}</span>
                                <span className="text-xs text-muted-foreground/70 truncate hidden lg:inline">&mdash; Mail content preview</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Right side: hover actions or date */}
                    <div className="flex items-center ml-3 shrink-0">
                        <div className="relative min-h-[36px] flex items-center">
                            {hovered ? (
                                <div className="flex gap-1 animate-scale-in">
                                    <button className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-yellow-500/10 hover:text-yellow-500 smooth-transition" onClick={(e) => { e.stopPropagation(); handleHoveredIconClick("starred"); }}>
                                        <Star size={15} />
                                    </button>
                                    <button className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-blue-500/10 hover:text-blue-500 smooth-transition">
                                        <Flag size={15} />
                                    </button>
                                    <button className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-emerald-500/10 hover:text-emerald-500 smooth-transition">
                                        <Archive size={15} />
                                    </button>
                                    <button className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-destructive/10 hover:text-destructive smooth-transition">
                                        <Trash2 size={15} />
                                    </button>
                                    <button className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-muted smooth-transition">
                                        <MoreVertical size={15} />
                                    </button>
                                </div>
                            ) : (
                                <span className="text-xs text-muted-foreground tabular-nums">{dateToFromNowDaily(new Date(item.date))}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </EmailContextMenu>
    )
}

