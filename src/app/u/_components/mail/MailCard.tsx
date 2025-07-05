"use client"
import React, { useCallback, useEffect } from 'react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Star, Trash2, Archive, Flag, MoreVertical } from "lucide-react";
import { Badge } from '@/components/ui/badge';

import { cn, dateToFromNowDaily, encryptData, formattedName } from '@/lib/utils';
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
    const handleClick = () => {
        setCheckedItems([])
        router.push(`${params?.folder}/${item.uid}$${encryptData(item.message_id)}`,)
    }
    const handleHoveredIconClick = (action: string) => {
        console.log(action)
    }
    useEffect(() => { }, [checkedItems])

    return (
        <EmailContextMenu>
            <div
                onClick={handleClick}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className={cn("bg-neutral-200 dark:bg-neutral-900  duration-300 ease-in-out border cursor-pointer hover:bg-neutral-300 dark:hover:bg-neutral-800 rounded-none shadow-sm hover:shadow-lg transition-all",)}>

                <div className="flex justify-between items-center py-0 px-2">
                    <div>
                        <div className="flex items-center">
                            {(hovered || anyChecked) && (
                                <Checkbox
                                    className="mr-3 rounded-none transition-all duration-300 ease-in-out "
                                    checked={checkedItems.includes(item.uid)}
                                    onClick={(e) => e.stopPropagation()}
                                    onCheckedChange={(isChecked) => handleCheckChange(item.uid, !!isChecked)}
                                />
                            )}
                            <div className="relative mx-3 z-0">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-green-500 text-sm">{formattedName(item.from)}</AvatarFallback>
                                </Avatar>
                            </div>
                            <div className='flex items-center'>
                                <span className="font-medium flex items-center  justify-center">
                                    <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                                    {item.from}
                                </span>
                                <span className="text-gray-500 ml-1">(4)</span>
                                {/* <span className="ml-1  bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center  justify-center">
                                     
                                    </span> */}
                            </div>
                            <div className="flex items-center gap-2 w-full overflow-hidden text-sm ml-4">

                                <span className="font-medium truncate">
                                    {item.subject}
                                </span>


                                <span className="text-sm text-gray-500 truncate max-w-[30rem]">
                                    Mail ShortContent goes here
                                </span>
                            </div>
                            <div>
                                {
                                    item?.attachments && item?.attachments.length === 0 && (
                                        <div className="flex items-center ml-2">
                                            {item.attachments.length < 3 ?
                                                item.attachments.map((attachment, index) => (
                                                    <Badge key={index} className="ml-1 items-center text-gray-500 text-xs border border-gray-200 rounded-full px-2 py-0.5">
                                                        <span className="mr-1 text-xs"><RiAttachment2 /></span>
                                                        <span>{attachment.name}</span>
                                                    </Badge>
                                                ))
                                                :
                                                <Badge className=" ml-4  items-center text-gray-500 text-xs border border-gray-200 rounded-full px-2 py-0.5">
                                                    <span className="mr-1 text-xs "><RiAttachment2 className='w-4 h-4' /></span>
                                                    <span>{item.attachments.length}</span>
                                                </Badge>
                                            }
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="flex items text-sm text-gray-500">
                            <div className="relative min-h-[48px] flex flex-col justify-center w-full">
                                <div className={`transition-all duration-300 ease-in-out flex items-center self-end pt-0`}>
                                    {hovered ?
                                        <div
                                            className={`flex gap-2.5 transition-opacity duration-300 ease-in-out ${hovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                                            <button className="hover:text-yellow-500 transition-colors duration-200" onClick={(e) => {
                                                e.stopPropagation();
                                                handleHoveredIconClick("starred");
                                            }}>
                                                <Star size={16} />
                                            </button>
                                            <button className="hover:text-blue-500 transition-colors duration-200">
                                                <Flag size={16} />
                                            </button>
                                            <button className="hover:text-green-500 transition-colors duration-200">
                                                <Archive size={16} />
                                            </button>
                                            <button className="hover:text-red-500 transition-colors duration-200">
                                                <Trash2 size={16} />
                                            </button>
                                            <button className="hover:text-cyan-500 transition-colors duration-200">
                                                <MoreVertical size={16} />
                                            </button>
                                        </div>
                                        :
                                        <>
                                            <div className="flex items-center gap-2">


                                                <Badge className="flex items-center text-gray-500 text-xs border border-gray-200 rounded-full px-2 py-0.5">
                                                    <span className="mr-1">📨</span>
                                                    <span>inbox</span>
                                                </Badge>
                                            </div>
                                            <span className='ml-2'>{dateToFromNowDaily(new Date(item.date))}</span>
                                        </>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </EmailContextMenu>
    )
}

