"use client"

import type React from "react"
import { useState } from "react"

import { cn } from "@/lib/utils"
import { encryptDataAction } from "@/lib/actions/crypto.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { ConfigForm } from "./config-form"
import { API } from "@/lib/api/handler"
import { LogoImage } from "@/components/logo-image"

import { useRouter } from "next/navigation"
import { useIndexDb } from "@/hooks/useIndexDb"
import { useMailStore } from "@/store/mails"

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
    const router = useRouter()
    const { toast } = useToast()
    const { idbInstance } = useIndexDb()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const { openConfigDialog, setOpenConfigDialog } = useMailStore()


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (isLoading) return
        if (!email || !password) {
            toast({
                title: "Error",
                description: "Please fill in all fields",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)

        try {
            // Make API call
            const { data } = await API.handleImapLogin({
                imap_username: email,
                imap_password: await encryptDataAction(password)
            })
            if (!data.success && data.message === "Not Authencticated") {
                return setOpenConfigDialog(true)
            }            
            if (!data.success) {
                throw new Error(data.message)
            }

            await idbInstance.bulkPutItems("mailboxes", data.result)

            toast({
                title: "Success",
                description: "You have been logged in successfully", duration: 2000
            })
            router.push("/u/mail/inbox")
        } catch (error: any) {
                console.log(error)
            toast({
                title: "Error",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={cn("flex w-full flex-col items-center gap-10", className)} {...props}>
            {/* Logo */}
            <div className="flex flex-col items-center gap-6">
                <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 blur-2xl scale-150" />
                    <div className="relative">
                        <LogoImage w={400} />
                    </div>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-[22px] font-semibold tracking-tight text-foreground">
                        Sign in to AirSend
                    </h1>
                    <p className="text-[13px] text-muted-foreground">
                        Access your mailbox securely
                    </p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
                <Input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    className="h-11 rounded-[10px] border-border/60 dark:border-white/[0.08] bg-background dark:bg-white/[0.04] px-4 text-[13px] text-foreground placeholder:text-muted-foreground/50 focus-visible:border-indigo-500/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors duration-200"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                />
                <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    className="h-11 rounded-[10px] border-border/60 dark:border-white/[0.08] bg-background dark:bg-white/[0.04] px-4 text-[13px] text-foreground placeholder:text-muted-foreground/50 focus-visible:border-indigo-500/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors duration-200"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                />
                <Button
                    type="submit"
                    className="mt-1 h-11 w-full rounded-[10px] bg-foreground text-[13px] font-medium text-background hover:bg-foreground/90 transition-all duration-200 disabled:opacity-40"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-background/20 border-t-background" />
                            Signing in...
                        </span>
                    ) : "Continue"}
                </Button>
            </form>

            <Dialog open={openConfigDialog} onOpenChange={setOpenConfigDialog}>
                <DialogContent
                    className="border-border/60 dark:border-white/[0.08] bg-background text-foreground rounded-2xl"
                    onEscapeKeyDown={(e) => e.preventDefault()}
                    onInteractOutside={(e) => e.preventDefault()}
                >
                    <ConfigForm />
                </DialogContent>
            </Dialog>
        </div>
    )
}
