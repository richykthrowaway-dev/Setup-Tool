'use client';

import { useState, useEffect } from 'react';
import { schemas } from '@/data/schemas';
import { CarSchema, Setup } from '@/types/setup';
import { repo } from '@/lib/repository';
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

  const refresh = () => repo.list().then(setSavedSetups);

  useEffect(() => { refresh(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      />
    );
  }

  if (view === 'builder' && activeSchema) {
    return (
      <SetupBuilder
        schema={activeSchema}
        existingSetup={activeSetup}
        onSaved={refresh}
        onBack={() => { setView('home'); refresh(); }}
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
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
            New Setup — Select Car Class
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {schemas.map((schema) => {
              const colorClass = CLASS_COLORS[schema.class] ?? 'bg-gray-800 text-gray-300 border-gray-600';
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

        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
            Saved Setups
          </h2>
          <SetupList
            setups={savedSetups}
            onOpen={handleOpenSavedSetup}
            onDeleted={refresh}
            onCompare={openCompare}
          />
        </section>
      </div>
    </div>
  );
}
