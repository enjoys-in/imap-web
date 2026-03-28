import type React from "react"
import {
  Archive,
  Trash2,
  Clock,
  CheckSquare,
  MoveRight,
  Tag,
  BellOff,
  Search,
  ExternalLink,
} from "lucide-react"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

export function EmailContextMenu({ children }: { children: React.ReactNode }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-64 glass-card rounded-xl border-0 shadow-elevated-lg p-1">
        <ContextMenuSub>
          <ContextMenuSubTrigger className="flex items-center justify-between rounded-lg">
            <div className="flex items-center gap-2">
              <MoveRight className="h-4 w-4 text-muted-foreground" />
              <span>Move to tab</span>
            </div>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48 glass-card rounded-xl border-0 shadow-elevated-lg p-1">
            <ContextMenuItem className="rounded-lg">
              <div className="flex items-center gap-2">
                <span className="block h-2 w-2 rounded-full bg-blue-500"></span>
                <span>Primary</span>
              </div>
            </ContextMenuItem>
            <ContextMenuItem className="rounded-lg">
              <div className="flex items-center gap-2">
                <span className="block h-2 w-2 rounded-full bg-emerald-500"></span>
                <span>Promotions</span>
              </div>
            </ContextMenuItem>
            <ContextMenuItem className="rounded-lg">
              <div className="flex items-center gap-2">
                <span className="block h-2 w-2 rounded-full bg-yellow-500"></span>
                <span>Updates</span>
              </div>
            </ContextMenuItem>
            <ContextMenuItem className="rounded-lg">
              <div className="flex items-center gap-2">
                <span className="block h-2 w-2 rounded-full bg-violet-500"></span>
                <span>Forums</span>
              </div>
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuItem className="rounded-lg">
          <div className="flex items-center gap-2">
            <MoveRight className="h-4 w-4 rotate-180 text-muted-foreground" />
            <span>Reply</span>
          </div>
        </ContextMenuItem>

        <ContextMenuItem className="rounded-lg">
          <div className="flex items-center gap-2">
            <MoveRight className="h-4 w-4 rotate-180 text-muted-foreground" />
            <span>Reply all</span>
          </div>
        </ContextMenuItem>

        <ContextMenuItem className="rounded-lg">
          <div className="flex items-center gap-2">
            <MoveRight className="h-4 w-4 text-muted-foreground" />
            <span>Forward</span>
          </div>
        </ContextMenuItem>

        <ContextMenuSeparator className="bg-border/30 my-1" />

        <ContextMenuItem className="rounded-lg">
          <div className="flex items-center gap-2">
            <Archive className="h-4 w-4 text-muted-foreground" />
            <span>Archive</span>
          </div>
        </ContextMenuItem>

        <ContextMenuItem className="rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10">
          <div className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </div>
        </ContextMenuItem>

        <ContextMenuItem className="rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Snooze</span>
          </div>
        </ContextMenuItem>

        <ContextMenuItem className="rounded-lg">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
            <span>Add to Tasks</span>
          </div>
        </ContextMenuItem>

        <ContextMenuSeparator className="bg-border/30 my-1" />

        <ContextMenuSub>
          <ContextMenuSubTrigger className="flex items-center justify-between rounded-lg">
            <div className="flex items-center gap-2">
              <MoveRight className="h-4 w-4 text-muted-foreground" />
              <span>Move to</span>
            </div>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48 glass-card rounded-xl border-0 shadow-elevated-lg p-1">
            <ContextMenuItem className="rounded-lg">Inbox</ContextMenuItem>
            <ContextMenuItem className="rounded-lg">Sent</ContextMenuItem>
            <ContextMenuItem className="rounded-lg">Drafts</ContextMenuItem>
            <ContextMenuItem className="rounded-lg">Spam</ContextMenuItem>
            <ContextMenuItem className="rounded-lg">Trash</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSub>
          <ContextMenuSubTrigger className="flex items-center justify-between rounded-lg">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span>Label as</span>
            </div>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48 glass-card rounded-xl border-0 shadow-elevated-lg p-1">
            <ContextMenuItem className="rounded-lg">Important</ContextMenuItem>
            <ContextMenuItem className="rounded-lg">Work</ContextMenuItem>
            <ContextMenuItem className="rounded-lg">Personal</ContextMenuItem>
            <ContextMenuItem className="rounded-lg">To-do</ContextMenuItem>
            <ContextMenuSeparator className="bg-border/30" />
            <ContextMenuItem className="rounded-lg text-primary">Create new</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator className="bg-border/30 my-1" />

        <ContextMenuItem className="rounded-lg">
          <div className="flex items-center gap-2">
            <BellOff className="h-4 w-4 text-muted-foreground" />
            <span>Mute</span>
          </div>
        </ContextMenuItem>

        <ContextMenuItem className="rounded-lg">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <span>Find emails from sender</span>
          </div>
        </ContextMenuItem>

        <ContextMenuItem className="rounded-lg">
          <div className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
            <span>Open in new window</span>
          </div>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
