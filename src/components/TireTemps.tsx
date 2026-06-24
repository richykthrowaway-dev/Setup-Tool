'use client';

import { CarSchema, SetupValues } from '@/types/setup';
import { analyzeTireTemps, CornerTempAnalysis, TempAdvice, flattenParams, resolveAdjustments } from '@/lib/analysis';
import { useState, useCallback } from 'react';

interface Props {
  schema: CarSchema;
  values: SetupValues;
  onChange: (id: string, value: number | string | boolean) => void;
}

type Corner = 'lf' | 'rf' | 'lr' | 'rr';

interface CornerTemps {
  inner: string;
  middle: string;
  outer: string;
}

const EMPTY: CornerTemps = { inner: '', middle: '', outer: '' };

const CORNER_LABELS: Record<Corner, string> = {
  lf: 'Left Front',
  rf: 'Right Front',
  lr: 'Left Rear',
  rr: 'Right Rear',
};

const CORNER_CAMBER_IDS: Record<Corner, string[]> = {
  lf: ['lf_camber', 'front_camber'],
  rf: ['rf_camber', 'front_camber'],
  lr: ['lr_camber', 'rear_camber'],
  rr: ['rr_camber', 'rear_camber'],
};
const CORNER_PRESSURE_IDS: Record<Corner, string[]> = {
  lf: ['lf_cold_pressure'],
  rf: ['rf_cold_pressure'],
  lr: ['lr_cold_pressure'],
  rr: ['rr_cold_pressure'],
};

const ADVICE_LABEL: Record<TempAdvice, string> = {
  good: 'Good',
  reduce_camber: 'Reduce negative camber',
  add_camber: 'Add negative camber',
  reduce_pressure: 'Reduce pressure',
  add_pressure: 'Increase pressure',
  too_cold: 'Too cold',
  too_hot: 'Too hot overall',
  no_data: '—',
};

const ADVICE_COLOR: Record<TempAdvice, string> = {
  good: 'text-emerald-400',
  reduce_camber: 'text-amber-400',
  add_camber: 'text-amber-400',
  reduce_pressure: 'text-sky-400',
  add_pressure: 'text-sky-400',
  too_cold: 'text-gray-500',
  too_hot: 'text-red-400',
  no_data: 'text-gray-600',
};

function tempColor(t: number): string {
  if (t < 70) return 'bg-blue-900/60 text-blue-300';
  if (t < 85) return 'bg-emerald-900/60 text-emerald-300';
  if (t < 100) return 'bg-amber-900/60 text-amber-300';
  return 'bg-red-900/60 text-red-300';
}

function parseTemp(s: string): number | null {
  const v = parseFloat(s);
  return isNaN(v) ? null : v;
}

function AdviceActions({
  analysis,
  corner,
  schema,
  values,
  onChange,
}: {
  analysis: CornerTempAnalysis;
  corner: Corner;
  schema: CarSchema;
  values: SetupValues;
  onChange: (id: string, value: number | string | boolean) => void;
}) {
  const params = flattenParams(schema);

  const adviceToActions = (advice: TempAdvice) => {
    if (advice === 'reduce_camber') {
      return resolveAdjustments(CORNER_CAMBER_IDS[corner], 'increase', params, values);
    }
    if (advice === 'add_camber') {
      return resolveAdjustments(CORNER_CAMBER_IDS[corner], 'decrease', params, values);
    }
    if (advice === 'reduce_pressure') {
      return resolveAdjustments(CORNER_PRESSURE_IDS[corner], 'decrease', params, values);
    }
    if (advice === 'add_pressure') {
      return resolveAdjustments(CORNER_PRESSURE_IDS[corner], 'increase', params, values);
    }
    return [];
  };

  const advices = [analysis.primary, analysis.secondary].filter(
    (a): a is TempAdvice => !!a && a !== 'good' && a !== 'no_data' && a !== 'too_cold' && a !== 'too_hot'
  );

  if (advices.length === 0) return null;

  return (
    <div className="mt-2 space-y-1">
      {advices.map((advice) => {
        const actions = adviceToActions(advice);
        if (actions.length === 0) return null;
        const allAtLimit = actions.every((a) => a.next === a.current);
        return (
          <button
            key={advice}
            disabled={allAtLimit}
            onClick={() => actions.forEach((a) => onChange(a.param.id, a.next))}
            className="w-full text-left text-xs px-2 py-1 rounded bg-gray-700/50 hover:bg-gray-700 disabled:opacity-40 transition-colors text-gray-300"
          >
            Apply: {ADVICE_LABEL[advice]}
            {actions.map((a) => ` ${a.param.label} → ${a.next}${a.param.unit ? ` ${a.param.unit}` : ''}`).join(',')}
          </button>
        );
      })}
    </div>
  );
}

export default function TireTemps({ schema, values, onChange }: Props) {
  const [temps, setTemps] = useState<Record<Corner, CornerTemps>>({
    lf: { ...EMPTY },
    rf: { ...EMPTY },
    lr: { ...EMPTY },
    rr: { ...EMPTY },
  });

  const update = useCallback((corner: Corner, field: keyof CornerTemps, val: string) => {
    setTemps((prev) => ({ ...prev, [corner]: { ...prev[corner], [field]: val } }));
  }, []);

  const corners: Corner[] = ['lf', 'rf', 'lr', 'rr'];

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-400">
        Enter hot tire temperatures from your last session. Inner / Middle / Outer columns correspond
        to the tire face positions. The builder will diagnose camber and pressure and offer one-click
        corrections.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {corners.map((corner) => {
          const ct = temps[corner];
          const inner = parseTemp(ct.inner);
          const middle = parseTemp(ct.middle);
          const outer = parseTemp(ct.outer);
          const analysis = analyzeTireTemps(inner, middle, outer);
          const hasData = inner !== null || middle !== null || outer !== null;

          return (
            <div key={corner} className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-gray-200">{CORNER_LABELS[corner]}</p>

              <div className="grid grid-cols-3 gap-1 text-center">
                {(['inner', 'middle', 'outer'] as const).map((pos) => {
                  const v = parseTemp(temps[corner][pos]);
                  return (
                    <div key={pos}>
                      <p className="text-[10px] text-gray-600 uppercase mb-1">{pos}</p>
                      <input
                        type="number"
                        value={temps[corner][pos]}
                        onChange={(e) => update(corner, pos, e.target.value)}
                        placeholder="°C"
                        className={`w-full text-center text-sm rounded px-1 py-1.5 outline-none border border-gray-700 focus:border-blue-500 transition-colors ${
                          v !== null ? tempColor(v) : 'bg-gray-800 text-gray-400'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {hasData && (
                <div>
                  <p className={`text-xs font-medium ${ADVICE_COLOR[analysis.primary]}`}>
                    {ADVICE_LABEL[analysis.primary]}
                    {analysis.secondary && analysis.secondary !== analysis.primary && (
                      <span className={`ml-2 ${ADVICE_COLOR[analysis.secondary]}`}>
                        + {ADVICE_LABEL[analysis.secondary]}
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{analysis.detail}</p>
                  <AdviceActions
                    analysis={analysis}
                    corner={corner}
                    schema={schema}
                    values={values}
                    onChange={onChange}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-gray-600">
        Temperatures in °C. Ideal range 75–100 °C with inner slightly higher than outer.
        Even spread across all three positions indicates correct camber and pressure.
      </p>
    </div>
  );
}
