"use client";
import React, { ReactNode, } from "react";
import { cn } from "@/lib/utils";
import BottomMenu from "@/components/BottomMenu";
import { useRouter, useSearchParams } from "next/navigation";
import RootTab from "@/components/RootTab";
 
 
import { PREFERENCE_LINKS } from "@/constants/links";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import MobileNavigation from "./MobileNavigation";

export const MobileLayoutV2 = ({ children }: { children: ReactNode }) => {
    const foo = useSearchParams();
    const mailId = foo.get("id");
 
    const router = useRouter();
    return (
        <div className="flex flex-col w-screen min-h-svh">
            <div className={cn("flex flex-row items-center p-2",)}>
            </div>
            <main className="flex-1 flex flex-col overflow-hidden">
                <ScrollArea className="h-[calc(100vh-65px)] px-2">
                    <div className="glass-card rounded-2xl min-h-full my-2 overflow-hidden">
                        {children}
                    </div>
                </ScrollArea>
            </main>
            <footer className={cn("", mailId && "hidden")}>
                <MobileNavigation />
            </footer>
        </div>
    );
};