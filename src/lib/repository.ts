/**
 * SetupRepository — data access abstraction.
 *
 * All UI code calls this interface instead of touching localStorage directly.
 * Swap the `localStorageRepository` export for an API-backed implementation
 * and everything else stays the same.
 */

import { LapTime, Setup } from '@/types/setup';

export interface SetupRepository {
  list(): Promise<Setup[]>;
  get(id: string): Promise<Setup | null>;
  save(setup: Setup): Promise<Setup>;
  remove(id: string): Promise<void>;
  addLapTime(setupId: string, lapTime: LapTime): Promise<Setup>;
  deleteLapTime(setupId: string, lapTimeId: string): Promise<Setup>;
}

// ─── localStorage implementation ─────────────────────────────────────────────────

const KEY = 'iracing_setups';

function read(): Setup[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Setup[]) : [];
  } catch {
    return [];
  }
}

function write(setups: Setup[]): void {
  localStorage.setItem(KEY, JSON.stringify(setups));
}

export const localStorageRepository: SetupRepository = {
  async list() {
    return read();
  },

  async get(id) {
    return read().find((s) => s.id === id) ?? null;
  },

  async save(setup) {
    const setups = read();
    const idx = setups.findIndex((s) => s.id === setup.id);
    if (idx >= 0) {
      setups[idx] = setup;
    } else {
      setups.push(setup);
    }
    write(setups);
    return setup;
  },

  async remove(id) {
    write(read().filter((s) => s.id !== id));
  },

  async addLapTime(setupId, lapTime) {
    const setups = read();
    const setup = setups.find((s) => s.id === setupId);
    if (!setup) throw new Error(`Setup ${setupId} not found`);
    setup.lapTimes = [...(setup.lapTimes ?? []), lapTime];
    setup.updatedAt = Date.now();
    write(setups);
    return setup;
  },

  async deleteLapTime(setupId, lapTimeId) {
    const setups = read();
    const setup = setups.find((s) => s.id === setupId);
    if (!setup) throw new Error(`Setup ${setupId} not found`);
    setup.lapTimes = (setup.lapTimes ?? []).filter((lt) => lt.id !== lapTimeId);
    setup.updatedAt = Date.now();
    write(setups);
    return setup;
  },
};

/** Default repository used throughout the app. */
export const repo = localStorageRepository;
