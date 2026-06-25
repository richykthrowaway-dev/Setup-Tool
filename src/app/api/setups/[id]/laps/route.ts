import { readAllSetups, writeAllSetups } from '@/lib/server-storage';
import { LapTime } from '@/types/setup';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const lapTime: LapTime = await request.json();
  const setups = await readAllSetups();
  const setup = setups.find((s) => s.id === id);
  if (!setup) return new Response('Not found', { status: 404 });
  setup.lapTimes = [...(setup.lapTimes ?? []), lapTime];
  setup.updatedAt = Date.now();
  await writeAllSetups(setups);
  return Response.json(setup);
}
