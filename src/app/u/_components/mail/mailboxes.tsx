import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
} from "@/components/ui/sidebar"

import SidebarCollections from "./SidebarCollections"


import QuotaComponent from "./QuotaComponent"
import ShowMeetings from "./ShowMeetings"
import { AccountSwitcherV2 } from "./AccountSwitcher"

import { Plus } from "lucide-react"

import SidbarTabs from "./SidbarTabs"

export function Mailboxes() {

  return (
    <Sidebar collapsible="none" className="hidden flex-1 md:flex glass-subtle border-r-0">
      <SidebarHeader className="gap-2 border-b border-border/30 my-1 p-0">
        <AccountSwitcherV2 />
        <Separator className="bg-border/30" />
        <SidbarTabs />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-3">
          <SidebarGroupContent>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="flex flex-row items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2 text-muted-foreground hover:text-primary cursor-pointer smooth-transition rounded-xl px-2 py-1.5 hover:bg-primary/10">
            <Plus className="h-4 w-4" />
            <span className="text-sm font-medium">New folder</span>
          </div>
        </div>
      </SidebarContent>
      <SidebarFooter className="border-t border-border/30 p-3">
        <QuotaComponent />
        <Separator className="bg-border/30" />
      </SidebarFooter>
    </Sidebar>
  )
}


