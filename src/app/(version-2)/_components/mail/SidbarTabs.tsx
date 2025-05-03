"use client"
import React from 'react'
import { ListFolders } from './ListFolders'
import RootTab from '@/components/RootTab'
 
import { cn } from '@/lib/utils'
import { useTabStore } from '@/store/layout'

const SidbarTabs = () => {
    const {activeTab} = useTabStore()

    return (
        <div>
            <div className="hidden md:block">
                <RootTab<"Mailbox" | "Settings">
                    leftLabel="Mailbox"
                    rightLabel="Settings"
                />
            </div>
            <div className="group flex flex-col gap-1 py-2">
                {activeTab === "Mailbox" && <ListFolders />}
                {
                    activeTab === "Settings" && <div
                        className={cn(
                            "w-full  transition-transform duration-500 ease-in-out translate-x-0",

                        )}
                    >

                        <div className="p-6 w-full h-full">
                            <h2 className="text-xl font-semibold">Settingss</h2>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">Here are your preferences.</p>
                        </div>
                    </div>
                }

            </div>
        </div>
    )
}

export default SidbarTabs