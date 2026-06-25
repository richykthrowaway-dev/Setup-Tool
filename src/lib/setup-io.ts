/**
 * Setup import / export — a versioned, self-describing file format so setups
 * can be saved to disk, shared, and re-imported reliably (front to back).
 *
 * The exported file is a JSON envelope:
 *   {
 *     "format": "iracing-setup-tool",
 *     "version": 1,
 *     "exportedAt": 1719300000000,
 *     "setups": [ { ...Setup }, ... ]
 *   }
 *
 * `parseImport` is lenient — it accepts the envelope above, a bare array of
 * setups, or a single bare Setup (the legacy single-file export). Every setup
 * is validated before it is returned so a malformed file can never corrupt the
 * store.
 */

import { LapTime, Setup, SetupValues } from '@/types/setup';

export const EXPORT_FORMAT = 'iracing-setup-tool';
export const EXPORT_VERSION = 1;

export interface SetupExportEnvelope {
  format: typeof EXPORT_FORMAT;
  version: number;
  exportedAt: number;
  setups: Setup[];
}

// ─── Validation ───────────────────────────────────────────────────────────────────────────────

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isValidLapTime(v: unknown): v is LapTime {
  if (!isPlainObject(v)) return false;
  return (
    typeof v.id === 'string' &&
    typeof v.lapTimeMs === 'number' &&
    typeof v.recordedAt === 'number'
  );
}

/** Structural validation — guards against importing arbitrary JSON. */
export function isValidSetup(v: unknown): v is Setup {
  if (!isPlainObject(v)) return false;
  if (typeof v.id !== 'string' || v.id.length === 0) return false;
  if (typeof v.name !== 'string') return false;
  if (typeof v.carId !== 'string' || v.carId.length === 0) return false;
  if (!isPlainObject(v.values)) return false;
  if (typeof v.createdAt !== 'number') return false;
  if (typeof v.updatedAt !== 'number') return false;
  if (v.lapTimes !== undefined) {
    if (!Array.isArray(v.lapTimes)) return false;
    if (!v.lapTimes.every(isValidLapTime)) return false;
  }
  return true;
}

/** Coerce a loosely-typed object into a normalized Setup (fills defaults). */
function normalizeSetup(raw: Record<string, unknown>): Setup {
  const now = Date.now();
  // Required identity fields stay empty when absent so validation rejects them
  // (String(undefined) would otherwise produce the literal "undefined").
  return {
    id: raw.id != null ? String(raw.id) : '',
    name: typeof raw.name === 'string' && raw.name.trim() ? raw.name : 'Imported Setup',
    carId: raw.carId != null ? String(raw.carId) : '',
    track: typeof raw.track === 'string' ? raw.track : undefined,
    notes: typeof raw.notes === 'string' ? raw.notes : undefined,
    values: (raw.values ?? {}) as SetupValues,
    lapTimes: Array.isArray(raw.lapTimes) ? (raw.lapTimes as LapTime[]) : [],
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : now,
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : now,
  };
}

// ─── Export ─────────────────────────────────────────────────────────────────────────────────

export function buildExportEnvelope(setups: Setup[]): SetupExportEnvelope {
  return {
    format: EXPORT_FORMAT,
    version: EXPORT_VERSION,
    exportedAt: Date.now(),
    setups,
  };
}

/** Pretty-printed JSON for a single setup (envelope-wrapped). */
export function exportSetupJson(setup: Setup): string {
  return JSON.stringify(buildExportEnvelope([setup]), null, 2);
}

/** Pretty-printed JSON for many setups (envelope-wrapped). */
export function exportSetupsJson(setups: Setup[]): string {
  return JSON.stringify(buildExportEnvelope(setups), null, 2);
}

function slugify(s: string): string {
  return (
    s
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 60) || 'setup'
  );
}

function triggerDownload(json: string, filename: string): void {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Download a single setup as `<name>[_<track>].setup.json`. */
export function downloadSetup(setup: Setup): void {
  const parts = [slugify(setup.name)];
  if (setup.track) parts.push(slugify(setup.track));
  triggerDownload(exportSetupJson(setup), `${parts.join('_')}.setup.json`);
}

/** Download many setups as one backup file. */
export function downloadSetups(setups: Setup[], filename?: string): void {
  const stamp = new Date().toISOString().slice(0, 10);
  triggerDownload(
    exportSetupsJson(setups),
    filename ?? `sim-setups-${stamp}.json`
  );
}

// ─── Import ─────────────────────────────────────────────────────────────────────────────────

export class SetupImportError extends Error {}

/**
 * Parse raw file text into a list of valid setups.
 * Accepts the export envelope, a bare array, or a single bare Setup.
 * Throws SetupImportError with a human-readable message on failure.
 */
export function parseImport(raw: string): Setup[] {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new SetupImportError('File is not valid JSON.');
  }

  // Envelope form
  let candidates: unknown[];
  if (isPlainObject(data) && Array.isArray((data as { setups?: unknown }).setups)) {
    candidates = (data as { setups: unknown[] }).setups;
  } else if (Array.isArray(data)) {
    candidates = data;
  } else if (isPlainObject(data)) {
    // Single bare setup (legacy export)
    candidates = [data];
  } else {
    throw new SetupImportError('Unrecognized file structure.');
  }

  if (candidates.length === 0) {
    throw new SetupImportError('File contains no setups.');
  }

  const setups: Setup[] = [];
  for (const c of candidates) {
    if (!isPlainObject(c)) continue;
    const normalized = normalizeSetup(c);
    if (isValidSetup(normalized)) setups.push(normalized);
  }

  if (setups.length === 0) {
    throw new SetupImportError('No valid setups found in file.');
  }

  return setups;
}

/** Read a File (from an <input type="file">) as text. */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new SetupImportError('Could not read file.'));
    reader.readAsText(file);
  });
}

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Reconcile imported setups against the existing store. Any imported setup
 * whose id already exists is given a fresh id and a " (imported)" name suffix
 * so an import never silently overwrites existing work.
 */
export function reconcileImported(imported: Setup[], existing: Setup[]): Setup[] {
  const existingIds = new Set(existing.map((s) => s.id));
  return imported.map((s) => {
    if (!existingIds.has(s.id)) {
      existingIds.add(s.id);
      return s;
    }
    const fresh = newId();
    existingIds.add(fresh);
    return {
      ...s,
      id: fresh,
      name: /\(imported\)$/.test(s.name) ? s.name : `${s.name} (imported)`,
      updatedAt: Date.now(),
    };
  });
}
