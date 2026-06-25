import { readAllSetups, writeAllSetups } from '@/lib/server-storage';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; lapId: string }> }
) {
  const { id, lapId } = await params;
  const setups = await readAllSetups();
  const setup = setups.find((s) => s.id === id);
  if (!setup) return new Response('Not found', { status: 404 });
  setup.lapTimes = (setup.lapTimes ?? []).filter((lt) => lt.id !== lapId);
  setup.updatedAt = Date.now();
  await writeAllSetups(setups);
  return Response.json(setup);
}
