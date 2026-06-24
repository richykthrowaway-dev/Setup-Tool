import { CarSchema, Setup, SetupValues } from '@/types/setup';

const STORAGE_KEY = 'iracing_setups';

export function buildDefaultValues(schema: CarSchema): SetupValues {
  const values: SetupValues = {};
  for (const category of schema.categories) {
    for (const param of category.parameters) {
      values[param.id] = param.defaultValue;
    }
  }
  return values;
}

export function loadSetups(): Setup[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSetup(setup: Setup): void {
  const setups = loadSetups();
  const idx = setups.findIndex((s) => s.id === setup.id);
  if (idx >= 0) {
    setups[idx] = setup;
  } else {
    setups.push(setup);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(setups));
}

export function deleteSetup(id: string): void {
  const setups = loadSetups().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(setups));
}

export function createSetup(carId: string, name: string, schema: CarSchema): Setup {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name,
    carId,
    values: buildDefaultValues(schema),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function exportSetupJson(setup: Setup): string {
  return JSON.stringify(setup, null, 2);
}

export function downloadSetup(setup: Setup): void {
  const blob = new Blob([exportSetupJson(setup)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${setup.name.replace(/\s+/g, '_')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
