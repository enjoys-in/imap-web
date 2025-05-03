import { create } from 'zustand'
import { MailBoxListResponse } from '@/lib/types/interfaces/MailBoxListResponse.interface'
import { SingleEmailResponse } from '@/lib/types/interfaces/EmailResponse'
import { QuotaResponse } from '@/lib/types/interfaces/QuotaResponse'

interface State {
    quota: QuotaResponse | null
    setQuota: (storage: QuotaResponse | null) => void

    error: string | null
    setError: (error: string | null) => void

    selected_mailbox: string | null
    setSelectedMailbox: (name: string | null) => void

    all_mailbox: MailBoxListResponse[]
    setAllMailbox: (list: MailBoxListResponse[]) => void

    config: Record<string, any>
    setConfig: (config: Record<string, any>) => void

    openConfigDialog: boolean
    setOpenConfigDialog: (input: boolean) => void

    active_profile: { id: string, name: string, quota: number, usage: number, }
    setActiveProfile: (profile: { id: string, name: string, quota: number, usage: number, }) => void

    today_meetings: { title: string, start_time: string, end_time: string }[]
    setTodayMeetings: (meetings: { title: string, start_time: string, end_time: string }) => void

    mailboxes: { name: string }[]
    setMailboxes: (mailboxes: { name: string }) => void

    selectedMail: string | null
    setSelectedMail: (id: string | null) => void

    checkedItems: number[]
    setCheckedItems: (items: number[]) => void

    lables: { name: string; color: string, isActive: boolean, id: string }[]
    setLables: (items: { name: string; color: string, isActive: boolean, id: string }) => void

    all_emails: SingleEmailResponse | null
    setAllEmails: (list: SingleEmailResponse) => void
}
// devtools((set) => ({
//     selectedMail: null,
//     setSelectedMail: (id) => set({ selectedMail: id }),
//     selectedMailIndex: 0,
//     setSelectedMailIndex: (index) => set({ selectedMailIndex: index }),
// }))
export const useMailStore = create<State>()((set) => ({


    selectedMail: null,
    setSelectedMail: (id) => set({ selectedMail: id }),

    checkedItems: [],
    setCheckedItems: (items) => set({ checkedItems: items }),

    lables: [],
    setLables: (items) => set(state => ({ lables: [...state.lables, items] })),

    mailboxes: [],
    setMailboxes: (mailboxe) => set(state => ({ mailboxes: [...state.mailboxes, mailboxe] })),

    active_profile: { id: "", name: "", quota: 0, usage: 0 },
    setActiveProfile: (profile) => set({ active_profile: profile }),

    today_meetings: [],
    setTodayMeetings: (meetings) => set(state => ({ today_meetings: [...state.today_meetings, meetings] })),

    openConfigDialog: false,
    setOpenConfigDialog: (input) => set({ openConfigDialog: input }),

    config: {},
    setConfig: (config) => set({ config }),

    error: null,
    setError: (error) => set({ error }),

    selected_mailbox: null,
    setSelectedMailbox: (name) => set({ selected_mailbox: name }),

    all_mailbox: [],
    setAllMailbox: (list) => set({ all_mailbox: list }),

    all_emails: null,
    setAllEmails: (list) => set({ all_emails: list }),

    quota: null,
    setQuota: (quota) => set({ quota }),
})
)