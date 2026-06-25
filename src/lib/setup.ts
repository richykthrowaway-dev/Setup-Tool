import { CarSchema, Setup, SetupValues } from '@/types/setup';
import { repo } from '@/lib/repository';

export { repo };

export function buildDefaultValues(schema: CarSchema): SetupValues {
  const values: SetupValues = {};
  for (const category of schema.categories) {
    for (const param of category.parameters) {
      values[param.id] = param.defaultValue;
    }
  }
  return values;
}

/** @deprecated Use repo.list() */
export function loadSetups(): Setup[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('iracing_setups');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** @deprecated Use repo.save() */
export function saveSetup(setup: Setup): void {
  repo.save(setup);
}

/** @deprecated Use repo.remove() */
export function deleteSetup(id: string): void {
  repo.remove(id);
}

export function createSetup(carId: string, name: string, schema: CarSchema): Setup {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name,
    carId,
    values: buildDefaultValues(schema),
    lapTimes: [],
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
