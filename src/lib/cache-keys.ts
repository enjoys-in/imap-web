 
import { ApiResponse } from "./types";
import { SingleEmailResponse } from "./types/interfaces/EmailResponse";
import { MailBoxListResponse } from "./types/interfaces/MailBoxListResponse.interface";
 
export type CacheStorageKey = keyof CacheResponseMap;

export interface CacheResponseMap {
  "fetch-mailboxes": ApiResponse<MailBoxListResponse[]>;
  [key: `fetch-mailbox?folder=${string}`]: ApiResponse<MailBoxListResponse>; 
  [key: `fetch-emails?folder=${string}`]: ApiResponse<SingleEmailResponse>; 
}
export type CacheResponse<K> =
  K extends CacheStorageKey ? CacheResponseMap[K]
  : K extends `fetch-mailbox?folder=${string}` ? ApiResponse<MailBoxListResponse>
  : never;