import { describe, expect, it } from 'vitest'
import {
  createControlObject,
  createHardwareTemplate,
  createTemplateFromPresetControls,
  createUserProfile,
  forkHardwareTemplate,
} from './factories'

describe('createControlObject', () => {
  it('assigns the requested type, position, and a default size for that type', () => {
    const control = createControlObject('rotary-encoder', { x: 10, y: 20 })
    expect(control.type).toBe('rotary-encoder')
    expect(control.position).toEqual({ x: 10, y: 20 })
    expect(control.size).toEqual({ width: 6, height: 6 })
    expect(control.rotation).toBe(0)
  })

  it('gives each control a unique id', () => {
    const a = createControlObject('button', { x: 0, y: 0 })
    const b = createControlObject('button', { x: 0, y: 0 })
    expect(a.id).not.toBe(b.id)
  })
})

describe('createHardwareTemplate', () => {
  it('starts at version 1, private, with no controls', () => {
    const template = createHardwareTemplate({
      manufacturer: 'Conspit',
      model: 'MAX 01',
      imageUrl: 'data:image/png;base64,AAAA',
      imageWidth: 100,
      imageHeight: 100,
    })
    expect(template.version).toBe(1)
    expect(template.isPublic).toBe(false)
    expect(template.controls).toEqual([])
    expect(template.id).toBeTruthy()
    expect(template.notes).toBe('')
  })
})

describe('createUserProfile', () => {
  it('references the given template id and starts with no bindings', () => {
    const profile = createUserProfile({ hardwareTemplateId: 'tmpl-1', name: 'iRacing Ferrari 296 GT3' })
    expect(profile.hardwareTemplateId).toBe('tmpl-1')
    expect(profile.bindings).toEqual([])
  })
})

describe('forkHardwareTemplate', () => {
  it('gives the fork a new id and resets ownership/version, keeping the layout', () => {
    const source = createHardwareTemplate({
      manufacturer: 'Conspit',
      model: 'MAX 01',
      imageUrl: 'data:image/png;base64,AAAA',
      imageWidth: 100,
      imageHeight: 100,
    })
    source.creatorId = 'original-owner'
    source.isPublic = true
    source.version = 5
    source.controls.push(createControlObject('button', { x: 10, y: 10 }))

    const forked = forkHardwareTemplate(source)

    expect(forked.id).not.toBe(source.id)
    expect(forked.creatorId).toBeUndefined()
    expect(forked.isPublic).toBe(false)
    expect(forked.version).toBe(1)
    expect(forked.meta).toEqual(source.meta)
    expect(forked.controls).toHaveLength(1)
    expect(forked.controls).not.toBe(source.controls)
    expect(forked.controls[0]).toEqual(source.controls[0])
  })
})

describe('createTemplateFromPresetControls', () => {
  it('applies the preset meta/controls onto the caller-supplied image', () => {
    const preset = createHardwareTemplate({
      manufacturer: 'Conspit',
      model: 'MAX 01',
      imageUrl: 'data:image/png;base64,PRESET',
      imageWidth: 1500,
      imageHeight: 1000,
    })
    preset.controls.push(createControlObject('button', { x: 10, y: 10 }))
    preset.controls.push(createControlObject('rotary-encoder', { x: 80, y: 40 }))

    const myPhoto = { imageUrl: 'data:image/jpeg;base64,MYPHOTO', imageWidth: 2000, imageHeight: 1333 }
    const result = createTemplateFromPresetControls(preset, myPhoto)

    expect(result.id).not.toBe(preset.id)
    expect(result.imageUrl).toBe(myPhoto.imageUrl)
    expect(result.imageWidth).toBe(myPhoto.imageWidth)
    expect(result.imageHeight).toBe(myPhoto.imageHeight)
    expect(result.meta).toEqual(preset.meta)
    expect(result.version).toBe(1)
    expect(result.isPublic).toBe(false)

    expect(result.controls).toHaveLength(2)
    expect(result.controls.map((c) => c.position)).toEqual(preset.controls.map((c) => c.position))
    // Each control gets its own fresh id, independent of the preset's.
    const presetIds = new Set(preset.controls.map((c) => c.id))
    for (const control of result.controls) {
      expect(presetIds.has(control.id)).toBe(false)
    }
  })
})
