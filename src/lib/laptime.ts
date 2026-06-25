/** Lap time parsing, formatting, and statistics utilities. */

/**
 * Parse a lap time string to milliseconds.
 * Accepts: "1:52.341", "1:52", "52.341", "112341" (raw ms)
 * Returns null if the string cannot be parsed.
 */
export function parseLapTime(str: string): number | null {
  const s = str.trim();

  // m:ss.mmm or m:ss
  const colonMatch = s.match(/^(\d+):(\d{2})(?:\.(\d{1,3}))?$/);
  if (colonMatch) {
    const minutes = parseInt(colonMatch[1], 10);
    const seconds = parseInt(colonMatch[2], 10);
    const ms = parseInt((colonMatch[3] ?? '0').padEnd(3, '0'), 10);
    if (seconds >= 60) return null;
    return (minutes * 60 + seconds) * 1000 + ms;
  }

  // ss.mmm
  const decMatch = s.match(/^(\d+)\.(\d{1,3})$/);
  if (decMatch) {
    const seconds = parseInt(decMatch[1], 10);
    const ms = parseInt(decMatch[2].padEnd(3, '0'), 10);
    return seconds * 1000 + ms;
  }

  return null;
}

/** Format milliseconds as "m:ss.mmm" */
export function formatLapTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = ms % 1000;
  return `${minutes}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
}

export interface LapStats {
  count: number;
  fastest: number;
  average: number;
  /** Population standard deviation in ms */
  stdDev: number;
}

export function computeLapStats(lapTimesMs: number[]): LapStats | null {
  if (lapTimesMs.length === 0) return null;
  const sorted = [...lapTimesMs].sort((a, b) => a - b);
  const fastest = sorted[0];
  const average = lapTimesMs.reduce((s, v) => s + v, 0) / lapTimesMs.length;
  const variance =
    lapTimesMs.reduce((s, v) => s + (v - average) ** 2, 0) / lapTimesMs.length;
  const stdDev = Math.sqrt(variance);
  return { count: lapTimesMs.length, fastest, average, stdDev };
}
