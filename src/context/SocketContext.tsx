"use client"
import { socketAddListeners, socketRemoveListeners } from "@/lib/sockets/listeners";
import { appSocket } from "@/lib/sockets/socket";
 
import React, { PropsWithChildren } from "react";
import { Socket } from "socket.io-client";

export const SocketContext = React.createContext<{ socket: Socket }>({ socket: appSocket });
const SocketContextProvider = ({ children }: PropsWithChildren) => {
 
    const [isConnected, setIsConnected] = React.useState(false);
    React.useEffect(() => {
        const onConnect = () => setIsConnected(true)
        const onDisconnect = () => setIsConnected(false)
        const onError = () => setIsConnected(false)

        appSocket.on("connect", onConnect)
        appSocket.on("disconnect", onDisconnect)
        appSocket.on("connect_error", onError)
        socketAddListeners(appSocket);

        return () => {
            appSocket.off("connect", onConnect)
            appSocket.off("disconnect", onDisconnect)
            appSocket.off("connect_error", onError)
            socketRemoveListeners(appSocket)
        }
    }, [])
    return (
        <SocketContext.Provider value={{ socket: appSocket }}>
            {children}
        </SocketContext.Provider>
    )
}
export default SocketContextProvider