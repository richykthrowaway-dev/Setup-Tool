import { create } from 'zustand'
import { storage } from '../services/storage'
import type { HardwareTemplate, UserProfile } from '../types/models'

interface LibraryState {
  templates: HardwareTemplate[]
  profiles: UserProfile[]
  refreshTemplates: () => Promise<void>
  refreshProfiles: (hardwareTemplateId?: string) => Promise<void>
  deleteTemplate: (id: string) => Promise<void>
  deleteProfile: (id: string) => Promise<void>
}

export const useLibraryStore = create<LibraryState>((set) => ({
  templates: [],
  profiles: [],

  refreshTemplates: async () => {
    set({ templates: await storage.listTemplates() })
  },

  refreshProfiles: async (hardwareTemplateId) => {
    set({ profiles: await storage.listProfiles(hardwareTemplateId) })
  },

  deleteTemplate: async (id) => {
    await storage.deleteTemplate(id)
    set({ templates: await storage.listTemplates() })
  },

  deleteProfile: async (id) => {
    await storage.deleteProfile(id)
    set({ profiles: await storage.listProfiles() })
  },
}))
