'use client';

import { CarSchema, LapTime, Setup } from '@/types/setup';
import { schemas } from '@/data/schemas';
import { flattenParams } from '@/lib/analysis';
import { parseLapTime, formatLapTime, computeLapStats } from '@/lib/laptime';
import { repo } from '@/lib/repository';
import { useMemo, useState, useRef, useCallback } from 'react';

interface Props {
  setupA: Setup;
  setupB: Setup;
  onBack: () => void;
  onUpdated?: (a: Setup, b: Setup) => void;
}

export default function CompareView({ setupA, setupB, onBack, onUpdated }: Props) {
  const [stateA, setStateA] = useState<Setup>(setupA);
  const [stateB, setStateB] = useState<Setup>(setupB);
  const [diffOpen, setDiffOpen] = useState(false);
  const [showSame, setShowSame] = useState(false);

  const schemaA = schemas.find((s) => s.id === stateA.carId);
  const schemaB = schemas.find((s) => s.id === stateB.carId);

  const lapsA = stateA.lapTimes ?? [];
  const lapsB = stateB.lapTimes ?? [];
  const statsA = computeLapStats(lapsA.map((l) => l.lapTimeMs));
  const statsB = computeLapStats(lapsB.map((l) => l.lapTimeMs));

  const globalFastest = useMemo(() => {
    const all = [...lapsA, ...lapsB].map((l) => l.lapTimeMs);
    return all.length > 0 ? Math.min(...all) : null;
  }, [lapsA, lapsB]);

  const handleAddA = useCallback(
    async (lt: LapTime) => {
      const updated = await repo.addLapTime(stateA.id, lt);
      setStateA(updated);
      onUpdated?.(updated, stateB);
    },
    [stateA.id, stateB, onUpdated]
  );

  const handleAddB = useCallback(
    async (lt: LapTime) => {
      const updated = await repo.addLapTime(stateB.id, lt);
      setStateB(updated);
      onUpdated?.(stateA, updated);
    },
    [stateA, stateB.id, onUpdated]
  );

  const handleDeleteA = useCallback(
    async (lapTimeId: string) => {
      const updated = await repo.deleteLapTime(stateA.id, lapTimeId);
      setStateA(updated);
      onUpdated?.(updated, stateB);
    },
    [stateA.id, stateB, onUpdated]
  );

  const handleDeleteB = useCallback(
    async (lapTimeId: string) => {
      const updated = await repo.deleteLapTime(stateB.id, lapTimeId);
      setStateB(updated);
      onUpdated?.(stateA, updated);
    },
    [stateA, stateB.id, onUpdated]
  );

  // Winner banner
  let winnerBanner: React.ReactNode = null;
  if (statsA && statsB) {
    const diff = statsA.fastest - statsB.fastest;
    if (Math.abs(diff) < 1) {
      winnerBanner = <span className="text-gray-400 font-semibold">Tied</span>;
    } else if (diff < 0) {
      winnerBanner = (
        <>
          <span className="font-bold text-blue-300">A</span>
          <span className="text-gray-400"> leads by </span>
          <span className="font-mono font-bold text-emerald-400">{(Math.abs(diff) / 1000).toFixed(3)}s</span>
        </>
      );
    } else {
      winnerBanner = (
        <>
          <span className="font-bold text-purple-300">B</span>
          <span className="text-gray-400"> leads by </span>
          <span className="font-mono font-bold text-emerald-400">{(Math.abs(diff) / 1000).toFixed(3)}s</span>
        </>
      );
    }
  }

  // Parameter diff rows
  const rows = useMemo(() => {
    if (!schemaA || !schemaB) return [];
    const paramsA = flattenParams(schemaA);
    const paramsB = flattenParams(schemaB);
    const allIds = Array.from(new Set([...Object.keys(paramsA), ...Object.keys(paramsB)]));
    return allIds.map((id) => {
      const paramA = paramsA[id];
      const paramB = paramsB[id];
      const valA = stateA.values[id];
      const valB = stateB.values[id];
      const differs = valA !== undefined && valB !== undefined && String(valA) !== String(valB);
      let delta: number | null = null;
      if (differs && paramA?.type === 'number' && typeof valA === 'number' && typeof valB === 'number') {
        delta = valB - valA;
      }
      const label = paramA?.label ?? paramB?.label ?? id;
      const unit = paramA?.unit ?? paramB?.unit;
      const categoryLabel = getCategoryLabel(schemaA, id) ?? getCategoryLabel(schemaB, id) ?? '';
      return { id, label, unit, categoryLabel, valA, valB, differs, delta };
    });
  }, [schemaA, schemaB, stateA.values, stateB.values]);

  const diffCount = rows.filter((r) => r.differs).length;
  const visibleRows = showSame
    ? rows
    : rows.filter((r) => r.differs || r.valA === undefined || r.valB === undefined);

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
        <h1 className="text-base font-bold text-gray-100 flex-1">Session Compare</h1>
        {winnerBanner && (
          <div className="text-sm px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg flex-shrink-0">
            {winnerBanner}
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Side-by-side lap panels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <LapPanel
            label="A"
            setup={stateA}
            schema={schemaA}
            stats={statsA}
            globalFastest={globalFastest}
            onAdd={handleAddA}
            onDelete={handleDeleteA}
            accentColor="blue"
          />
          <LapPanel
            label="B"
            setup={stateB}
            schema={schemaB}
            stats={statsB}
            globalFastest={globalFastest}
            onAdd={handleAddB}
            onDelete={handleDeleteB}
            accentColor="purple"
          />
        </div>

        {/* Collapsible parameter diff */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          <button
            onClick={() => setDiffOpen((v) => !v)}
            className="w-full px-4 py-3 flex items-center justify-between text-sm font-semibold text-gray-300 hover:text-gray-100 transition-colors"
          >
            <span>
              Parameter Diff
              {diffCount > 0 && (
                <span className="ml-2 font-normal text-amber-400">
                  ({diffCount} difference{diffCount !== 1 ? 's' : ''})
                </span>
              )}
            </span>
            <span className="text-gray-600 text-xs">{diffOpen ? '▲' : '▼'}</span>
          </button>

          {diffOpen && (
            <>
              <div className="flex items-center justify-between px-4 py-2 border-t border-gray-800">
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

              {/* Column headers */}
              <div className="grid grid-cols-[1fr_auto_auto_auto_1fr] gap-2 px-4 py-2 border-t border-gray-800 text-xs text-gray-500 uppercase tracking-wide font-semibold">
                <span className="truncate">{stateA.name}</span>
                <span className="w-8" />
                <span className="w-20 text-center">Δ</span>
                <span className="w-8" />
                <span className="text-right truncate">{stateB.name}</span>
              </div>

              {visibleRows.length === 0 ? (
                <p className="text-center text-gray-500 text-sm py-8 border-t border-gray-800">
                  {diffCount === 0 ? 'These setups are identical.' : 'No differences shown.'}
                </p>
              ) : (
                groupByCategory(visibleRows).map(({ categoryLabel, rows: catRows }) => (
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
                        <span
                          className={`text-sm font-mono text-right ${
                            row.differs ? 'text-gray-100 font-semibold' : 'text-gray-500'
                          }`}
                        >
                          {row.valA !== undefined ? `${row.valA}${row.unit ? ' ' + row.unit : ''}` : '—'}
                        </span>
                        <span className="w-8 text-center">
                          {row.differs && row.delta !== null && row.delta < 0 && (
                            <span className="text-emerald-400 text-xs">◀</span>
                          )}
                        </span>
                        <div className="w-32 text-center">
                          <p className="text-xs font-medium text-gray-300 truncate">{row.label}</p>
                          {row.differs && row.delta !== null && (
                            <p
                              className={`text-xs font-mono font-bold mt-0.5 ${
                                row.delta > 0 ? 'text-blue-400' : 'text-emerald-400'
                              }`}
                            >
                              {row.delta > 0 ? '+' : ''}
                              {parseFloat(row.delta.toFixed(4))}
                              {row.unit ? ' ' + row.unit : ''}
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
                            <span className="text-blue-400 text-xs">▶</span>
                          )}
                        </span>
                        <span
                          className={`text-sm font-mono text-left ${
                            row.differs ? 'text-gray-100 font-semibold' : 'text-gray-500'
                          }`}
                        >
                          {row.valB !== undefined ? `${row.valB}${row.unit ? ' ' + row.unit : ''}` : '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── LapPanel ─────────────────────────────────────────────────────────────────

interface LapPanelProps {
  label: string;
  setup: Setup;
  schema: CarSchema | undefined;
  stats: ReturnType<typeof computeLapStats>;
  globalFastest: number | null;
  onAdd: (lt: LapTime) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  accentColor: 'blue' | 'purple';
}

function LapPanel({
  label,
  setup,
  schema,
  stats,
  globalFastest,
  onAdd,
  onDelete,
  accentColor,
}: LapPanelProps) {
  const [input, setInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const borderColor = accentColor === 'blue' ? 'border-blue-800' : 'border-purple-800';
  const badgeClass =
    accentColor === 'blue'
      ? 'text-blue-300 bg-blue-900/40 border-blue-700'
      : 'text-purple-300 bg-purple-900/40 border-purple-700';

  const lapTimes = setup.lapTimes ?? [];
  const fastestInSetup = stats?.fastest ?? null;

  const handleAdd = async () => {
    const ms = parseLapTime(input);
    if (ms === null) {
      setError('Use  1:52.341  or  52.341');
      return;
    }
    setError('');
    const lt: LapTime = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      lapTimeMs: ms,
      note: noteInput.trim() || undefined,
      recordedAt: Date.now(),
    };
    await onAdd(lt);
    setInput('');
    setNoteInput('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <div className={`bg-gray-900 border ${borderColor} rounded-xl overflow-hidden flex flex-col`}>
      {/* Setup header */}
      <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-3">
        <span
          className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border flex-shrink-0 ${badgeClass}`}
        >
          {label}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-100 truncate">{setup.name}</p>
          <p className="text-xs text-gray-500 truncate">
            {schema?.name ?? setup.carId}
            {setup.track ? ` · ${setup.track}` : ''}
          </p>
        </div>
        {stats && (
          <div className="text-right flex-shrink-0">
            <p className="text-base font-mono font-bold text-emerald-400">
              {formatLapTime(stats.fastest)}
            </p>
            <p className="text-[10px] text-gray-600">best</p>
          </div>
        )}
      </div>

      {/* Quick stats row */}
      {stats && (
        <div className="grid grid-cols-3 divide-x divide-gray-800 border-b border-gray-800">
          <div className="px-3 py-2 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">Avg</p>
            <p className="text-xs font-mono font-semibold text-gray-200">
              {formatLapTime(Math.round(stats.average))}
            </p>
          </div>
          <div className="px-3 py-2 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">Laps</p>
            <p className="text-xs font-mono font-semibold text-gray-200">{stats.count}</p>
          </div>
          <div className="px-3 py-2 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">Consist.</p>
            <p className="text-xs font-mono font-semibold text-gray-200">
              ±{(stats.stdDev / 1000).toFixed(3)}s
            </p>
          </div>
        </div>
      )}

      {/* Input row */}
      <div className="px-3 py-3 border-b border-gray-800 space-y-1.5">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(''); }}
            onKeyDown={handleKeyDown}
            placeholder="1:52.341"
            className="bg-gray-800 border border-gray-600 text-gray-100 text-sm rounded-lg px-3 py-1.5 w-28 outline-none focus:border-blue-500 font-mono flex-shrink-0"
          />
          <input
            type="text"
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Note (opt.)"
            className="bg-gray-800 border border-gray-600 text-gray-100 text-sm rounded-lg px-3 py-1.5 flex-1 min-w-0 outline-none focus:border-blue-500"
          />
          <button
            onClick={handleAdd}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-colors flex-shrink-0"
          >
            +
          </button>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      {/* Lap list */}
      <div className="divide-y divide-gray-800/60 overflow-y-auto max-h-60">
        {lapTimes.length === 0 ? (
          <p className="text-xs text-gray-600 text-center py-6">No laps yet — enter one above</p>
        ) : (
          [...lapTimes]
            .sort((a, b) => a.recordedAt - b.recordedAt)
            .map((lt, i) => {
              const isFastestHere = fastestInSetup !== null && lt.lapTimeMs === fastestInSetup;
              const isGlobalBest = globalFastest !== null && lt.lapTimeMs === globalFastest;
              const delta = globalFastest !== null ? lt.lapTimeMs - globalFastest : 0;
              return (
                <div key={lt.id} className="px-3 py-2 flex items-center gap-2 group">
                  <span className="text-xs text-gray-600 w-5 flex-shrink-0 text-right">{i + 1}</span>
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span
                      className={`text-sm font-mono font-semibold ${
                        isFastestHere ? 'text-emerald-400' : 'text-gray-200'
                      }`}
                    >
                      {formatLapTime(lt.lapTimeMs)}
                    </span>
                    {isGlobalBest && (
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-1.5 py-0.5 flex-shrink-0">
                        BEST
                      </span>
                    )}
                    {!isGlobalBest && delta > 0 && (
                      <span className="text-[10px] text-red-400 font-mono flex-shrink-0">
                        +{(delta / 1000).toFixed(3)}
                      </span>
                    )}
                  </div>
                  {lt.note && (
                    <span className="text-xs text-gray-500 truncate max-w-[80px] flex-shrink-0">
                      {lt.note}
                    </span>
                  )}
                  <button
                    onClick={() => onDelete(lt.id)}
                    className="text-gray-700 hover:text-red-400 text-xs flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove lap"
                  >
                    ✕
                  </button>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  return Array.from(map.entries()).map(([categoryLabel, rows]) => ({ categoryLabel, rows }));
}
