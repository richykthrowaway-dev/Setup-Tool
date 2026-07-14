import { describe, expect, it } from 'vitest'
import { hardwareTemplateSchema, userProfileSchema } from './schema'
import { createControlObject, createHardwareTemplate, createUserProfile, createBinding } from '../lib/factories'

describe('hardwareTemplateSchema', () => {
  function validTemplate() {
    const template = createHardwareTemplate({
      manufacturer: 'Conspit',
      model: 'MAX 01',
      imageUrl: 'https://example.com/image.png',
      imageWidth: 1200,
      imageHeight: 700,
    })
    template.controls.push(createControlObject('button', { x: 10, y: 10 }))
    return template
  }

  it('accepts a well-formed template', () => {
    const result = hardwareTemplateSchema.safeParse(validTemplate())
    expect(result.success).toBe(true)
  })

  it('rejects a control with an unknown type', () => {
    const template = validTemplate()
    // @ts-expect-error intentionally invalid for the test
    template.controls[0].type = 'flux-capacitor'
    const result = hardwareTemplateSchema.safeParse(template)
    expect(result.success).toBe(false)
  })

  it('rejects a position outside the 0-100 percent range', () => {
    const template = validTemplate()
    template.controls[0].position = { x: 150, y: 10 }
    const result = hardwareTemplateSchema.safeParse(template)
    expect(result.success).toBe(false)
  })

  it('rejects a template missing required fields', () => {
    const { meta: _meta, ...withoutMeta } = validTemplate()
    const result = hardwareTemplateSchema.safeParse(withoutMeta)
    expect(result.success).toBe(false)
  })

  it('accepts an optional template-level notes string', () => {
    const template = { ...validTemplate(), notes: 'Photo taken under warm lighting; colors may look off.' }
    const result = hardwareTemplateSchema.safeParse(template)
    expect(result.success).toBe(true)
  })

  it('accepts a template with no notes field at all', () => {
    const { notes: _notes, ...withoutNotes } = validTemplate()
    expect('notes' in withoutNotes).toBe(false)
    const result = hardwareTemplateSchema.safeParse(withoutNotes)
    expect(result.success).toBe(true)
  })
})

describe('userProfileSchema', () => {
  function validProfile() {
    const profile = createUserProfile({ hardwareTemplateId: 'tmpl-1', name: 'iRacing Ferrari 296 GT3' })
    profile.bindings.push(createBinding({ controlId: 'ctrl-1', assignedFunction: 'Brake Bias Adjustment' }))
    return profile
  }

  it('accepts a well-formed profile', () => {
    const result = userProfileSchema.safeParse(validProfile())
    expect(result.success).toBe(true)
  })

  it('rejects a binding missing its controlId', () => {
    const profile = validProfile()
    // @ts-expect-error intentionally invalid for the test
    delete profile.bindings[0].controlId
    const result = userProfileSchema.safeParse(profile)
    expect(result.success).toBe(false)
  })
})
