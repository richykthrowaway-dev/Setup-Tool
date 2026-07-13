import { create } from 'zustand'
import { storage } from '../services/storage'
import { createControlObject, createHardwareTemplate } from '../lib/factories'
import type { ControlObject, ControlType, HardwareTemplate } from '../types/models'

interface TemplateState {
  template: HardwareTemplate | null
  selectedControlId: string | null
  saveError: string | null

  startNewTemplate: (params: {
    manufacturer: string
    model: string
    description?: string
    imageUrl: string
    imageWidth: number
    imageHeight: number
  }) => void
  loadTemplate: (template: HardwareTemplate) => void
  clearTemplate: () => void

  updateMeta: (partial: Partial<HardwareTemplate['meta']>) => void
  setIsPublic: (isPublic: boolean) => void

  addControl: (type: ControlType, position: { x: number; y: number }) => string
  updateControl: (id: string, partial: Partial<Omit<ControlObject, 'id'>>) => void
  removeControl: (id: string) => void
  selectControl: (id: string | null) => void

  saveTemplate: () => Promise<void>
}

export const useTemplateStore = create<TemplateState>((set, get) => ({
  template: null,
  selectedControlId: null,
  saveError: null,

  startNewTemplate: (params) => {
    const template = createHardwareTemplate(params)
    set({ template, selectedControlId: null })
  },

  loadTemplate: (template) => set({ template, selectedControlId: null }),

  clearTemplate: () => set({ template: null, selectedControlId: null }),

  updateMeta: (partial) => {
    const { template } = get()
    if (!template) return
    set({
      template: {
        ...template,
        meta: { ...template.meta, ...partial },
        updatedAt: new Date().toISOString(),
      },
    })
  },

  setIsPublic: (isPublic) => {
    const { template } = get()
    if (!template) return
    set({ template: { ...template, isPublic, updatedAt: new Date().toISOString() } })
  },

  addControl: (type, position) => {
    const { template } = get()
    if (!template) return ''
    const control = createControlObject(type, position)
    set({
      template: {
        ...template,
        controls: [...template.controls, control],
        updatedAt: new Date().toISOString(),
      },
      selectedControlId: control.id,
    })
    return control.id
  },

  updateControl: (id, partial) => {
    const { template } = get()
    if (!template) return
    set({
      template: {
        ...template,
        controls: template.controls.map((c) => (c.id === id ? { ...c, ...partial } : c)),
        updatedAt: new Date().toISOString(),
      },
    })
  },

  removeControl: (id) => {
    const { template, selectedControlId } = get()
    if (!template) return
    set({
      template: {
        ...template,
        controls: template.controls.filter((c) => c.id !== id),
        updatedAt: new Date().toISOString(),
      },
      selectedControlId: selectedControlId === id ? null : selectedControlId,
    })
  },

  selectControl: (id) => set({ selectedControlId: id }),

  saveTemplate: async () => {
    const { template } = get()
    if (!template) return
    set({ saveError: null })
    const candidate: HardwareTemplate = {
      ...template,
      version: template.version + 1,
      updatedAt: new Date().toISOString(),
    }
    try {
      const saved = await storage.saveTemplate(candidate)
      set({ template: saved })
    } catch (err) {
      set({ saveError: err instanceof Error ? err.message : 'Failed to save template.' })
    }
  },
}))
