import { EditorAttachments } from "./editor";

export interface MailData {
    message_id: string; // Unique identifier for each mail
    from: string; // Sender email
    receipients: string[];
    to: string;
    subject: string | undefined; // Subject of the mail
    hasAttachment: boolean | FileAttachmentInterface[]; // Attachment field, can be a boolean or an object with content and related flag
    isRead: boolean; // Whether the mail is read or not
    timestamp: string | undefined; // Timestamp of the mail
    title: string; // Title of the mail
    shortContent: string; // Preview content of the mail
    headersLine?: { key: string; line: string }; // Optional headers as key-value pairs
    headers?: object; // Optional additional headers as key-value pairs
    toWithName?: string | undefined | null;
    contents?: string;
    isStarred?: boolean;
    synced: boolean
}
export interface FileAttachmentInterface {
    type: string;
    content: Buffer;
    contentType: string;
    partId: string;
    release: string | null;
    contentDisposition: string;
    filename: string;
    headers: Map<string, any>;
    checksum: string;
    size: number;
}

export enum DOMAIN_STATUS {
    NOT_STARTED = 'NOT STARTED',
    PENDING = 'PENDING',
    VERIFIED = 'VERIFIED',
    REJECTED = 'REJECTED'
}
export interface DomainVerificationResponse {
    id: string;
    domain_name: string;
    status: DOMAIN_STATUS;
    records: DNSRecords[];
    created_at: string | Date;
}

export type ExpectedDNSRecordType = {
    SPF: Answer,
    DKIM: Answer,
    DMARC: Answer
    MX: Answer,
}
export type HasRecords = {
    DKIM: Answer
} & Omit<ExpectedDNSRecordType, "DKIM">


interface Answer {
    name: string;
    type: number;
    TTL: number;
    data: string;
}
export interface MailOptions {
    from: string;
    to: Array<string>;
    cc?: Array<string>;
    bcc?: Array<string>;
    subject: string;
    text?: string;
    html: string;
}
export type CustomMailOptions = Omit<MailOptions, "text"> & {
    attachments?: Array<EditorAttachments>,
}
// export interface DNSRecords {
//     MX: Answer[];
//     SPF: Answer;
//     DKIM: Answer;
//     DMARC: Answer;
// }
export interface DNSRecords extends Answer { }

interface Answer {
    ttl: number;
    data: string;
    name: string;
    type: number;
    status: boolean;
}