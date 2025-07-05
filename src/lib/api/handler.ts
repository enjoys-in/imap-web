import axios from "axios";
import { instance } from "./api.instance";
import { __config } from "@/constants/config";
import { IMAP_EVENTS_WITH_EMAILS, IMAP_FOLDERS } from "../types";

const imapRoutes = (url: string) => `/api/v1/imap${url}`
export class API {

    // IMAP ROUTES
    static handleImapLogin(data: any) {
        return axios.post(__config.APP.BASE_URL + '/api/v1/imap/authenticate', data, {
            headers: {
                'X-App-Version': '1.0.0',
                'X-App-Name': 'AirSend IMAP Client',
                'X-Powered-By': 'ENJOYS',

                'x-api-key': __config.APP.API_KEY,
            },
            withCredentials: true
        })
    }
    static handleImapCreateAccount(data: any) {
        return axios.post(__config.APP.BASE_URL + '/api/v1/imap/validate?is_new=yes', data, {
            headers: {
                'X-App-Version': '1.0.0',
                'X-App-Name': 'AirSend IMAP Client',
                'X-Powered-By': 'ENJOYS',

                'x-api-key': __config.APP.API_KEY,
            },
            withCredentials: true

        })
    }
    static userLogout() {
        return instance.post(imapRoutes(`/logout`))
    }
    static userProfile() {
        return instance.get(imapRoutes(`/user-profile`))
    }
    static fetchMailboxes() {
        return instance.get(imapRoutes(`/fetch-mailboxes`))
    }

    static fetchEmails(folderName: string) {
        return instance.get(imapRoutes(`/fetch-emails?folder=${encodeURIComponent(folderName)}`))
    }
    static fetchEmailBody(folderName: string, uid: number) {
        return instance.get(imapRoutes(`/fetch-email-body?folder=${encodeURIComponent(folderName)}&uid=${uid}`))
    }

    static syncSelectedFolder(folderName: string) {
        return instance.get(imapRoutes(`/fetch-mailbox?folder=${encodeURIComponent(folderName)}`))
    }

    static getQuota() {
        return instance.patch(imapRoutes(`/handle-mailbox-events?type=quota`), {
            mailbox: "INBOX"
        })
    }
    static moveEmailToAnotherMailbox(folder: string, uids: number[], destination_folder: string, move_all: boolean = false) {
        return instance.patch(imapRoutes(`/move-email${move_all ? "?move_all=true" : ""}`), {
            uid: uids,
            current: folder,
            target: destination_folder
        })
    }
    static copymailToAnotherMailbox(folder: string, uids: number[], destination_folder: string, copy_all: boolean = false) {
        return instance.patch(imapRoutes(`/copy-email${copy_all ? "" : ""}`), {
            uid: uids,
            current: folder,
            target: destination_folder
        })
    }
    static markAsReadOrUnread(folder: string, uids: number[], events: IMAP_EVENTS_WITH_EMAILS) {
        return instance.patch(imapRoutes(`/handle-flags?folder=${folder}&${events}`), {
            uids
        })
    }

    static deleteMail(folder: string, uids: number[], delete_all: boolean = false) {
        return instance.patch(imapRoutes(`/delete-email?folder=${folder}&${delete_all ? "all=true" : ""}`), {
            uids
        })
    }
    static handleMailboxEvents({ mailbox, type }: IMAP_FOLDERS) {
        return instance.patch(imapRoutes(`/handle-mailbox-events?type=${type}`), {
            mailbox
        })
    }
    static bulkSync() { }
}

