"use client"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Archive, Check, ChevronDown, Flag, MoreHorizontal, RefreshCw, Shield, Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { useMailStore } from "@/store/mails"

import { useCallback } from "react"
import { toast } from "sonner"
import { API } from "@/lib/api/handler"
import { ApiResponse } from "@/lib/types"
import { FaToolbox } from "react-icons/fa"

export function SpotToolbar() {
  const { checkedItems, all_emails, setCheckedItems, selected_mailbox } = useMailStore()
  const handleImapEvents = useCallback(
    async (event: string) => {
      try {
        let response
        switch (event) {
          case "delete":
            response = await API.deleteMail(selected_mailbox!, checkedItems)
            break
          case "delete_all":
            response = await API.deleteMail(selected_mailbox!, checkedItems, true)
            break
          case "mark_as_read":
            response = await API.markAsReadOrUnread(selected_mailbox!, checkedItems, "mark_as_read")
            break
          case "mark_as_unread":
            response = await API.markAsReadOrUnread(selected_mailbox!, checkedItems, "mark_as_unread")
            break
          case "mark_all_as_read":
            response = await API.markAsReadOrUnread(selected_mailbox!, checkedItems, "mark_all_as_read")
            break
          case "mark_all_as_unread":
            response = await API.markAsReadOrUnread(selected_mailbox!, checkedItems, "mark_all_as_unread")
            break
          case "block":
            break
          case "report":
            break
          case "move":
            response = await API.moveEmailToAnotherMailbox(selected_mailbox!, checkedItems, "mark_all_as_unread")
            break
          case "copy":
            response = await API.copymailToAnotherMailbox(selected_mailbox!, checkedItems, "mark_all_as_unread")
            break
          case "move_all":
            response = await API.moveEmailToAnotherMailbox(selected_mailbox!, checkedItems, "destination_folder", true)
            break
          case "copy_all":
            response = await API.copymailToAnotherMailbox(selected_mailbox!, checkedItems, "destination_folder", true)
            break
          default:
            toast.error("Invalid action.")
            break
        }
        if (response) {
          const data = response.data as ApiResponse<any>
          if (!data.success) {
            return toast.error(data.message)
          }
          if (event === "delete" || event === "move" || event === "archive") {

            const udpatedEmails = all_emails?.emails.filter((item) => !checkedItems.includes(item.uid))
            // setCheckedItems(udpatedEmails)

          }
          if (event === "move_all" || event === "delete_all") {
            setCheckedItems([])
          }
          toast.success(data.message)

        }
      } catch (error: any) {
        return toast.error(error.message)
      }
    },
    []
  )
  const handleSelectAll = useCallback(() => {
    const uids = all_emails?.emails.map((item) => item.uid)
    if (uids && uids?.length > 0) {
      setCheckedItems(uids)
    }
  },
    []
  )
  return checkedItems.length > 0 ? (
    <div className="flex z-10 fixed items-center justify-between w-full glass border-b border-border/30 text-foreground px-4 py-1 animate-slide-down-fade">
      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="sm" className="rounded-xl hover:bg-primary/10 hover:text-primary smooth-transition" onClick={handleSelectAll}>
          <Check className="w-4 h-4 mr-2" />
          Select All
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="rounded-xl hover:bg-destructive/10 hover:text-destructive smooth-transition">
              <Shield className="w-4 h-4 mr-2" />
              Report
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="glass-card rounded-xl border-0 shadow-elevated-lg">
            <DropdownMenuItem className="rounded-lg">Report spam</DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg">Report phishing</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="rounded-xl hover:bg-blue-500/10 hover:text-blue-500 smooth-transition">
              <Flag className="w-4 h-4 mr-2" />
              Flag
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="glass-card rounded-xl border-0 shadow-elevated-lg">
            <DropdownMenuItem className="rounded-lg">Flag as important</DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg">Flag for follow-up</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="sm" className="rounded-xl hover:bg-emerald-500/10 hover:text-emerald-500 smooth-transition">
          <RefreshCw className="w-4 h-4 mr-2" />
          Sync
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="rounded-xl hover:bg-secondary smooth-transition">
              <FaToolbox className="w-4 h-4 mr-2" />
              Actions
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="glass-card rounded-xl border-0 shadow-elevated-lg">
            <DropdownMenuItem className="rounded-lg">Mark as Unread</DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg">Move</DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg text-destructive focus:text-destructive" onClick={() => handleImapEvents("delete")}>Delete</DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg">Archive</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  ) : null
}
