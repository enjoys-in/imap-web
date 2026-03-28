"use client"

import { ChevronRight, Receipt, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import Link from "next/link"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    enabled: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const path = usePathname()
  return (
    <SidebarGroup className="px-2">
      <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60 mb-1">Main</SidebarGroupLabel>
      <SidebarMenu className="space-y-0.5">
        {items.map((item) => item.enabled && (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <Link className="flex items-center justify-center gap-2" href={item.url}>
                  <SidebarMenuButton tooltip={item.title} className={cn(
                    "rounded-xl smooth-transition",
                    path.includes(item.url) 
                      ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15" 
                      : "hover:bg-secondary/60"
                  )}>
                    {item?.icon && <item.icon className={cn("h-4 w-4", path.includes(item.url) && "text-primary")} />}
                    <span>{item.title}</span>
                    {item.items && item.items?.length > 0 && <ChevronRight className="ml-auto transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90" />}
                  </SidebarMenuButton>
                </Link>
              </CollapsibleTrigger>
              {item.items && item.items?.length > 0 && <CollapsibleContent className="mt-1">
                <SidebarMenuSub className="border-l-2 border-primary/10 ml-4">
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild className="rounded-lg hover:bg-secondary/60 smooth-transition">
                        <Link href={subItem.url}>
                          <span>{subItem.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
