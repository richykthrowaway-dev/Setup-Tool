'use client';

import { CarSchema, Parameter, SetupValues } from '@/types/setup';
import { computeChanges } from '@/lib/analysis';

interface Props {
  schema: CarSchema;
  values: SetupValues;
  onReset: (id: string, value: number | string | boolean) => void;
  onResetAll: () => void;
}

function displayValue(param: Parameter, value: number | string | boolean): string {
  if (param.type === 'select') {
    const opt = param.options?.find((o) => String(o.value) === String(value));
    return opt?.label ?? String(value);
  }
  const unit = param.unit ? ` ${param.unit}` : '';
  return `${value}${unit}`;
}

export default function ChangesPanel({ schema, values, onReset, onResetAll }: Props) {
  const changes = computeChanges(schema, values);

  if (changes.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 text-center">
        <p className="text-gray-400 text-sm">
          No changes yet — this setup matches the {schema.name} baseline.
        </p>
        <p className="text-gray-600 text-xs mt-1">
          Adjust values in the Tune tab and they will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          <span className="text-gray-100 font-semibold">{changes.length}</span>{' '}
          change{changes.length === 1 ? '' : 's'} from baseline
        </p>
        <button
          onClick={onResetAll}
          className="text-xs text-gray-400 hover:text-red-400 transition-colors"
        >
          Reset all to baseline
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-xl divide-y divide-gray-800">
        {changes.map(({ param, categoryLabel, from, to, delta }) => (
          <div key={param.id} className="flex items-center gap-3 px-4 py-2.5">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-200 font-medium truncate">{param.label}</p>
              <p className="text-xs text-gray-600">{categoryLabel}</p>
            </div>
            <div className="flex items-center gap-2 text-sm flex-shrink-0">
              <span className="text-gray-500">{displayValue(param, from)}</span>
              <span className="text-gray-600">→</span>
              <span className="text-gray-100 font-semibold">{displayValue(param, to)}</span>
              {delta !== undefined && delta !== 0 && (
                <span
                  className={`text-xs font-medium ${
                    delta > 0 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {delta > 0 ? '+' : ''}
                  {parseFloat(delta.toFixed(4))}
                </span>
              )}
            </div>
            <button
              onClick={() => onReset(param.id, param.defaultValue)}
              className="text-gray-600 hover:text-gray-300 text-xs flex-shrink-0"
              title="Reset to baseline"
            >
              ↺
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
