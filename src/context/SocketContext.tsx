"use client"
import { socketAddListeners, socketRemoveListeners } from "@/lib/sockets/listeners";
import { appSocket } from "@/lib/sockets/socket";
import { SocketEventConstants } from "@/lib/sockets/socket-constants";
 
import React, { PropsWithChildren, use } from "react";
import { Socket } from "socket.io-client";

export const SocketContext = React.createContext<{ socket: Socket }>({ socket: appSocket });
const SocketContextProvider = ({ children }: PropsWithChildren) => {
 
    const [isConnected, setIsConnected] = React.useState(false);
    React.useEffect(() => {
        appSocket.on("connect", () => setIsConnected(true))
        appSocket.on("disconnect", () => {
            console.log("disconnected")
            setIsConnected(false);
        })
        appSocket.on("connection_error", () => setIsConnected(false));
        // if (currAcc?.email) {
        //     appSocket.emit(SocketEventConstants.REGISTER_CLIENT, currAcc?.email)
        // }
        console.log("connected",appSocket.id)
        // appSocket.connected && setIsConnected(true)
        socketAddListeners(appSocket);
        return () => socketRemoveListeners(appSocket)
    }, [isConnected])
    return (
        <SocketContext.Provider value={{ socket: appSocket }}>
            {children}
        </SocketContext.Provider>
    )
}
export default SocketContextProvider