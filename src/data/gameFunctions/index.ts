import { IRACING_FUNCTIONS } from './iracing'

/** Per-game function libraries, keyed by a lowercase, whitespace-collapsed game name. */
const GAME_FUNCTION_LIBRARIES: Record<string, string[]> = {
  iracing: IRACING_FUNCTIONS,
}

function normalizeGameName(game: string): string {
  return game.trim().toLowerCase().replace(/\s+/g, '')
}

/**
 * Suggested function names for a profile's game, for use as <datalist> options.
 * Matches loosely (case/whitespace-insensitive substring) so "iRacing", "iracing",
 * and "iRacing (Sim)" all resolve to the iRacing library. Unknown/unset games get [].
 */
export function getGameFunctionSuggestions(game?: string): string[] {
  if (!game) return []
  const normalized = normalizeGameName(game)
  for (const [key, functions] of Object.entries(GAME_FUNCTION_LIBRARIES)) {
    if (normalized.includes(key)) return functions
  }
  return []
}

export const GAME_FUNCTION_DATALIST_ID = 'game-function-suggestions'
