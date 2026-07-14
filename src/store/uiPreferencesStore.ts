import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ConfiguratorViewMode = 'canvas' | 'table'
export type LabelDisplayMode = 'names' | 'numbers' | 'functions'

interface UiPreferencesState {
  /**
   * Persisted user preference, not per-template/profile UI state: once set,
   * stays set across reloads and across switching templates or profiles.
   * Only an explicit toggle click changes it.
   */
  configuratorViewMode: ConfiguratorViewMode
  setConfiguratorViewMode: (mode: ConfiguratorViewMode) => void

  /**
   * Controls what label is displayed in the bindings table for each control.
   * Persisted across reloads.
   * - 'names': show control.label (e.g., "Rotary 1 (top left)")
   * - 'numbers': show sequential control number (e.g., "1", "2", "3")
   * - 'functions': show binding.assignedFunction (e.g., "Shift Up")
   */
  labelDisplayMode: LabelDisplayMode
  setLabelDisplayMode: (mode: LabelDisplayMode) => void
}

export const useUiPreferencesStore = create<UiPreferencesState>()(
  persist(
    (set) => ({
      configuratorViewMode: 'table',
      setConfiguratorViewMode: (mode) => set({ configuratorViewMode: mode }),
      labelDisplayMode: 'names',
      setLabelDisplayMode: (mode) => set({ labelDisplayMode: mode }),
    }),
    { name: 'supermapper:ui-preferences' },
  ),
)
