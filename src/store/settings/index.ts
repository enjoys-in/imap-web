import { create } from 'zustand'



interface State {
    activeItem: string
    setActiveItem: (item: string) => void

}
 
export const useSettingsStore = create<State>()((set) => ({
    activeItem: "Recovery",
    setActiveItem: (item) => set({ activeItem: item }),


})
)