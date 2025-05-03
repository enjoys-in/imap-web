import axios from "axios";
import { instance } from "./api.instance";
import { __config } from "@/constants/config";
import { IMAP_EVENTS_WITH_EMAILS, IMAP_FOLDERS } from "../types";
 
const adminRoutes = (url: string) => `/admin${url}`
const imapRoutes = (url: string) => `/imap${url}`
export class API {
    static handleLogin(data: any) {
        return axios.post(__config.APP.API_URL + '/auth/login', data, {
            headers: {
                'X-App-Version': '1.0.0',
                'X-App-Name': 'Airsend',
                'x-api-key': __config.APP.API_KEY,
            }
        })
    }
    static handleTempCreateMailbox(data: any) {
        return axios.post(__config.APP.API_URL + '/temp', data, {
            headers: {
                'X-App-Version': '1.0.0',
                'X-App-Name': 'Airsend',
                'x-api-key': __config.APP.API_KEY,
            }
        })
    }
    static getTempMails(url: string) {
        return axios.get(__config.APP.API_URL + '/temp-mails' + url, {
            headers: {
                'X-App-Version': '1.0.0',
                'X-App-Name': 'Airsend',
                'x-api-key': __config.APP.API_KEY,
            }
        })
    }
    static handleRegister(data: any) {
        return axios.post(__config.APP.API_URL + '/auth/register', data, {
            headers: {
                'X-App-Version': '1.0.0',
                'X-App-Name': 'Airsend',
                'x-api-key': __config.APP.API_KEY,
            }
        })
    }
    static handleLogout() {
        return instance.post('/auth/logout')
    }
    static getDomains() {
        return instance.get('/domains')
    }

    static checkUserName(username: string) {
        return instance.get('/check-username?username=' + username)
    }
    static getSingleMailData(id: string) {
        return instance.get(`/get-mail/${id}`)
    }
    static getAllMailData() {
        return instance.get(`/get-mails`)
    }

    static handleGoogleLogin() {
        return instance.get('/oauth2/google/connect')
    }
    static handleGoogleCallback(code: string) {
        return instance.get('/oauth2/google/callback?code=' + code)
    }

    // DOMAIN
    static handleGetAllDomains(url: string = "") {
        return instance.get(adminRoutes("/domains" + url))
    }
    static addNewDomain(data: any) {
        return instance.post(adminRoutes("/domain"), data)
    }
    static verifyDomain(domainId: string) {
        return instance.get(adminRoutes(`/verify-records/${domainId}`))
    }
    static getSingleDomain(domainId: string) {
        return instance.get(adminRoutes(`/domain/${domainId}`))
    }
    static updateDomain(domainId: string, data: any) {
        return instance.patch(adminRoutes(`/domain/${domainId}`), data)
    }
    static deleteDomain(domainId: string) {
        return instance.delete(adminRoutes(`/domain/${domainId}`))
    }

    static verifyDomainOwnership(domainId: string) {
        return instance.get(adminRoutes(`/verify-domain-ownership/${domainId}`))
    }

    static claimDomainOwnership(domainId: string) {
        return instance.get(adminRoutes(`/claim-domain-ownership/${domainId}`))
    }

    // USER
    static handleAddUser(data: any) {
        return instance.post(adminRoutes(`/user`), data)
    }
    static handleGetAllUsers() {
        return instance.get(adminRoutes(`/users`))
    }
    static handleDeleteUser(userid: string) {
        return instance.delete(adminRoutes(`/user/${userid}`))
    }
    static handleResetPassword(userid: string) {
        return instance.get(adminRoutes(`/reset-password/${userid}`))
    }
    static downloadAttachment(messageId: string, index: number) {
        return instance.get(adminRoutes(`/download-attachment/${messageId}?index=${index}`))
    }
    static handleCreateAPIKey(data: any) {
        return instance.post(adminRoutes(`/api-key`), data)
    }
    static handleGetAPIKeys() {
        return instance.get(adminRoutes(`/api-keys`))
    }
    static handleDeleteAPIKey(id: string) {
        return instance.delete(adminRoutes(`/api-key/${id}`),)
    }
    static generateAPiCode() {
        return instance.get(`/client/code`)
    }
    static sendMail(data: any) {
        return instance.post(`/client/send`, data)
    }
    static fetchMails() {
        return instance.get(`/client/get`)
    }
    // IMAP ROUTES
    static handleImapLogin(data: any) {
        return axios.post(__config.APP.API_URL + '/imap/authenticate', data, {
            headers: {
                'X-App-Version': '1.0.0',
                'X-App-Name': 'Airsend',
                'x-api-key': __config.APP.API_KEY,
            }
        })
    }
    static handleImapCreateAccount(data: any) {
        return axios.post(__config.APP.API_URL + '/imap/validate?is_new=yes', data, {
            headers: {
                'X-App-Version': '1.0.0',
                'X-App-Name': 'Airsend',
                'x-api-key': __config.APP.API_KEY,
            }
        })
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
    static handleMailboxEvents({mailbox,type}: IMAP_FOLDERS) {
        return instance.patch(imapRoutes(`/handle-mailbox-events?type=${type}`), {
            mailbox
        })
    }
    static bulkSync() { }
}

