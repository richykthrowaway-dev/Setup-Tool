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

// ─── localStorage implementation ─────────────────────────────────────────────

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

// ─── API repository (server-backed) ─────────────────────────────────────────

export const apiRepository: SetupRepository = {
  async list() {
    const res = await fetch('/api/setups');
    if (!res.ok) throw new Error('Failed to fetch setups');
    return res.json();
  },

  async get(id) {
    const res = await fetch(`/api/setups/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed to fetch setup');
    return res.json();
  },

  async save(setup) {
    const res = await fetch('/api/setups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(setup),
    });
    if (!res.ok) throw new Error('Failed to save setup');
    return res.json();
  },

  async remove(id) {
    const res = await fetch(`/api/setups/${id}`, { method: 'DELETE' });
    if (!res.ok && res.status !== 404) throw new Error('Failed to delete setup');
  },

  async addLapTime(setupId, lapTime) {
    const res = await fetch(`/api/setups/${setupId}/laps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lapTime),
    });
    if (!res.ok) throw new Error('Failed to add lap time');
    return res.json();
  },

  async deleteLapTime(setupId, lapTimeId) {
    const res = await fetch(`/api/setups/${setupId}/laps/${lapTimeId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete lap time');
    return res.json();
  },
};

/** Default repository used throughout the app. */
export const repo = apiRepository;
