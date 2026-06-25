'use client';

import { CarSchema, Setup } from '@/types/setup';
import { schemas } from '@/data/schemas';
import { flattenParams } from '@/lib/analysis';
import { formatLapTime, computeLapStats } from '@/lib/laptime';
import { useMemo, useState } from 'react';

interface Props {
  setupA: Setup;
  setupB: Setup;
  onBack: () => void;
}

export default function CompareView({ setupA, setupB, onBack }: Props) {
  const [showSame, setShowSame] = useState(false);

  const schemaA = schemas.find((s) => s.id === setupA.carId);
  const schemaB = schemas.find((s) => s.id === setupB.carId);

  const rows = useMemo(() => {
    if (!schemaA || !schemaB) return [];
    const paramsA = flattenParams(schemaA);
    const paramsB = flattenParams(schemaB);

    const allIds = Array.from(new Set([...Object.keys(paramsA), ...Object.keys(paramsB)]));

    return allIds.map((id) => {
      const paramA = paramsA[id];
      const paramB = paramsB[id];
      const valA = setupA.values[id];
      const valB = setupB.values[id];
      const differs =
        valA !== undefined && valB !== undefined && String(valA) !== String(valB);

      let delta: number | null = null;
      if (
        differs &&
        paramA?.type === 'number' &&
        typeof valA === 'number' &&
        typeof valB === 'number'
      ) {
        delta = valB - valA;
      }

      const label = paramA?.label ?? paramB?.label ?? id;
      const unit = paramA?.unit ?? paramB?.unit;
      const categoryLabel = getCategoryLabel(schemaA, id) ?? getCategoryLabel(schemaB, id) ?? '';

      return { id, label, unit, categoryLabel, valA, valB, differs, delta };
    });
  }, [schemaA, schemaB, setupA.values, setupB.values]);

  const diffCount = rows.filter((r) => r.differs).length;
  const visibleRows = showSame ? rows : rows.filter((r) => r.differs || r.valA === undefined || r.valB === undefined);

  const statsA = computeLapStats((setupA.lapTimes ?? []).map((l) => l.lapTimeMs));
  const statsB = computeLapStats((setupB.lapTimes ?? []).map((l) => l.lapTimeMs));

  if (!schemaA || !schemaB) {
    return <div className="p-8 text-gray-400">Schema not found for one or both setups.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-800 px-4 py-3 flex items-center gap-4 sticky top-0 bg-gray-950 z-10">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-gray-100 text-sm flex items-center gap-1 flex-shrink-0"
        >
          ← Back
        </button>
        <h1 className="text-base font-bold text-gray-100 flex-1 min-w-0 truncate">
          Compare Setups
        </h1>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-gray-500">
            {diffCount} difference{diffCount !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => setShowSame((v) => !v)}
            className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
              showSame
                ? 'bg-gray-700 border-gray-600 text-gray-200'
                : 'bg-gray-900 border-gray-700 text-gray-400 hover:text-gray-200'
            }`}
          >
            {showSame ? 'Showing all' : 'Show all'}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Setup name headers */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-end">
          <SetupHeader setup={setupA} schema={schemaA} label="A" />
          <div className="text-xs text-gray-600 font-semibold pb-1">vs</div>
          <SetupHeader setup={setupB} schema={schemaB} label="B" />
        </div>

        {/* Lap time summary */}
        {(statsA || statsB) && (
          <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
            <LapSummary stats={statsA} lapCount={(setupA.lapTimes ?? []).length} side="left" />
            <div className="text-xs text-gray-700 font-semibold text-center">Lap Times</div>
            <LapSummary stats={statsB} lapCount={(setupB.lapTimes ?? []).length} side="right" />
          </div>
        )}

        {/* Parameter diff table */}
        {visibleRows.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-12">
            {diffCount === 0
              ? 'These setups are identical.'
              : 'No differences — toggle “Show all” to see shared parameters.'}
          </p>
        ) : (
          <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_auto_auto_auto_1fr] gap-2 px-4 py-2 border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wide font-semibold">
              <span>{setupA.name}</span>
              <span className="w-8" />
              <span className="w-20 text-center">Δ</span>
              <span className="w-8" />
              <span className="text-right">{setupB.name}</span>
            </div>

            {/* Grouped rows */}
            {groupByCategory(visibleRows).map(({ categoryLabel, rows: catRows }) => (
              <div key={categoryLabel}>
                <div className="px-4 py-1.5 bg-gray-800/40 border-y border-gray-800/60">
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
                    {categoryLabel}
                  </span>
                </div>
                {catRows.map((row) => (
                  <div
                    key={row.id}
                    className={`grid grid-cols-[1fr_auto_auto_auto_1fr] gap-2 px-4 py-2.5 items-center border-b border-gray-800/40 last:border-0 ${
                      row.differs ? 'bg-amber-500/5' : ''
                    }`}
                  >
                    <span className={`text-sm font-mono text-right ${row.differs ? 'text-gray-100 font-semibold' : 'text-gray-500'}`}>
                      {row.valA !== undefined ? `${row.valA}${row.unit ? ' ' + row.unit : ''}` : '—'}
                    </span>
                    <span className="w-8 text-center">
                      {row.differs && row.delta !== null && row.delta < 0 && (
                        <span className="text-emerald-400 text-xs">◄</span>
                      )}
                    </span>
                    <div className="w-32 text-center">
                      <p className="text-xs font-medium text-gray-300 truncate">{row.label}</p>
                      {row.differs && row.delta !== null && (
                        <p className={`text-xs font-mono font-bold mt-0.5 ${row.delta > 0 ? 'text-blue-400' : 'text-emerald-400'}`}>
                          {row.delta > 0 ? '+' : ''}{parseFloat(row.delta.toFixed(4))}{row.unit ? ' ' + row.unit : ''}
                        </p>
                      )}
                      {row.differs && row.delta === null && (
                        <p className="text-xs text-amber-400 font-bold mt-0.5">changed</p>
                      )}
                      {!row.differs && (
                        <p className="text-xs text-gray-700 mt-0.5">same</p>
                      )}
                    </div>
                    <span className="w-8 text-center">
                      {row.differs && row.delta !== null && row.delta > 0 && (
                        <span className="text-blue-400 text-xs">►</span>
                      )}
                    </span>
                    <span className={`text-sm font-mono text-left ${row.differs ? 'text-gray-100 font-semibold' : 'text-gray-500'}`}>
                      {row.valB !== undefined ? `${row.valB}${row.unit ? ' ' + row.unit : ''}` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SetupHeader({ setup, schema, label }: { setup: Setup; schema: CarSchema; label: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-bold text-gray-600 bg-gray-800 border border-gray-700 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
          {label}
        </span>
        <p className="text-sm font-bold text-gray-100 truncate">{setup.name}</p>
      </div>
      <p className="text-xs text-gray-500 ml-7">
        {schema.name}
        {setup.track ? ` · ${setup.track}` : ''}
      </p>
    </div>
  );
}

function LapSummary({
  stats,
  lapCount,
  side,
}: {
  stats: ReturnType<typeof computeLapStats>;
  lapCount: number;
  side: 'left' | 'right';
}) {
  if (!stats) {
    return (
      <p className={`text-xs text-gray-600 ${side === 'right' ? 'text-right' : ''}`}>
        No lap times
      </p>
    );
  }
  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 space-y-1 ${side === 'right' ? 'text-right' : ''}`}>
      <p className="text-emerald-400 font-mono font-bold text-base">{formatLapTime(stats.fastest)}</p>
      <p className="text-xs text-gray-500">
        Best · avg {formatLapTime(Math.round(stats.average))} · {lapCount} lap{lapCount !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

function getCategoryLabel(schema: CarSchema, paramId: string): string | null {
  for (const cat of schema.categories) {
    if (cat.parameters.some((p) => p.id === paramId)) return cat.label;
  }
  return null;
}

type DiffRow = {
  id: string;
  label: string;
  unit?: string;
  categoryLabel: string;
  valA: number | string | boolean | undefined;
  valB: number | string | boolean | undefined;
  differs: boolean;
  delta: number | null;
};

function groupByCategory(rows: DiffRow[]) {
  const map = new Map<string, DiffRow[]>();
  for (const row of rows) {
    const key = row.categoryLabel || 'Other';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(row);
  }
  return Array.from(map.entries()).map(([categoryLabel, rows]) => ({
    categoryLabel,
    rows,
  }));
}
