import { Account, UserProfile } from '@/lib/types/interfaces/User.interface'
import { create } from 'zustand'



interface AccountState {
    accounts: Account[],
    current_account: UserProfile | null,
    setCurrentAccount: (account: UserProfile|null) => void
    setAccounts: (accounts: Account[]) => void
}

export const useProfileStore = create<AccountState>()((set) => ({
    accounts: [],
    current_account: null,
    setCurrentAccount: (account) => set({ current_account: account }),
    setAccounts: (accounts) => set({ accounts }),


})
)