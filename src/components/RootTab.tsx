"use client";

import { useTabStore } from "@/store/layout";
import React from "react";

interface IRootTabProps<T> {
  leftLabel: T;
  rightLabel: T;

}
function RootTab<T extends "Mailbox" | "Settings">({
  leftLabel,
  rightLabel,

}: IRootTabProps<T>) {
  const { activeTab, setActiveTab } = useTabStore()


  const isActive = (label: T) => {
    return activeTab === label;
  };

  return (
    <div className="flex-1 py-0 px-2">
      <div className="bg-secondary/50 rounded-xl flex justify-between relative p-0.5">
        <div
          className={`bg-background w-[50%] h-full absolute top-0.5 ${isActive(leftLabel) ? "left-0.5" : "left-[100%] translate-x-[calc(-100%-2px)]"
            } smooth-transition rounded-[10px] shadow-sm`}
          style={{ height: "calc(100% - 4px)" }}
        ></div>
        <button
          className={`flex-1 py-2 text-sm text-center h-fit z-10 rounded-[10px] font-medium smooth-transition ${isActive(leftLabel) ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          onClick={() => setActiveTab(leftLabel as any)}
        >
          {String(leftLabel)}
        </button>
        <button
          className={`flex-1 py-2 text-sm text-center h-fit z-10 rounded-[10px] font-medium smooth-transition ${isActive(rightLabel) ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          onClick={() => setActiveTab(rightLabel as any)}
        >
          {String(rightLabel)}
        </button>
      </div>
    </div>
  );
}

export default RootTab;
