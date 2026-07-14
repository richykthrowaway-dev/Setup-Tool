import { create } from 'zustand'
import { storage } from '../services/storage'
import { forkHardwareTemplate } from '../lib/factories'
import type { HardwareTemplate, UserProfile } from '../types/models'

interface LibraryState {
  templates: HardwareTemplate[]
  profiles: UserProfile[]
  templatesLoading: boolean
  profilesLoading: boolean
  error: string | null
  refreshTemplates: () => Promise<void>
  refreshProfiles: (hardwareTemplateId?: string) => Promise<void>
  deleteTemplate: (id: string) => Promise<void>
  deleteProfile: (id: string) => Promise<void>
  forkTemplate: (template: HardwareTemplate) => Promise<void>
}

function message(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback
}

export const useLibraryStore = create<LibraryState>((set) => ({
  templates: [],
  profiles: [],
  templatesLoading: false,
  profilesLoading: false,
  error: null,

  refreshTemplates: async () => {
    set({ templatesLoading: true })
    try {
      set({ templates: await storage.listTemplates(), error: null })
    } catch (err) {
      set({ error: message(err, 'Failed to load templates.') })
    } finally {
      set({ templatesLoading: false })
    }
  },

  refreshProfiles: async (hardwareTemplateId) => {
    set({ profilesLoading: true })
    try {
      set({ profiles: await storage.listProfiles(hardwareTemplateId), error: null })
    } catch (err) {
      set({ error: message(err, 'Failed to load profiles.') })
    } finally {
      set({ profilesLoading: false })
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

  forkTemplate: async (template) => {
    try {
      const forked = forkHardwareTemplate(template)
      await storage.saveTemplate(forked)
      set({ templates: await storage.listTemplates(), error: null })
    } catch (err) {
      set({ error: message(err, 'Failed to fork template.') })
    }
  },
}))
