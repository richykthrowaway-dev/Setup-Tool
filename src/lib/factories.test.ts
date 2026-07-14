import { describe, expect, it } from 'vitest'
import { createControlObject, createHardwareTemplate, createUserProfile, forkHardwareTemplate } from './factories'

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
