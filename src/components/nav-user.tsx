"use client";

import { ChevronsUpDown, LogOut } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { formatNameInParts } from "@/lib/utils";

import { useRouter } from "next/navigation";
import { useProfileStore } from "@/store/account";
import { API } from "@/lib/api/handler";
export function NavUser() {
  const { isMobile } = useSidebar();
  const { current_account, setCurrentAccount } = useProfileStore();

  const router = useRouter();

  const handleLogout = async () => {
    try {
      const { data } = await API.userLogout()
      if (data.success) {
        router.push("/");
        setCurrentAccount(null);
        return
      }
    } catch (error) {

    }
  };
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-primary/10 data-[state=open]:text-primary md:h-8 md:p-0 rounded-xl smooth-transition hover:bg-secondary/60"
            >
              <Avatar className="h-8 w-8 rounded-xl ring-2 ring-primary/10">
                <AvatarFallback className="rounded-xl bg-primary/10 text-primary text-xs font-semibold">
                    {current_account?.display_name && (formatNameInParts(current_account?.display_name))
                      || current_account?.email[0].toUpperCase()}
                  </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{current_account?.display_name || current_account?.email.split('@')[0]}</span>
                <span className="truncate text-xs text-muted-foreground">{current_account?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl glass-card border-0 shadow-elevated-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-3 px-3 py-3 text-left text-sm">
                <Avatar className="h-10 w-10 rounded-xl ring-2 ring-primary/10">
                  <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-semibold">
                    {current_account?.display_name && (formatNameInParts(current_account?.display_name))
                      || current_account?.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{current_account?.display_name || current_account?.email.split('@')[0]}</span>
                  <span className="truncate text-xs text-muted-foreground">{current_account?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/30" />
            <DropdownMenuItem onClick={handleLogout} className="rounded-lg mx-1 text-destructive focus:text-destructive focus:bg-destructive/10 smooth-transition">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
