import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { buttonVariants } from "./ui/button";
import { Bell } from "lucide-react";
import Notifications from "./shared/notifications";
import { ScrollArea } from "@/components/ui/scroll-area"

function NotificationPopover() {
  return (
    <Popover>
      <PopoverTrigger>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "relative rounded-xl smooth-transition",
                buttonVariants({ size: "icon", variant: "ghost" }),
                "hover:bg-primary/10 hover:text-primary"
              )}
            >
              <Bell className="h-4 w-4"  />
              <div className="absolute right-2.5 top-2.5 w-2 h-2 bg-primary rounded-full animate-ping"/>
              <div className="absolute right-2.5 top-2.5 w-2 h-2 bg-primary rounded-full"/>
              <span className="sr-only">Notifications</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>Notifications</TooltipContent>
        </Tooltip>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] h-[500px] flex glass-card rounded-2xl border-0 shadow-elevated-lg p-0 overflow-hidden">
        <ScrollArea className="w-full p-4">
          <Notifications />
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

export default NotificationPopover;
