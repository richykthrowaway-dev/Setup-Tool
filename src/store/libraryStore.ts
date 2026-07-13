import { create } from 'zustand'
import { storage } from '../services/storage'
import type { HardwareTemplate, UserProfile } from '../types/models'

interface LibraryState {
  templates: HardwareTemplate[]
  profiles: UserProfile[]
  error: string | null
  refreshTemplates: () => Promise<void>
  refreshProfiles: (hardwareTemplateId?: string) => Promise<void>
  deleteTemplate: (id: string) => Promise<void>
  deleteProfile: (id: string) => Promise<void>
}

function message(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback
}

export const useLibraryStore = create<LibraryState>((set) => ({
  templates: [],
  profiles: [],
  error: null,

  refreshTemplates: async () => {
    try {
      set({ templates: await storage.listTemplates(), error: null })
    } catch (err) {
      set({ error: message(err, 'Failed to load templates.') })
    }
  },

  refreshProfiles: async (hardwareTemplateId) => {
    try {
      set({ profiles: await storage.listProfiles(hardwareTemplateId), error: null })
    } catch (err) {
      set({ error: message(err, 'Failed to load profiles.') })
    }
  },

  deleteTemplate: async (id) => {
    try {
      await storage.deleteTemplate(id)
      set({ templates: await storage.listTemplates(), error: null })
    } catch (err) {
      set({ error: message(err, 'Failed to delete template.') })
    }
  },

  deleteProfile: async (id) => {
    try {
      await storage.deleteProfile(id)
      set({ profiles: await storage.listProfiles(), error: null })
    } catch (err) {
      set({ error: message(err, 'Failed to delete profile.') })
    }
  },
}))
