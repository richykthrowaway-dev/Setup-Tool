import { describe, expect, it } from 'vitest'
import { getGameFunctionSuggestions } from './index'
import { IRACING_FUNCTIONS } from './iracing'

describe('getGameFunctionSuggestions', () => {
  it('returns the iRacing library for an exact match', () => {
    expect(getGameFunctionSuggestions('iRacing')).toEqual(IRACING_FUNCTIONS)
  })

  it('matches case- and whitespace-insensitively', () => {
    expect(getGameFunctionSuggestions('iracing')).toEqual(IRACING_FUNCTIONS)
    expect(getGameFunctionSuggestions('IRACING')).toEqual(IRACING_FUNCTIONS)
    expect(getGameFunctionSuggestions('  iRacing  ')).toEqual(IRACING_FUNCTIONS)
  })

  it('matches a game name that contains extra text', () => {
    expect(getGameFunctionSuggestions('iRacing (Steam)')).toEqual(IRACING_FUNCTIONS)
  })

  it('returns an empty array for an unknown game', () => {
    expect(getGameFunctionSuggestions('Assetto Corsa Competizione')).toEqual([])
  })

  it('returns an empty array when no game is set', () => {
    expect(getGameFunctionSuggestions(undefined)).toEqual([])
    expect(getGameFunctionSuggestions('')).toEqual([])
  })
})
