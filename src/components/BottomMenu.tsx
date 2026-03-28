import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React from "react";
import { IconType } from "react-icons";
import { BsStars } from "react-icons/bs";
import { FaFolder, FaInbox, FaShare, FaTelegram } from "react-icons/fa";
import { FaPenToSquare } from "react-icons/fa6";
import { Button, buttonVariants } from "./ui/button";
import { ComposeEmailDrawerSheet } from "./compose-email-sheet-dialog";

export type TTab = "Inbox" | "Starred" | "Compose" | "Sent" | "Folders";

function BottomMenu() {
  const pathname = usePathname();
  return (
    <div
      className={cn(
        "flex flex-row justify-center items-center gap-4 px-4 py-2 glass-subtle border-t border-border/30"
      )}
    >
      <Link
        href={"/"}
        className={cn(
          "flex-1 h-full rounded-xl py-2 smooth-transition",
          pathname === "/"
            ? "text-primary bg-primary/10"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
        )}
      >
        <IconButton Icon={FaInbox} label="Inbox" />
      </Link>
      <Link
        href={"sent"}
        className={cn(
          "flex-1 h-full rounded-xl py-2 smooth-transition",
          pathname === "/sent"
            ? "text-primary bg-primary/10"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
        )}
      >
        <IconButton Icon={FaShare} label="Sent" />
      </Link>
      <div className={`flex-1 h-full rounded-xl relative`}>
        <ComposeEmailDrawerSheet>
          <div
            className={cn(
              "absolute left-[50%] translate-x-[-50%] top-[-3.5rem] p-5 rounded-2xl w-[60px] h-[60px]",
              "bg-primary shadow-glow-lg hover:shadow-glow smooth-transition hover-lift",
              "text-primary-foreground flex items-center justify-center"
            )}
          >
            <IconButton Icon={FaPenToSquare} label="" />
          </div>
        </ComposeEmailDrawerSheet>
      </div>
      <Link
        href={"starred"}
        className={cn(
          "flex-1 h-full rounded-xl py-2 smooth-transition",
          pathname === "/starred"
            ? "text-primary bg-primary/10"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
        )}
      >
        <IconButton Icon={BsStars} label="Starred" />
      </Link>
      <Link
        href={"folders"}
        className={cn(
          "flex-1 h-full rounded-xl py-2 smooth-transition",
          pathname === "/folders"
            ? "text-primary bg-primary/10"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
        )}
      >
        <IconButton Icon={FaFolder} label="Folders" />
      </Link>
    </div>
  );
}

export default BottomMenu;

const IconButton = ({ Icon, label }: { Icon: IconType; label: string }) => {
  return (
    <div className="flex-1 flex flex-col justify-between items-center gap-2 ">
      <Icon size={22} />
      <span className="text-[.715rem]">{label}</span>
    </div>
  );
};
