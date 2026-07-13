import { create } from 'zustand'
import { storage } from '../services/storage'
import { createBinding, createUserProfile } from '../lib/factories'
import type { UserProfile } from '../types/models'

interface ProfileState {
  profile: UserProfile | null
  saveError: string | null

  startNewProfile: (params: {
    hardwareTemplateId: string
    name: string
    game?: string
    vehicle?: string
    track?: string
  }) => void
  loadProfile: (profile: UserProfile) => void
  clearProfile: () => void

  updateMeta: (partial: Partial<Pick<UserProfile, 'name' | 'game' | 'vehicle' | 'track'>>) => void

  setBinding: (params: {
    controlId: string
    assignedFunction: string
    notes?: string
    category?: string
  }) => void
  removeBinding: (controlId: string) => void

  saveProfile: () => Promise<void>
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  saveError: null,

  startNewProfile: (params) => set({ profile: createUserProfile(params) }),

  loadProfile: (profile) => set({ profile }),

  clearProfile: () => set({ profile: null }),

  updateMeta: (partial) => {
    const { profile } = get()
    if (!profile) return
    set({ profile: { ...profile, ...partial, updatedAt: new Date().toISOString() } })
  },

  setBinding: ({ controlId, assignedFunction, notes, category }) => {
    const { profile } = get()
    if (!profile) return
    const existing = profile.bindings.find((b) => b.controlId === controlId)
    const bindings = existing
      ? profile.bindings.map((b) =>
          b.controlId === controlId ? { ...b, assignedFunction, notes, category } : b,
        )
      : [...profile.bindings, createBinding({ controlId, assignedFunction, notes, category })]
    set({ profile: { ...profile, bindings, updatedAt: new Date().toISOString() } })
  },

  removeBinding: (controlId) => {
    const { profile } = get()
    if (!profile) return
    set({
      profile: {
        ...profile,
        bindings: profile.bindings.filter((b) => b.controlId !== controlId),
        updatedAt: new Date().toISOString(),
      },
    })
  },

  saveProfile: async () => {
    const { profile } = get()
    if (!profile) return
    set({ saveError: null })
    try {
      await storage.saveProfile(profile)
    } catch (err) {
      set({ saveError: err instanceof Error ? err.message : 'Failed to save profile.' })
    }
  },
}))
