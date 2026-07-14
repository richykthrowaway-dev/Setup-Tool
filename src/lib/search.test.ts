import { describe, expect, it } from 'vitest'
import { templateMatchesQuery } from './search'
import { createHardwareTemplate } from './factories'

function template(manufacturer: string, model: string, description?: string) {
  return createHardwareTemplate({
    manufacturer,
    model,
    description,
    imageUrl: 'data:image/png;base64,AAAA',
    imageWidth: 100,
    imageHeight: 100,
  })
}

describe('templateMatchesQuery', () => {
  it('matches everything for an empty query', () => {
    expect(templateMatchesQuery(template('Conspit', 'MAX 01'), '')).toBe(true)
    expect(templateMatchesQuery(template('Conspit', 'MAX 01'), '   ')).toBe(true)
  })

  it('matches manufacturer case-insensitively', () => {
    expect(templateMatchesQuery(template('Conspit', 'MAX 01'), 'conspit')).toBe(true)
  })

  it('matches model case-insensitively', () => {
    expect(templateMatchesQuery(template('Conspit', 'MAX 01'), 'max 01')).toBe(true)
  })

  it('matches description', () => {
    expect(templateMatchesQuery(template('Conspit', 'MAX 01', 'GT racing button box'), 'button box')).toBe(true)
  })

  it('does not match unrelated text', () => {
    expect(templateMatchesQuery(template('Conspit', 'MAX 01'), 'Fanatec')).toBe(false)
  })
})
