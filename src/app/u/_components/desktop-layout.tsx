import * as React from "react"

import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import AppSidebarV2 from "./sidebar"
import { SidebarRightV2 } from "./sidebar-right"
import { HeaderV2 } from "./header";




export default function DesktopLayoutV2({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "340px",
                } as React.CSSProperties
            }
        >
            <AppSidebarV2 />
            <SidebarInset className="overflow-hidden">
                <HeaderV2 />
                <div className="flex-1 overflow-y-auto p-3">
                    <div className="glass-card rounded-2xl min-h-full animate-scale-in">
                        {children}
                    </div>
                </div>
            </SidebarInset>
            <SidebarRightV2 />
        </SidebarProvider>
    )
}




