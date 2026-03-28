"use client";

import * as React from "react";
import {
  AudioWaveform,
  ChevronsUpDown,
  Command,
  GalleryVerticalEnd,
  Plus,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { FavIcon } from "@/components/logo-image";
import { useProfileStore } from "@/store/account";
import { Skeleton } from "@/components/ui/skeleton";
const teams = [
  {
    name: "Airsend",
    logo: GalleryVerticalEnd,
    plan: "Enterprise",
  },
];

export function AccountSwitcherV2() {
  const { isMobile } = useSidebar();
  const [activeTeam, setActiveTeam] = React.useState(teams[0]);
  const { current_account } = useProfileStore();

  if (!activeTeam) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-primary/5 data-[state=open]:text-primary rounded-xl smooth-transition hover:bg-secondary/50"
        >
          <div className="flex w-full items-center justify-between py-2 px-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center ring-2 ring-primary/10">
                <FavIcon w={24} />
              </div>
              <div className="flex flex-col">
                {current_account ? (
                  <>
                    <span className="text-sm font-semibold text-foreground">
                      {current_account?.display_name ||
                        current_account?.email.split("@")[0]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {current_account?.email}
                    </span>
                  </>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <div className="h-4 w-36 bg-muted rounded-lg animate-pulse" />
                    <div className="h-3 w-48 bg-muted rounded-lg animate-pulse" />
                  </div>
                )}
              </div>

            </div>
          </div>
          <ChevronsUpDown className="ml-auto text-muted-foreground" />
        </SidebarMenuButton>
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
        
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Accounts
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => setActiveTeam(team)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <team.logo className="size-4 shrink-0" />
                </div>
                {team.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add Account</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
