import { readAllSetups, writeAllSetups } from '@/lib/server-storage';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const setups = await readAllSetups();
  const setup = setups.find((s) => s.id === id);
  if (!setup) return new Response('Not found', { status: 404 });
  return Response.json(setup);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const setups = await readAllSetups();
  const idx = setups.findIndex((s) => s.id === id);
  if (idx < 0) return new Response('Not found', { status: 404 });
  setups[idx] = { ...setups[idx], ...body };
  await writeAllSetups(setups);
  return Response.json(setups[idx]);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const setups = await readAllSetups();
  await writeAllSetups(setups.filter((s) => s.id !== id));
  return new Response(null, { status: 204 });
}
