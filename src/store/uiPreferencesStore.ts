import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ConfiguratorViewMode = 'canvas' | 'table'

interface UiPreferencesState {
  /**
   * Persisted user preference, not per-template/profile UI state: once set,
   * stays set across reloads and across switching templates or profiles.
   * Only an explicit toggle click changes it.
   */
  configuratorViewMode: ConfiguratorViewMode
  setConfiguratorViewMode: (mode: ConfiguratorViewMode) => void
}

export const useUiPreferencesStore = create<UiPreferencesState>()(
  persist(
    (set) => ({
      configuratorViewMode: 'canvas',
      setConfiguratorViewMode: (mode) => set({ configuratorViewMode: mode }),
    }),
    { name: 'supermapper:ui-preferences' },
  ),
)
