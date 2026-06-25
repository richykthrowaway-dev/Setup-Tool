import fs from 'fs';
import path from 'path';
import os from 'os';
import { Setup } from '@/types/setup';

/**
 * File-based dev storage with a writable-temp fallback.
 *
 * Production note: on serverless hosts (e.g. Vercel) the project directory is
 * read-only and only the OS temp dir is writable — and even that is ephemeral
 * per invocation. For durable multi-user storage, replace readAllSetups /
 * writeAllSetups with Vercel KV, Neon/Postgres, or Prisma. The client already
 * persists to localStorage, so the API is a best-effort mirror until then.
 */

const PRIMARY_PATH = path.join(process.cwd(), 'data', 'setups.json');
const FALLBACK_PATH = path.join(os.tmpdir(), 'iracing-setups.json');

function tryRead(p: string): Setup[] | null {
  try {
    const raw = fs.readFileSync(p, 'utf-8');
    return JSON.parse(raw) as Setup[];
  } catch {
    return null;
  }
}

function tryWrite(p: string, setups: Setup[]): boolean {
  try {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, JSON.stringify(setups, null, 2));
    return true;
  } catch {
    return false;
  }
}

export async function readAllSetups(): Promise<Setup[]> {
  return tryRead(PRIMARY_PATH) ?? tryRead(FALLBACK_PATH) ?? [];
}

export async function writeAllSetups(setups: Setup[]): Promise<void> {
  // Prefer the project dir (dev); fall back to temp (read-only hosts).
  if (tryWrite(PRIMARY_PATH, setups)) return;
  tryWrite(FALLBACK_PATH, setups);
}
