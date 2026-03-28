"use client";

import * as React from "react";
import { Calendar, Inbox } from "lucide-react";

import { NavUser } from "@/components/nav-user";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";

import { FavIcon } from "@/components/logo-image";
import Link from "next/link";
import { Mailboxes } from "./mail/mailboxes";

import SidebarCalendar from "../calender/_components/sidebar-calendar";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// This is sample data
const navMain = [
    {
        title: "Mailbox",
        url: "/u/mail",
        icon: Inbox,
        isActive: true,
    },
    {
        title: "Calendar",
        url: "calender",
        icon: Calendar,
        isActive: false,
    },
];
export default function AppSidebarV2({
    ...props
}: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname();
    return (
        <Sidebar
            collapsible="icon"
            className="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row glass-sidebar"
            {...props}
        >
            <Sidebar
                collapsible="none"
                className="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r border-border/30"
            >
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                                <Link href="#">
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-xl bg-primary/10 text-primary smooth-transition hover:bg-primary/20 hover:scale-105">
                                        <FavIcon />
                                    </div>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                    <SidebarMenu>
                        {navMain.map((item) => (
                            <Link key={item.title} href={item.url}>
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        tooltip={{
                                            children: item.title,
                                            hidden: false,
                                        }}
                                        className={cn(
                                            "px-2.5 md:px-2 rounded-xl smooth-transition",
                                            pathname.includes(item.url) && "bg-primary/10 text-primary hover:bg-primary/15"
                                        )}
                                    >
                                        <item.icon className={cn(pathname.includes(item.url) && "text-primary")} />
                                        <span>{item.title}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </Link>
                        ))}
                    </SidebarMenu>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent className="px-1.5 md:px-0"></SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarRail />
                <SidebarFooter>
                    <NavUser />
                </SidebarFooter>
            </Sidebar>
            {pathname.includes("/mail") && <Mailboxes />}
            {pathname === "/calender" && <SidebarCalendar />}
        </Sidebar>
    );
}
