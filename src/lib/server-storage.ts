import fs from 'fs';
import path from 'path';
import { Setup } from '@/types/setup';

// Production: replace readAllSetups/writeAllSetups with Vercel KV, Neon, or Prisma calls.
const DATA_PATH = path.join(process.cwd(), 'data', 'setups.json');

export async function readAllSetups(): Promise<Setup[]> {
  try {
    fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(raw) as Setup[];
  } catch {
    return [];
  }
}

export async function writeAllSetups(setups: Setup[]): Promise<void> {
  fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
  fs.writeFileSync(DATA_PATH, JSON.stringify(setups, null, 2));
}
