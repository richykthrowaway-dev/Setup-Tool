'use client';

import { CarSchema, SetupValues } from '@/types/setup';
import { handlingSymptoms, HandlingSymptom } from '@/data/handling';
import { flattenParams, resolveAdjustments } from '@/lib/analysis';
import { useMemo, useState } from 'react';

interface Props {
  schema: CarSchema;
  values: SetupValues;
  onChange: (id: string, value: number | string | boolean) => void;
}

const PHASE_COLORS: Record<HandlingSymptom['phase'], string> = {
  Entry: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  'Mid-corner': 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  Exit: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Braking: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Straights: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
};

export default function HandlingGuide({ schema, values, onChange }: Props) {
  const params = useMemo(() => flattenParams(schema), [schema]);
  const [openId, setOpenId] = useState<string | null>(null);

  // Only show symptoms that have at least one fix applicable to this car.
  const symptoms = useMemo(
    () =>
      handlingSymptoms
        .map((s) => ({
          symptom: s,
          fixes: s.fixes.filter((f) => f.ids.some((id) => params[id]?.type === 'number')),
        }))
        .filter((s) => s.fixes.length > 0),
    [params]
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-400">
        Pick what the car is doing wrong. Each fix is tailored to the {schema.name} and
        can be applied in one step — apply, re-test, repeat.
      </p>

      <div className="space-y-2">
        {symptoms.map(({ symptom, fixes }) => {
          const open = openId === symptom.id;
          return (
            <div
              key={symptom.id}
              className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenId(open ? null : symptom.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-800/50 transition-colors"
              >
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border flex-shrink-0 ${PHASE_COLORS[symptom.phase]}`}
                >
                  {symptom.phase}
                </span>
                <span className="flex-1 text-sm font-medium text-gray-100">
                  {symptom.label}
                </span>
                <span className="text-gray-500 text-xs flex-shrink-0">{open ? '▲' : '▼'}</span>
              </button>

              {open && (
                <div className="px-4 pb-4 pt-1 space-y-3 border-t border-gray-800">
                  <p className="text-xs text-gray-400 leading-relaxed pt-2">
                    {symptom.description}
                  </p>
                  <div className="space-y-2">
                    {fixes.map((fix, i) => {
                      const adj = resolveAdjustments(fix.ids, fix.direction, params, values);
                      if (adj.length === 0) return null;
                      const arrow = fix.direction === 'increase' ? '▲' : '▼';
                      const arrowColor =
                        fix.direction === 'increase' ? 'text-emerald-400' : 'text-amber-400';
                      const allAtLimit = adj.every((a) => a.next === a.current);
                      return (
                        <div
                          key={i}
                          className="flex items-start gap-3 bg-gray-800/40 rounded-lg px-3 py-2"
                        >
                          <span className={`text-xs mt-0.5 flex-shrink-0 ${arrowColor}`}>
                            {arrow}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-200">
                              {fix.direction === 'increase' ? 'Increase' : 'Decrease'}{' '}
                              <span className="font-medium">
                                {adj.map((a) => a.param.label).join(', ')}
                              </span>
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                              {fix.detail}
                            </p>
                          </div>
                          <button
                            disabled={allAtLimit}
                            onClick={() =>
                              adj.forEach((a) => onChange(a.param.id, a.next))
                            }
                            className="flex-shrink-0 text-xs px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium transition-colors"
                            title={
                              allAtLimit
                                ? 'Already at the adjustment limit'
                                : 'Apply one step in this direction'
                            }
                          >
                            {allAtLimit ? 'At limit' : 'Apply'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
