
import * as React from "react"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,

} from "@/components/ui/sidebar"
import Image from "next/image"
import Link from "next/link"

export function SideBarToggleButton() {

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
         <Link href={"/h-panel"}>
         <Image className="logo hidden dark:block" src="/navbar-logo.png" alt="logo" width={512} height={512} />
         <Image className="logo dark:hidden" src="/navbar-logo-light.png" alt="logo" width={512} height={512} />
         </Link>
          {/* <div className="data-[state=close]:hidden flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
           A
          </div> */}
       
          {/* <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">
              AirSend
            </span>
            <span className="truncate text-xs">Powered By Enjoys</span>
          </div> */}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
