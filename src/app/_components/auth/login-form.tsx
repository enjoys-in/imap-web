"use client"

import type React from "react"
import { useState } from "react"

import { cn, encryptData } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
                imap_password: encryptData(password)
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
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center gap-2">
                        <h1 className="text-xl font-bold dark:text-gray-50">Welcome to</h1>
                        <div className="flex  items-center justify-center rounded-md">
                            <LogoImage />
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                value={email}
                                className="rounded-none"

                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                className="rounded-none"
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full rounded-none" disabled={isLoading}>
                            {isLoading ? "Logging in..." : "Login"}
                        </Button>
                    </div>
                </div>
            </form>
            <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
                By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </div>

            <Dialog open={openConfigDialog} onOpenChange={setOpenConfigDialog}>
                <DialogContent
                    onEscapeKeyDown={(e) => e.preventDefault()}
                    onInteractOutside={(e) => e.preventDefault()}
                >
                    <ConfigForm />
                </DialogContent>
            </Dialog>
        </div>
    )
}
