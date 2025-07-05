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
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-8 md:p-0"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">
                    {current_account?.display_name && (formatNameInParts(current_account?.display_name))
                      || current_account?.email[0].toUpperCase()}
                  </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{current_account?.display_name || current_account?.email.split('@')[0]}</span>
                <span className="truncate text-xs">{current_account?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">

                  <AvatarFallback className="rounded-lg">
                    {current_account?.display_name && (formatNameInParts(current_account?.display_name))
                      || current_account?.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{current_account?.display_name || current_account?.email.split('@')[0]}</span>
                  <span className="truncate text-xs">{current_account?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
