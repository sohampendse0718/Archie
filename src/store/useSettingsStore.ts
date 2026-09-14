import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  isAutosaveEnabled: boolean;
  setIsAutosaveEnabled: (val: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      isAutosaveEnabled: false,
      setIsAutosaveEnabled: (val) => set({ isAutosaveEnabled: val }),
    }),
    {
      name: 'archie-settings',
    }
  )
);
