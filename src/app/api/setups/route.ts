import { readAllSetups, writeAllSetups } from '@/lib/server-storage';
import { Setup } from '@/types/setup';

export async function GET() {
  const setups = await readAllSetups();
  return Response.json(setups);
}

export async function POST(request: Request) {
  const setup: Setup = await request.json();
  const setups = await readAllSetups();
  const idx = setups.findIndex((s) => s.id === setup.id);
  if (idx >= 0) {
    setups[idx] = setup;
  } else {
    setups.push(setup);
  }
  await writeAllSetups(setups);
  return Response.json(setup);
}
