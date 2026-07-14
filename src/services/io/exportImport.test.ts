import { describe, expect, it } from 'vitest'
import { importHardwareTemplate, ImportValidationError } from './exportImport'
import { createControlObject, createHardwareTemplate } from '../../lib/factories'

function portableFile(data: unknown) {
  return new File([JSON.stringify({ kind: 'hardware-template', fileFormatVersion: 1, data })], 'template.json', {
    type: 'application/json',
  })
}

describe('importHardwareTemplate', () => {
  it('round-trips template-level notes through the portable JSON format', async () => {
    const template = createHardwareTemplate({
      manufacturer: 'Conspit',
      model: 'MAX 01',
      imageUrl: 'data:image/png;base64,AAAA',
      imageWidth: 100,
      imageHeight: 100,
    })
    template.controls.push(createControlObject('button', { x: 10, y: 10 }))
    template.notes = 'Photo taken under warm lighting; colors may look off.'

    const imported = await importHardwareTemplate(portableFile(template))

    expect(imported.notes).toBe('Photo taken under warm lighting; colors may look off.')
    expect(imported.controls).toHaveLength(1)
  })

  it('accepts a template with no notes at all', async () => {
    const template = createHardwareTemplate({
      manufacturer: 'Conspit',
      model: 'MAX 01',
      imageUrl: 'data:image/png;base64,AAAA',
      imageWidth: 100,
      imageHeight: 100,
    })
    const { notes: _notes, ...withoutNotes } = template

    const imported = await importHardwareTemplate(portableFile(withoutNotes))
    expect(imported.notes).toBeUndefined()
  })

  it('rejects a file that is not valid JSON', async () => {
    const file = new File(['not json'], 'template.json', { type: 'application/json' })
    await expect(importHardwareTemplate(file)).rejects.toThrow(ImportValidationError)
  })

  it('rejects a file that does not match the template schema', async () => {
    const file = new File([JSON.stringify({ foo: 'bar' })], 'template.json', { type: 'application/json' })
    await expect(importHardwareTemplate(file)).rejects.toThrow(ImportValidationError)
  })
})
