import { Server, MessageCircle, Bell, User } from "lucide-react";

const MobileNavigation = () => {
  return (
    <nav className="bottom-0 left-0 right-0 h-[56px] glass-subtle border-t border-border/30 flex justify-around items-center px-4">
      <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary smooth-transition p-2 rounded-xl hover:bg-primary/10">
        <Server className="h-5 w-5" />
        <span className="text-[10px] font-medium">Mail</span>
      </button>
      <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary smooth-transition p-2 rounded-xl hover:bg-primary/10">
        <MessageCircle className="h-5 w-5" />
        <span className="text-[10px] font-medium">Chat</span>
      </button>
      <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary smooth-transition p-2 rounded-xl hover:bg-primary/10 relative">
        <Bell className="h-5 w-5" />
        <span className="absolute top-1 right-2 w-2 h-2 bg-primary rounded-full" />
        <span className="text-[10px] font-medium">Alerts</span>
      </button>
      <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary smooth-transition p-2 rounded-xl hover:bg-primary/10">
        <User className="h-5 w-5" />
        <span className="text-[10px] font-medium">Profile</span>
      </button>
    </nav>
  );
};

export default MobileNavigation;