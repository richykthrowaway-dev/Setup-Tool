import { beforeEach, describe, expect, it } from 'vitest'
import { LocalStorageAdapter } from './localStorageAdapter'
import { createHardwareTemplate, createUserProfile } from '../../lib/factories'

describe('LocalStorageAdapter', () => {
  let adapter: LocalStorageAdapter

  beforeEach(() => {
    localStorage.clear()
    adapter = new LocalStorageAdapter()
  })

  it('round-trips a template through save/get/list', async () => {
    const template = createHardwareTemplate({
      manufacturer: 'Conspit',
      model: 'MAX 01',
      imageUrl: 'data:image/png;base64,AAAA',
      imageWidth: 100,
      imageHeight: 100,
    })

    const saved = await adapter.saveTemplate(template)
    expect(saved).toEqual(template)

    expect(await adapter.getTemplate(template.id)).toEqual(template)
    expect(await adapter.listTemplates()).toEqual([template])
  })

  it('updates in place on a second save with the same id, rather than duplicating', async () => {
    const template = createHardwareTemplate({
      manufacturer: 'Conspit',
      model: 'MAX 01',
      imageUrl: 'data:image/png;base64,AAAA',
      imageWidth: 100,
      imageHeight: 100,
    })
    await adapter.saveTemplate(template)

    const updated = { ...template, meta: { ...template.meta, model: 'MAX 02' } }
    await adapter.saveTemplate(updated)

    const templates = await adapter.listTemplates()
    expect(templates).toHaveLength(1)
    expect(templates[0].meta.model).toBe('MAX 02')
  })

  it('removes a template on delete', async () => {
    const template = createHardwareTemplate({
      manufacturer: 'Conspit',
      model: 'MAX 01',
      imageUrl: 'data:image/png;base64,AAAA',
      imageWidth: 100,
      imageHeight: 100,
    })
    await adapter.saveTemplate(template)
    await adapter.deleteTemplate(template.id)

    expect(await adapter.getTemplate(template.id)).toBeUndefined()
    expect(await adapter.listTemplates()).toEqual([])
  })

  it('filters profiles by hardwareTemplateId when listing', async () => {
    const profileA = createUserProfile({ hardwareTemplateId: 'tmpl-a', name: 'Profile A' })
    const profileB = createUserProfile({ hardwareTemplateId: 'tmpl-b', name: 'Profile B' })
    await adapter.saveProfile(profileA)
    await adapter.saveProfile(profileB)

    expect(await adapter.listProfiles('tmpl-a')).toEqual([profileA])
    expect(await adapter.listProfiles()).toHaveLength(2)
  })

  it('removes a profile on delete', async () => {
    const profile = createUserProfile({ hardwareTemplateId: 'tmpl-a', name: 'Profile A' })
    await adapter.saveProfile(profile)
    await adapter.deleteProfile(profile.id)

    expect(await adapter.getProfile(profile.id)).toBeUndefined()
  })
})
