export enum SocketEventConstants {
  ServerClosed = "@@ServerClosed",
  WARNING = "@@WARNING",
  ERROR = "@@ERROR",
  INFO = "@@INFO",
  OFFER = "@@OFFER",
  BANNED = "@@BANNED",

 REGISTER_CLIENT = "@@REGISTER_CLIENT",

  NEW_MAIL_RECEIVED = "@@NEW_MAIL_RECEIVED",
}
export enum SOCKET_ROOMS {
  GLOBAL = "GLOBAL::SEND:MAILBOX",
  USER_ROOM = "USER_ROOM::"
}