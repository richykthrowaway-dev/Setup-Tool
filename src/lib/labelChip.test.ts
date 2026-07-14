import { describe, expect, it } from 'vitest'
import { estimateChipWidth } from './labelChip'

describe('estimateChipWidth', () => {
  it('grows with text length', () => {
    expect(estimateChipWidth('MODE', 12)).toBeLessThan(estimateChipWidth('Right Function Button', 12))
  })

  it('never goes below the minimum width, even for empty text', () => {
    expect(estimateChipWidth('', 12)).toBeGreaterThanOrEqual(36)
  })
})
