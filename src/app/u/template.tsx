"use client"
import React, { ReactNode, Suspense, } from "react";
import { useRouter } from "next/navigation";

import { Spinner } from "@/components/common/spinner";
import { IndexDbProvider } from "@/context/IndexDbContext";
import SocketContextProvider from "@/context/SocketContext";
import NewMailRecived from "@/components/common/new-mail-recived";

import PermissionNotification from "@/components/common/permissionNotification";
import { EditorContextProvider } from "@/context/EditorContext";
import DesktopLayoutV2 from "./_components/desktop-layout";
import { CalendarProvider } from "./calender/_components/event-calendar/calendar-context";
import { MobileLayoutV2 } from "./_components/mobile-layout";

function MainLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  // const currAcc = useAppSelector((state) => state.accounts.currAccount)
  // if (!currAcc) {
  //   return router.push("/auth")
  // }

  return (
    <EditorContextProvider>
      <SocketContextProvider>
        <CalendarProvider>
          {/* <PermissionNotification currAcc={currAcc} /> */}
          <div className="flex md:hidden flex-1 bg-[#111315]">
            <MobileLayoutV2>{children} </MobileLayoutV2>
          </div>
          <div className="hidden md:flex flex-1  bg-[#111315]">
            <DesktopLayoutV2>{children} </DesktopLayoutV2>
          </div>

          {/* <NewMailRecived currAcc={currAcc} /> */}

        </CalendarProvider>
      </SocketContextProvider>
    </EditorContextProvider>
  );
}

export default MainLayout;



