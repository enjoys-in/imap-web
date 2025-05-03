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
    <Sidebar collapsible="none" className="hidden flex-1 md:flex ">
      <SidebarHeader className="gap-2 border-b my-1 p-0">
        <AccountSwitcherV2 />
        <Separator />
        <SidbarTabs />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-4">
          <SidebarGroupContent>
            {/* <SidebarCollections text="Folder" />
            <Separator />
            <SidebarCollections text="Lables" /> */}
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="flex flex-row items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span className="text-sm font-medium">New</span>
          </div>
        </div>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <QuotaComponent />
        <Separator />
        {/* <ShowMeetings /> */}
      </SidebarFooter>
    </Sidebar>
  )
}


