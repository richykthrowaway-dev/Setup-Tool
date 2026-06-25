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

export interface TechViolation {
  param: Parameter;
  categoryLabel: string;
  value: number;
  limit: number;
  type: 'below_min' | 'above_max';
}

/** Parameters that fail tech inspection limits (techMin / techMax). */
export function computeTechViolations(schema: CarSchema, values: SetupValues): TechViolation[] {
  const violations: TechViolation[] = [];
  for (const category of schema.categories) {
    for (const param of category.parameters) {
      if (param.type !== 'number') continue;
      const val = Number(values[param.id] ?? param.defaultValue);
      if (param.techMin !== undefined && val < param.techMin) {
        violations.push({ param, categoryLabel: category.label, value: val, limit: param.techMin, type: 'below_min' });
      }
      if (param.techMax !== undefined && val > param.techMax) {
        violations.push({ param, categoryLabel: category.label, value: val, limit: param.techMax, type: 'above_max' });
      }
    }
  }
  return violations;
}

// ---------------------------------------------------------------------------
// Tire temperature analysis
// ---------------------------------------------------------------------------

export type TempAdvice =
  | 'good'
  | 'reduce_camber'
  | 'add_camber'
  | 'reduce_pressure'
  | 'add_pressure'
  | 'too_cold'
  | 'too_hot'
  | 'no_data';

export interface CornerTempAnalysis {
  primary: TempAdvice;
  secondary?: TempAdvice;
  detail: string;
}

const CAMBER_THRESHOLD = 12;
const PRESSURE_MIDDLE_HIGH = 12;
const PRESSURE_MIDDLE_LOW = 12;
const TEMP_TOO_COLD = 65;
const TEMP_TOO_HOT = 115;

export function analyzeTireTemps(
  inner: number | null,
  middle: number | null,
  outer: number | null
): CornerTempAnalysis {
  if (inner === null && middle === null && outer === null) {
    return { primary: 'no_data', detail: 'No temperature data entered.' };
  }

  const available = [inner, middle, outer].filter((v): v is number => v !== null);
  const avg = available.reduce((a, b) => a + b, 0) / available.length;

  if (avg < TEMP_TOO_COLD) {
    return { primary: 'too_cold', detail: `Average ${avg.toFixed(0)} °C — tire not up to operating temperature. Data may not be representative.` };
  }
  if (avg > TEMP_TOO_HOT) {
    return { primary: 'too_hot', detail: `Average ${avg.toFixed(0)} °C — tires running very hot. Consider increasing tire pressures or reducing brake duct closure.` };
  }

  const advices: TempAdvice[] = [];
  const details: string[] = [];

  if (inner !== null && outer !== null) {
    const spread = inner - outer;
    if (spread > CAMBER_THRESHOLD) {
      advices.push('reduce_camber');
      details.push(`Inner ${spread.toFixed(0)} °C hotter than outer → reduce negative camber`);
    } else if (spread < -CAMBER_THRESHOLD) {
      advices.push('add_camber');
      details.push(`Outer ${Math.abs(spread).toFixed(0)} °C hotter than inner → add negative camber`);
    }
  }

  if (middle !== null && (inner !== null || outer !== null)) {
    const edgeAvg = ((inner ?? middle) + (outer ?? middle)) / 2;
    const midSpread = middle - edgeAvg;
    if (midSpread > PRESSURE_MIDDLE_HIGH) {
      advices.push('reduce_pressure');
      details.push(`Middle ${midSpread.toFixed(0)} °C hotter than edges → reduce tire pressure`);
    } else if (midSpread < -PRESSURE_MIDDLE_LOW) {
      advices.push('add_pressure');
      details.push(`Middle ${Math.abs(midSpread).toFixed(0)} °C cooler than edges → increase tire pressure`);
    }
  }

  if (advices.length === 0) {
    return { primary: 'good', detail: `Even spread across ${avg.toFixed(0)} °C avg — tire working well.` };
  }

  return {
    primary: advices[0],
    secondary: advices[1],
    detail: details.join('; '),
  };
}

/** A single recommended adjustment within a handling fix. */
export interface ResolvedAdjustment {
  param: Parameter;
  direction: 'increase' | 'decrease';
  current: number;
  /** Value after applying one step in the recommended direction, clamped. */
  next: number;
}

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
