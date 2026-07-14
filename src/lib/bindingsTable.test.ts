import { describe, expect, it } from 'vitest'
import { buildBindingRows, filterBindingRows, filterByBindingStatus, sortBindingRows } from './bindingsTable'
import { createBinding, createControlObject } from './factories'

function rows() {
  const drs = createControlObject('rotary-encoder', { x: 10, y: 10 })
  drs.label = 'DRS'
  const n = createControlObject('button', { x: 20, y: 20 })
  n.label = 'N'
  const ok = createControlObject('button', { x: 30, y: 30 })
  ok.label = 'OK'

  const bindings = [
    createBinding({ controlId: drs.id, assignedFunction: 'DRS Activation', category: 'Aero' }),
    createBinding({ controlId: n.id, assignedFunction: 'Neutral', category: 'Drivetrain' }),
    // ok has no binding
  ]

  return buildBindingRows([drs, n, ok], bindings)
}

describe('buildBindingRows', () => {
  it('pairs every control with its binding, leaving unbound controls with undefined', () => {
    const result = rows()
    expect(result).toHaveLength(3)
    expect(result.find((r) => r.control.label === 'DRS')?.binding?.assignedFunction).toBe('DRS Activation')
    expect(result.find((r) => r.control.label === 'OK')?.binding).toBeUndefined()
  })
})

describe('filterBindingRows', () => {
  it('matches on control label', () => {
    expect(filterBindingRows(rows(), 'drs')).toHaveLength(1)
  })

  it('matches on assigned function', () => {
    expect(filterBindingRows(rows(), 'neutral')).toHaveLength(1)
  })

  it('matches on category', () => {
    expect(filterBindingRows(rows(), 'aero')).toHaveLength(1)
  })

  it('returns everything for an empty query', () => {
    expect(filterBindingRows(rows(), '')).toHaveLength(3)
  })

  it('returns nothing for a query that matches no row', () => {
    expect(filterBindingRows(rows(), 'nonexistent-xyz')).toHaveLength(0)
  })
})

describe('filterByBindingStatus', () => {
  it('returns everything for "all"', () => {
    expect(filterByBindingStatus(rows(), 'all')).toHaveLength(3)
  })

  it('returns only unbound rows for "unbound"', () => {
    const result = filterByBindingStatus(rows(), 'unbound')
    expect(result.map((r) => r.control.label)).toEqual(['OK'])
  })

  it('returns only bound rows for "bound"', () => {
    const result = filterByBindingStatus(rows(), 'bound')
    expect(result.map((r) => r.control.label).sort()).toEqual(['DRS', 'N'])
  })
})

describe('sortBindingRows', () => {
  it('sorts by label ascending', () => {
    const sorted = sortBindingRows(rows(), 'label', 'asc')
    expect(sorted.map((r) => r.control.label)).toEqual(['DRS', 'N', 'OK'])
  })

  it('sorts by label descending', () => {
    const sorted = sortBindingRows(rows(), 'label', 'desc')
    expect(sorted.map((r) => r.control.label)).toEqual(['OK', 'N', 'DRS'])
  })

  it('sorts unbound controls to one end when sorting by unbound status', () => {
    const sorted = sortBindingRows(rows(), 'unbound', 'desc')
    expect(sorted[0].control.label).toBe('OK')
  })

  it('does not mutate the input array', () => {
    const input = rows()
    const originalOrder = input.map((r) => r.control.label)
    sortBindingRows(input, 'label', 'desc')
    expect(input.map((r) => r.control.label)).toEqual(originalOrder)
  })
})
