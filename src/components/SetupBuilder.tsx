'use client';

import { CarSchema, Setup } from '@/types/setup';
import CategoryPanel from './CategoryPanel';
import ChangesPanel from './ChangesPanel';
import HandlingGuide from './HandlingGuide';
import TireTemps from './TireTemps';
import { createSetup, downloadSetup, saveSetup } from '@/lib/setup';
import { computeChanges, computeTechViolations } from '@/lib/analysis';
import { useState, useEffect, useCallback, useMemo } from 'react';

type Tab = 'tune' | 'changes' | 'handling' | 'tiretemps';

interface Props {
  schema: CarSchema;
  existingSetup?: Setup;
  onSaved?: (setup: Setup) => void;
  onBack?: () => void;
}

export default function SetupBuilder({ schema, existingSetup, onSaved, onBack }: Props) {
  const [setup, setSetup] = useState<Setup>(() => {
    if (existingSetup) return existingSetup;
    return createSetup(schema.id, `New ${schema.name} Setup`, schema);
  });
  const [savedBanner, setSavedBanner] = useState(false);
  const [tab, setTab] = useState<Tab>('tune');

  useEffect(() => {
    if (existingSetup) setSetup(existingSetup);
  }, [existingSetup]);

  const changeCount = useMemo(
    () => computeChanges(schema, setup.values).length,
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

  const handleSave = () => {
    saveSetup(setup);
    setSavedBanner(true);
    onSaved?.(setup);
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
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-950 border-b border-gray-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
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
        <div className="max-w-4xl mx-auto flex items-center gap-1 mt-3 -mb-px">
          {([
            ['tune', 'Tune'],
            ['changes', `Changes${changeCount ? ` (${changeCount})` : ''}${violationCount ? ` ⚠` : ''}`],
            ['handling', 'Handling Guide'],
            ['tiretemps', 'Tire Temps'],
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

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
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
      </div>
    </div>
  );
}
