import { create } from 'zustand'

interface State {
    activeTab: "Mailbox" | "Settings"
    setActiveTab: (tab: string) => void


}

export const useTabStore = create<State>()((set) => ({


    activeTab: "Mailbox",
    setActiveTab: (tab) => set({ activeTab: tab as "Mailbox" | "Settings" }),
}))
