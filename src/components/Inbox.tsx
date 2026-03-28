import React, { useState } from "react";
import { FaPaperclip, FaStar } from "react-icons/fa";

interface IInboxMsg {
  from: string;
  hasAttachment: boolean;
  isRead: boolean;
  isStarred: boolean;
  timestamp: string;
  title: string;
  contents: string;
}
function Inbox({ data }: { data: IInboxMsg[] }) {
  return (
    <div className="h-full flex flex-col">
      <ul className="flex-1 overflow-auto space-y-0.5 p-1">
        {data.map((msg, i) => (
          <InboxItem key={i} {...msg} />
        ))}
      </ul>
    </div>
  );
}

export default Inbox;

const InboxItem = ({
  from,
  hasAttachment,
  isRead,
  isStarred,
  timestamp,
  title,
  contents,
}: IInboxMsg) => {
  return (
    <li className="flex flex-row px-4 py-3 rounded-xl hover:bg-secondary/60 smooth-transition cursor-pointer group gpu-accelerate">
      <div className="flex flex-col flex-1 min-w-0 gap-1">
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row gap-2 items-center">
            <p className={`text-sm ${!isRead ? 'font-semibold' : 'font-medium text-muted-foreground'}`}>{from}</p>
            {hasAttachment && (
              <span className="text-muted-foreground/50">
                <FaPaperclip className="h-3 w-3" />
              </span>
            )}
            {!isRead && (
              <div className="w-2 h-2 bg-primary rounded-full animate-glow-pulse" />
            )}
          </div>
        </div>
        <p className={`text-sm truncate ${!isRead ? 'font-medium' : 'text-muted-foreground'}`}>{title}</p>
        <p className="text-xs text-muted-foreground/70 line-clamp-1">{contents}</p>
      </div>
      <div className="flex flex-col justify-between items-end ml-3 shrink-0">
        <span className="text-xs text-muted-foreground tabular-nums">{timestamp}</span>
        <span className={`smooth-transition ${isStarred ? "text-yellow-500" : "text-muted-foreground/30 group-hover:text-muted-foreground/50"}`}>
          <FaStar className="h-3.5 w-3.5" />
        </span>
      </div>
    </li>
  );
};
