"use client"
import React, { ReactNode, useEffect, } from "react";

import SocketContextProvider from "@/context/SocketContext";

import { EditorContextProvider } from "@/context/EditorContext";
import DesktopLayoutV2 from "./_components/desktop-layout";
import { CalendarProvider } from "./calender/_components/event-calendar/calendar-context";
import { MobileLayoutV2 } from "./_components/mobile-layout";
import { API } from "@/lib/api/handler";
import { useProfileStore } from "@/store/account";
import { AnimatedGradientBg } from "@/components/magicui/animated-gradient-bg";

function MainLayout({ children }: { children: ReactNode }) {
  const { setCurrentAccount } = useProfileStore()

  const fetchUserProfile = React.useCallback(async () => {
    try {
      const { data } = await API.userProfile()
      if (data.success) {
        setCurrentAccount(data.result)
      }
    } catch (error) {
      setCurrentAccount(null)
    }
  }, [])
  useEffect(() => {
    fetchUserProfile()
  }, [])
  return (
    <EditorContextProvider>
      <SocketContextProvider>
        <CalendarProvider>
          <AnimatedGradientBg className="min-h-svh">
            {/* Mobile Layout */}
            <div className="flex md:hidden flex-1">
              <MobileLayoutV2>{children}</MobileLayoutV2>
            </div>
            {/* Desktop Layout */}
            <div className="hidden md:flex flex-1">
              <DesktopLayoutV2>{children}</DesktopLayoutV2>
            </div>
          </AnimatedGradientBg>
        </CalendarProvider>
      </SocketContextProvider>
    </EditorContextProvider>
  );
}

export default MainLayout;



