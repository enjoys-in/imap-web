"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
    RotateCcw,
    User,
    Globe,
    Paintbrush,
    Shield,
    Import,
    MessageSquare,
    Lock,
    UserCircle,
    Folder,
    Filter,
    Forward,
    Globe2,
    Key,
    Server,
    Bell,
} from "lucide-react"
import { useSettingsStore } from "@/store/settings"
import { EnvelopeOpenIcon } from "@radix-ui/react-icons"

const accountItems = [
    { icon: <User size={18} />, label: "Account and password" },
   // { icon: <Globe size={18} />, label: "Language and time" },
    { icon: <Paintbrush size={18} />, label: "Appearance" },
    { icon: <Bell size={18} />, label: "Notifications" },

    // { icon: <Shield size={18} />, label: "Security and privacy" },
    { icon: <Import size={18} />, label: "Import via Easy Switch" },
    // { icon: <RotateCcw size={18} />, label: "Recovery", notification: true },
]

const mailItems = [
    { icon: <Filter size={18} />, label: "Filters" },
    { icon: <Server size={18} />, label: "IMAP/SMTP" },
    { icon: <EnvelopeOpenIcon height={18} width={18}   />, label: "Email Config" }, 
    { icon: <Lock size={18} />, label: "Email privacy" },
    { icon: <Key size={18} />, label: "Encryption and keys" },
    { icon: <Folder size={18} />, label: "Folders and labels" },
    { icon: <Forward size={18} />, label: "Forward and auto-reply" },
    { icon: <UserCircle size={18} />, label: "Identity and addresses" },
    { icon: <MessageSquare size={18} />, label: "Messages and composing" },
]

export const SettingsMenu = () => {
    const { activeItem, setActiveItem } = useSettingsStore()

    useEffect(() => {
        const updateTabFromHash = () => {
            const hash = decodeURIComponent(window.location.hash.replace("#", ""))
            if (hash) {
                // setActiveItem(hash)
            }
        }

        updateTabFromHash()
        window.addEventListener("hashchange", updateTabFromHash)
        return () => window.removeEventListener("hashchange", updateTabFromHash)
    }, [])
    useEffect(() => {
        if (activeItem) {
            window.location.hash = encodeURIComponent(activeItem.toLocaleLowerCase().replaceAll(" ", "-"))
        }
    }, [activeItem])
    return (
        <div className="flex flex-col">
            <div className="p-4">
                <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60 mb-3">Account</h2>
                <nav className="space-y-0.5">
                    {accountItems.map((item) => (
                        <button
                            key={item.label}
                            className={cn(
                                "flex items-center w-full px-3 py-2.5 text-sm rounded-xl smooth-transition",
                                activeItem === item.label 
                                    ? "bg-primary/10 text-primary font-medium" 
                                    : "hover:bg-secondary/60 text-foreground"
                            )}
                            onClick={() => setActiveItem(item.label)}
                        >
                            <span className={cn("mr-3", activeItem === item.label ? "text-primary" : "text-muted-foreground")}>{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            <div className="p-4 pt-2">
                <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60 mb-3">Airsend Mail</h2>
                <nav className="space-y-0.5">
                    {mailItems.map((item) => (
                        <button
                            key={item.label}
                            className={cn(
                                "flex items-center w-full px-3 py-2.5 text-sm rounded-xl smooth-transition",
                                activeItem === item.label 
                                    ? "bg-primary/10 text-primary font-medium" 
                                    : "hover:bg-secondary/60 text-foreground"
                            )}
                            onClick={() => setActiveItem(item.label)}
                        >
                            <span className={cn("mr-3", activeItem === item.label ? "text-primary" : "text-muted-foreground")}>{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    )
}
