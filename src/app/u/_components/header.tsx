"use client"

import { Separator } from "@/components/ui/separator"
import { SidebarInput, SidebarTrigger } from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Bell, Settings } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import BreadcrumbInfo from "./breadcrumb"

export function HeaderV2() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 sticky top-0 z-50 glass-subtle border-b border-border/50">
      <div className="flex items-center justify-between w-full px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1 rounded-xl hover:bg-primary/10 hover:text-primary smooth-transition" />
          <Separator orientation="vertical" className="mr-2 h-4 bg-border/50" />
          <BreadcrumbInfo />
        </div>
        <div className="flex items-center mx-auto w-1/2 max-w-lg">
          <div className="relative w-full">
            <SidebarInput
              placeholder="Search mails..."
              className="h-9 rounded-xl glass-input border-0 bg-secondary/40 pl-4 pr-4 text-sm placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary/30"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Notifications />
        </div>
      </div>
    </header>
  )
}

function Notifications() {
  return (
    <DropdownMenu>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-xl hover:bg-primary/10 smooth-transition"
              >
                <Bell className="size-5" />
                <span className="flex absolute top-0 end-0 size-3 -mt-1.5 -me-1.5">
                  <span className="animate-ping absolute inline-flex size-full rounded-full bg-red-400 opacity-75 dark:bg-red-600" />
                  <span className="relative inline-flex rounded-full size-3 bg-red-500" />
                </span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">Notifications</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent
        className="w-full rounded-2xl glass-card border-0 shadow-elevated-lg"
        align="end"
        forceMount
      >
        <div className="px-4 py-6 h-[500px]">
          <div className="mb-4 flex justify-between items-center border-b border-border/30 pb-3">
            <p className="text-lg font-semibold">Notifications</p>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl hover:bg-primary/10 hover:text-primary"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="h-full">
            <div className="w-96">
              <div
                className="flex flex-col items-center justify-center py-12 gap-3"
                tabIndex={0}
              >
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No notifications yet
                </p>
              </div>
            </div>
          </ScrollArea>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
