import { create } from 'zustand'

export const useUserStore = create((set) => ({
  progress: null,
  setProgress: (progress) => set({ progress }),
}))
