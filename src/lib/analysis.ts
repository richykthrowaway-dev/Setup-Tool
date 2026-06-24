import { CarSchema, Parameter, SetupValues } from '@/types/setup';

/** Flat lookup of every parameter in a schema, keyed by id. */
export function flattenParams(schema: CarSchema): Record<string, Parameter> {
  const map: Record<string, Parameter> = {};
  for (const category of schema.categories) {
    for (const param of category.parameters) {
      map[param.id] = param;
    }
  }
  return map;
}

export interface Change {
  param: Parameter;
  categoryLabel: string;
  from: number | string | boolean;
  to: number | string | boolean;
  /** Signed numeric delta (to − from); undefined for non-numeric params. */
  delta?: number;
}

/** Every parameter whose current value differs from its default. */
export function computeChanges(schema: CarSchema, values: SetupValues): Change[] {
  const changes: Change[] = [];
  for (const category of schema.categories) {
    for (const param of category.parameters) {
      const current = values[param.id];
      const def = param.defaultValue;
      if (current === undefined || current === def) continue;
      if (Number(current) === Number(def) && param.type === 'number') continue;
      if (String(current) === String(def)) continue;

      const change: Change = {
        param,
        categoryLabel: category.label,
        from: def,
        to: current,
      };
      if (param.type === 'number') {
        change.delta = Number(current) - Number(def);
      }
      changes.push(change);
    }
  }
  return changes;
}

/** A single recommended adjustment within a handling fix. */
export interface ResolvedAdjustment {
  param: Parameter;
  direction: 'increase' | 'decrease';
  current: number;
  /** Value after applying one step in the recommended direction, clamped. */
  next: number;
}

/**
 * Resolve a handling fix against a schema. A fix lists candidate parameter ids
 * (label variants across car classes); every id present in this schema is
 * returned so the advice adapts to whatever car is loaded.
 */
export function resolveAdjustments(
  ids: string[],
  direction: 'increase' | 'decrease',
  params: Record<string, Parameter>,
  values: SetupValues
): ResolvedAdjustment[] {
  const out: ResolvedAdjustment[] = [];
  for (const id of ids) {
    const param = params[id];
    if (!param || param.type !== 'number') continue;
    const current = Number(values[id] ?? param.defaultValue);
    const step = param.step ?? 1;
    const min = param.min ?? -Infinity;
    const max = param.max ?? Infinity;
    const raw = direction === 'increase' ? current + step : current - step;
    const next = Math.min(max, Math.max(min, parseFloat(raw.toFixed(10))));
    out.push({ param, direction, current, next });
  }
  return out;
}
