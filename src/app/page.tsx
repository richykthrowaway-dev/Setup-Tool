'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { schemas } from '@/data/schemas';
import { CarSchema, Setup } from '@/types/setup';
import { repo } from '@/lib/repository';
import {
  downloadSetups,
  parseImport,
  reconcileImported,
  readFileAsText,
  SetupImportError,
} from '@/lib/setup-io';
import SetupBuilder from '@/components/SetupBuilder';
import SetupList from '@/components/SetupList';
import CompareView from '@/components/CompareView';

type View = 'home' | 'builder' | 'compare';

const CLASS_COLORS: Record<string, string> = {
  GT3: 'bg-blue-900 text-blue-300 border-blue-700',
  GT4: 'bg-indigo-900 text-indigo-300 border-indigo-700',
  GTP: 'bg-purple-900 text-purple-300 border-purple-700',
  Formula: 'bg-red-900 text-red-300 border-red-700',
  SportsCar: 'bg-yellow-900 text-yellow-300 border-yellow-700',
  Oval: 'bg-orange-900 text-orange-300 border-orange-700',
  LateModel: 'bg-orange-900 text-orange-200 border-orange-700',
  StreetStock: 'bg-gray-800 text-gray-300 border-gray-600',
};

export default function Home() {
  const [view, setView] = useState<View>('home');
  const [activeSchema, setActiveSchema] = useState<CarSchema | null>(null);
  const [activeSetup, setActiveSetup] = useState<Setup | undefined>(undefined);
  const [compareSetups, setCompareSetups] = useState<[Setup, Setup] | null>(null);
  const [savedSetups, setSavedSetups] = useState<Setup[]>([]);
  const [ioMessage, setIoMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refresh = () => repo.list().then(setSavedSetups);

  useEffect(() => { refresh(); }, []);

  const flash = (kind: 'ok' | 'error', text: string) => {
    setIoMessage({ kind, text });
    setTimeout(() => setIoMessage(null), 4000);
  };

  const handleExportAll = () => {
    if (savedSetups.length === 0) return;
    downloadSetups(savedSetups);
    flash('ok', `Exported ${savedSetups.length} setup${savedSetups.length !== 1 ? 's' : ''}.`);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-importing the same file
    if (!file) return;
    try {
      const text = await readFileAsText(file);
      const parsed = parseImport(text);
      const existing = await repo.list();
      const reconciled = reconcileImported(parsed, existing);
      await repo.importMany(reconciled);
      await refresh();
      flash('ok', `Imported ${reconciled.length} setup${reconciled.length !== 1 ? 's' : ''}.`);
    } catch (err) {
      const msg = err instanceof SetupImportError ? err.message : 'Import failed.';
      flash('error', msg);
    }
  };

  // Group saved setups by car id for per-class sections
  const setupsByCarId = useMemo(() => {
    const map = new Map<string, Setup[]>();
    for (const s of savedSetups) {
      if (!map.has(s.carId)) map.set(s.carId, []);
      map.get(s.carId)!.push(s);
    }
    return map;
  }, [savedSetups]);

  // Schemas that have at least one saved setup, in schema order
  const schemasWithSetups = useMemo(
    () => schemas.filter((s) => setupsByCarId.has(s.id)),
    [setupsByCarId]
  );

  const openBuilder = (schema: CarSchema, existing?: Setup) => {
    setActiveSchema(schema);
    setActiveSetup(existing);
    setView('builder');
  };

  const openCompare = (a: Setup, b: Setup) => {
    setCompareSetups([a, b]);
    setView('compare');
  };

  const handleOpenSavedSetup = (setup: Setup) => {
    const schema = schemas.find((s) => s.id === setup.carId);
    if (schema) openBuilder(schema, setup);
  };

  if (view === 'compare' && compareSetups) {
    return (
      <CompareView
        setupA={compareSetups[0]}
        setupB={compareSetups[1]}
        onBack={() => { setView('home'); refresh(); }}
        onUpdated={() => refresh()}
      />
    );
  }

  if (view === 'builder' && activeSchema) {
    // Peer setups: same car, excluding the currently open setup
    const peerSetups = savedSetups.filter(
      (s) => s.carId === activeSchema.id && s.id !== activeSetup?.id
    );
    return (
      <SetupBuilder
        schema={activeSchema}
        existingSetup={activeSetup}
        peerSetups={peerSetups}
        onSaved={refresh}
        onBack={() => { setView('home'); refresh(); }}
        onCompare={openCompare}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="border-b border-gray-800 px-4 py-5">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold tracking-tight">iRacing Setup Builder</h1>
          <p className="text-gray-400 text-sm mt-1">
            Build and save car setups for all iRacing car classes
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
        {/* Car class grid */}
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
            New Setup — Select Car Class
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {schemas.map((schema) => {
              const colorClass = CLASS_COLORS[schema.class] ?? 'bg-gray-800 text-gray-300 border-gray-600';
              const savedCount = setupsByCarId.get(schema.id)?.length ?? 0;
              return (
                <button
                  key={schema.id}
                  onClick={() => openBuilder(schema)}
                  className="group bg-gray-900 border border-gray-700 hover:border-gray-500 rounded-xl p-4 text-left transition-all hover:bg-gray-800"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-gray-100 font-semibold text-sm">{schema.name}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {schema.categories.length} categories ·{' '}
                        {schema.categories.reduce((n, c) => n + c.parameters.length, 0)} parameters
                        {savedCount > 0 && (
                          <span className="ml-1.5 text-blue-400">
                            · {savedCount} saved
                          </span>
                        )}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${colorClass} flex-shrink-0`}
                    >
                      {schema.class}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {schema.categories.slice(0, 4).map((cat) => (
                      <span
                        key={cat.id}
                        className="text-xs text-gray-500 bg-gray-800 group-hover:bg-gray-700 rounded px-1.5 py-0.5 transition-colors"
                      >
                        {cat.label}
                      </span>
                    ))}
                    {schema.categories.length > 4 && (
                      <span className="text-xs text-gray-600 px-1.5 py-0.5">
                        +{schema.categories.length - 4} more
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Saved setups grouped by car class */}
        <section>
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Saved Setups
            </h2>
            <div className="flex items-center gap-2">
              {ioMessage && (
                <span
                  className={`text-xs ${
                    ioMessage.kind === 'ok' ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {ioMessage.text}
                </span>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                onChange={handleImportFile}
                className="hidden"
              />
              <button
                onClick={handleImportClick}
                className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-gray-100 rounded-lg transition-colors"
              >
                Import
              </button>
              <button
                onClick={handleExportAll}
                disabled={savedSetups.length === 0}
                className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-800"
              >
                Export all
              </button>
            </div>
          </div>
          {savedSetups.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">
              No saved setups yet. Create one above, or{' '}
              <button
                onClick={handleImportClick}
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
              >
                import from a file
              </button>
              .
            </p>
          ) : (
            <div className="space-y-8">
              {schemasWithSetups.map((schema) => {
                const colorClass = CLASS_COLORS[schema.class] ?? 'bg-gray-800 text-gray-300 border-gray-600';
                const carSetups = setupsByCarId.get(schema.id)!;
                return (
                  <div key={schema.id}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${colorClass}`}>
                        {schema.class}
                      </span>
                      <span className="text-sm font-semibold text-gray-300">{schema.name}</span>
                      <span className="text-xs text-gray-600">
                        {carSetups.length} setup{carSetups.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <SetupList
                      setups={carSetups}
                      onOpen={handleOpenSavedSetup}
                      onDeleted={refresh}
                      onCompare={openCompare}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
