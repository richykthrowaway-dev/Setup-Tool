import { readAllSetups, writeAllSetups } from '@/lib/server-storage';
import { Setup } from '@/types/setup';

/** Bulk upsert — body: { setups: Setup[] }. Used by file import. */
export async function POST(request: Request) {
  const body = await request.json();
  const incoming: Setup[] = Array.isArray(body?.setups) ? body.setups : [];

  const setups = await readAllSetups();
  for (const setup of incoming) {
    const idx = setups.findIndex((s) => s.id === setup.id);
    if (idx >= 0) {
      setups[idx] = setup;
    } else {
      setups.push(setup);
    }
  }
  await writeAllSetups(setups);
  return Response.json(setups);
}
