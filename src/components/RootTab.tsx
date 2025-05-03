"use client";

import { useTabStore } from "@/store/layout";
import React, {   useEffect } from "react";

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
  useEffect(() => {

  }, [activeTab]);
  return (
    <div className="flex-1 py-0">
      <div className="bg-zinc-300 dark:bg-black rounded-full flex justify-between relative">
        <div
          className={`bg-zinc-400 dark:bg-zinc-800 w-[50%] h-full absolute top-0 ${isActive(leftLabel) ? "left-0" : "left-[100%] translate-x-[-100%]"
            } transition-all rounded-full border-[3px] border-zinc-300 dark:border-black`}
        ></div>
        <button
          className={`flex-1 py-2 text-sm text-center h-fit z-10 ${isActive(leftLabel) ? "dark:text-zinc-200" : "dark:text-zinc-500"
            } hover:text-zinc-500 hover:dark:text-zinc-300`}
          onClick={() => setActiveTab(leftLabel as any)}
        >
          {String(leftLabel)}
        </button>
        <button
          className={`flex-1 py-2 text-sm text-center h-fit z-10 ${isActive(rightLabel) ? "dark:text-zinc-200" : "dark:text-zinc-500"
            } hover:text-zinc-500 hover:dark:text-zinc-300`}
          onClick={() => setActiveTab(rightLabel as any)}
        >
          {String(rightLabel)}
        </button>
      </div>
    </div>
  );
}

export default RootTab;
