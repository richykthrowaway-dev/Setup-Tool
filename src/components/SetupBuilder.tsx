'use client';

import { CarSchema, Setup } from '@/types/setup';
import CategoryPanel from './CategoryPanel';
import ChangesPanel from './ChangesPanel';
import HandlingGuide from './HandlingGuide';
import KnowledgeBase from './KnowledgeBase';
import TireTemps from './TireTemps';
import LapTimePanel from './LapTimePanel';
import { createSetup, downloadSetup } from '@/lib/setup';
import { repo } from '@/lib/repository';
import { computeChanges, computeTechViolations } from '@/lib/analysis';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

type Tab = 'tune' | 'changes' | 'handling' | 'tiretemps' | 'laptimes' | 'knowledge';

interface Props {
  schema: CarSchema;
  existingSetup?: Setup;
  /** Other saved setups for the same car — used to populate the Compare dropdown. */
  peerSetups?: Setup[];
  onSaved?: (setup: Setup) => void;
  onBack?: () => void;
  onCompare?: (a: Setup, b: Setup) => void;
}

export default function SetupBuilder({ schema, existingSetup, peerSetups, onSaved, onBack, onCompare }: Props) {
  const [setup, setSetup] = useState<Setup>(() => {
    if (existingSetup) return existingSetup;
    return createSetup(schema.id, `New ${schema.name} Setup`, schema);
  });
  const [savedBanner, setSavedBanner] = useState(false);
  const [tab, setTab] = useState<Tab>('tune');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [compareOpen, setCompareOpen] = useState(false);
  const compareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (existingSetup) setSetup(existingSetup);
  }, [existingSetup]);

  // Close compare dropdown when clicking outside
  useEffect(() => {
    if (!compareOpen) return;
    const handler = (e: MouseEvent) => {
      if (compareRef.current && !compareRef.current.contains(e.target as Node)) {
        setCompareOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [compareOpen]);

  const changes = useMemo(
    () => computeChanges(schema, setup.values),
    [schema, setup.values]
  );

  const violationCount = useMemo(
    () => computeTechViolations(schema, setup.values).length,
    [schema, setup.values]
  );

  const handleResetAll = useCallback(() => {
    setSetup((prev) => {
      const values = { ...prev.values };
      for (const category of schema.categories) {
        for (const param of category.parameters) {
          values[param.id] = param.defaultValue;
        }
      }
      return { ...prev, values, updatedAt: Date.now() };
    });
  }, [schema]);

  const handleChange = useCallback((id: string, value: number | string | boolean) => {
    setSetup((prev) => ({
      ...prev,
      values: { ...prev.values, [id]: value },
      updatedAt: Date.now(),
    }));
  }, []);

  const handleSave = async () => {
    const saved = await repo.save(setup);
    setSetup(saved);
    setSavedBanner(true);
    onSaved?.(saved);
    setTimeout(() => setSavedBanner(false), 2500);
  };

  const handleNameChange = (name: string) => {
    setSetup((prev) => ({ ...prev, name, updatedAt: Date.now() }));
  };

  const handleTrackChange = (track: string) => {
    setSetup((prev) => ({ ...prev, track, updatedAt: Date.now() }));
  };

  const handleNotesChange = (notes: string) => {
    setSetup((prev) => ({ ...prev, notes, updatedAt: Date.now() }));
  };

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-gray-100">
      {/* Header */}
      <div className="z-10 bg-gray-950 border-b border-gray-800 px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-gray-100 text-sm flex items-center gap-1"
            >
              ← Back
            </button>
          )}
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={setup.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="bg-transparent text-lg font-bold text-gray-100 w-full outline-none border-b border-transparent focus:border-blue-500 transition-colors"
              placeholder="Setup name"
            />
            <p className="text-xs text-gray-500 mt-0.5">{schema.name} — {schema.class}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {savedBanner && (
              <span className="text-green-400 text-sm animate-pulse">Saved!</span>
            )}
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                sidebarOpen
                  ? 'bg-gray-700 text-gray-200'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200'
              }`}
            >
              Changes{changes.length > 0 ? ` (${changes.length})` : ''}{violationCount > 0 ? ' ⚠' : ''}
            </button>

            {/* Compare dropdown — only shown when there are peer setups */}
            {onCompare && peerSetups && peerSetups.length > 0 && (
              <div className="relative" ref={compareRef}>
                <button
                  onClick={() => setCompareOpen((v) => !v)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    compareOpen
                      ? 'bg-emerald-700 border-emerald-600 text-white'
                      : 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300 hover:text-gray-100'
                  }`}
                >
                  Compare ▾
                </button>
                {compareOpen && (
                  <div className="absolute right-0 top-full mt-1 z-50 bg-gray-900 border border-gray-700 rounded-xl shadow-xl w-56 overflow-hidden">
                    <p className="px-3 py-2 text-[10px] text-gray-500 uppercase tracking-widest border-b border-gray-800">
                      Compare with…
                    </p>
                    <div className="max-h-52 overflow-y-auto divide-y divide-gray-800/60">
                      {peerSetups.map((peer) => (
                        <button
                          key={peer.id}
                          onClick={() => { setCompareOpen(false); onCompare(setup, peer); }}
                          className="w-full text-left px-3 py-2.5 hover:bg-gray-800 transition-colors"
                        >
                          <p className="text-sm text-gray-200 font-medium truncate">{peer.name}</p>
                          {peer.track && (
                            <p className="text-xs text-gray-500 truncate mt-0.5">{peer.track}</p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => downloadSetup(setup)}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors"
            >
              Export JSON
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Save
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mt-3 -mb-px">
          {([
            ['tune', 'Tune'],
            ['changes', `Changes${changes.length ? ` (${changes.length})` : ''}${violationCount ? ` ⚠` : ''}`],
            ['handling', 'Handling Guide'],
            ['tiretemps', 'Tire Temps'],
            ['laptimes', `Lap Times${(setup.lapTimes?.length ?? 0) > 0 ? ` (${setup.lapTimes!.length})` : ''}`],
            ['knowledge', 'Knowledge'],
          ] as [Tab, string][]).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                tab === id
                  ? 'border-blue-500 text-gray-100'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Body: main content + sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {tab === 'changes' && (
            <ChangesPanel
              schema={schema}
              values={setup.values}
              onReset={handleChange}
              onResetAll={handleResetAll}
            />
          )}

          {tab === 'handling' && (
            <HandlingGuide schema={schema} values={setup.values} onChange={handleChange} />
          )}

          {tab === 'tiretemps' && (
            <TireTemps schema={schema} values={setup.values} onChange={handleChange} />
          )}

          {tab === 'knowledge' && (
            <KnowledgeBase />
          )}

          {tab === 'laptimes' && (
            <LapTimePanel
              setup={setup}
              onUpdated={(updated) => {
                setSetup(updated);
                onSaved?.(updated);
              }}
            />
          )}

          {tab === 'tune' && (
            <>
              {/* Metadata */}
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">Track</label>
                  <input
                    type="text"
                    value={setup.track ?? ''}
                    onChange={(e) => handleTrackChange(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-100 outline-none focus:border-blue-500"
                    placeholder="e.g. Sebring International Raceway"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">Notes</label>
                  <input
                    type="text"
                    value={setup.notes ?? ''}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-100 outline-none focus:border-blue-500"
                    placeholder="Conditions, session, etc."
                  />
                </div>
              </div>

              {/* Categories */}
              {schema.categories.map((category) => (
                <CategoryPanel
                  key={category.id}
                  category={category}
                  values={setup.values}
                  onChange={handleChange}
                />
              ))}
            </>
          )}
        </main>

        {/* Collapsible changes sidebar */}
        <aside
          className={`flex-shrink-0 border-l border-gray-800 bg-gray-950 overflow-hidden transition-all duration-200 ${
            sidebarOpen ? 'w-72' : 'w-0'
          }`}
        >
          <div className="w-72 h-full flex flex-col">
            {/* Sidebar header */}
            <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
              <span className="text-sm font-semibold text-gray-200">
                Changes{' '}
                {changes.length > 0 && (
                  <span className="text-blue-400">({changes.length})</span>
                )}
              </span>
              {changes.length > 0 && (
                <button
                  onClick={handleResetAll}
                  className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                >
                  Reset all
                </button>
              )}
            </div>

            {/* Tech violations banner */}
            {violationCount > 0 && (
              <div className="px-4 py-2 bg-red-950/40 border-b border-red-800/40 flex-shrink-0">
                <p className="text-xs text-red-400 font-semibold">
                  ⚠ {violationCount} tech violation{violationCount > 1 ? 's' : ''}
                </p>
              </div>
            )}

            {/* Changes list */}
            <div className="flex-1 overflow-y-auto">
              {changes.length === 0 ? (
                <p className="text-xs text-gray-600 px-4 py-8 text-center leading-relaxed">
                  No changes from baseline.
                  <br />Adjust values in the Tune tab.
                </p>
              ) : (
                <div className="divide-y divide-gray-800/60">
                  {changes.map(({ param, categoryLabel, from, to, delta }) => (
                    <div key={param.id} className="px-4 py-2.5 flex items-center gap-2 group">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-200 font-medium truncate">{param.label}</p>
                        <p className="text-[10px] text-gray-600 truncate">{categoryLabel}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {delta !== undefined ? (
                          <span
                            className={`text-xs font-bold ${
                              delta > 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            {delta > 0 ? '+' : ''}{parseFloat(delta.toFixed(4))}
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-amber-400">~</span>
                        )}
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {String(from)} → {String(to)}{param.unit ? ` ${param.unit}` : ''}
                        </p>
                      </div>
                      <button
                        onClick={() => handleChange(param.id, param.defaultValue)}
                        className="text-gray-700 hover:text-gray-300 text-xs flex-shrink-0 ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Reset to baseline"
                      >
                        ↺
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
