/**
 * SetupRepository — data access abstraction.
 *
 * All UI code calls this interface instead of touching storage directly.
 *
 * Default export `repo` is the **resilient** repository: localStorage is the
 * source of truth (so saves survive a page reload / navigation even on a
 * serverless host like Vercel, where the server filesystem is read-only and
 * ephemeral), with best-effort write-through to the `/api/setups` endpoints.
 * When a real database is wired into the API layer, the server copy becomes a
 * shared, multi-device store with zero UI changes.
 */

import { LapTime, Setup } from '@/types/setup';

export interface SetupRepository {
  list(): Promise<Setup[]>;
  get(id: string): Promise<Setup | null>;
  save(setup: Setup): Promise<Setup>;
  remove(id: string): Promise<void>;
  addLapTime(setupId: string, lapTime: LapTime): Promise<Setup>;
  deleteLapTime(setupId: string, lapTimeId: string): Promise<Setup>;
  /** Bulk upsert — used by file import. */
  importMany(setups: Setup[]): Promise<Setup[]>;
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
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(setups));
  } catch {
    // Quota exceeded or storage disabled — nothing we can do client-side.
  }
}

function upsert(setups: Setup[], setup: Setup): Setup[] {
  const idx = setups.findIndex((s) => s.id === setup.id);
  if (idx >= 0) {
    const next = setups.slice();
    next[idx] = setup;
    return next;
  }
  return [...setups, setup];
}

export const localStorageRepository: SetupRepository = {
  async list() {
    return read();
  },

  async get(id) {
    return read().find((s) => s.id === id) ?? null;
  },

  async save(setup) {
    write(upsert(read(), setup));
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

  async importMany(incoming) {
    let setups = read();
    for (const s of incoming) setups = upsert(setups, s);
    write(setups);
    return setups;
  },
};

// ─── API repository (server-backed) ──────────────────────────────────────────

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

  async importMany(setups) {
    const res = await fetch('/api/setups/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ setups }),
    });
    if (!res.ok) throw new Error('Failed to import setups');
    return res.json();
  },
};

// ─── Resilient repository (default) ──────────────────────────────────────────

/** Fire-and-forget a server write; failures are non-fatal (offline / read-only host). */
function mirror(p: Promise<unknown>): void {
  p.catch(() => {
    /* best-effort sync — localStorage already holds the durable copy */
  });
}

/**
 * localStorage-first repository with background server sync. Reads come from
 * localStorage instantly; on a cold start with empty local storage it seeds
 * from the server (so a shared backend bootstraps the client when present).
 */
export const resilientRepository: SetupRepository = {
  async list() {
    const local = read();
    if (local.length > 0) return local;
    // Cold start: try to seed from the server if one is available.
    try {
      const remote = await apiRepository.list();
      if (Array.isArray(remote) && remote.length > 0) {
        write(remote);
        return remote;
      }
    } catch {
      /* no server / offline — local (possibly empty) is authoritative */
    }
    return local;
  },

  async get(id) {
    return localStorageRepository.get(id);
  },

  async save(setup) {
    const saved = await localStorageRepository.save(setup);
    mirror(apiRepository.save(saved));
    return saved;
  },

  async remove(id) {
    await localStorageRepository.remove(id);
    mirror(apiRepository.remove(id));
  },

  async addLapTime(setupId, lapTime) {
    const updated = await localStorageRepository.addLapTime(setupId, lapTime);
    mirror(apiRepository.save(updated));
    return updated;
  },

  async deleteLapTime(setupId, lapTimeId) {
    const updated = await localStorageRepository.deleteLapTime(setupId, lapTimeId);
    mirror(apiRepository.save(updated));
    return updated;
  },

  async importMany(setups) {
    const all = await localStorageRepository.importMany(setups);
    mirror(apiRepository.importMany(setups));
    return all;
  },
};

/** Default repository used throughout the app. */
export const repo = resilientRepository;
