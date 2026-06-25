'use client';

import { Setup } from '@/types/setup';
import { deleteSetup } from '@/lib/setup';
import { schemas } from '@/data/schemas';
import { formatLapTime, computeLapStats } from '@/lib/laptime';
import { useState } from 'react';

interface Props {
  setups: Setup[];
  onOpen: (setup: Setup) => void;
  onDeleted: () => void;
  onCompare: (a: Setup, b: Setup) => void;
}

export default function SetupList({ setups, onOpen, onDeleted, onCompare }: Props) {
  const [compareMode, setCompareMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const toggleCompareMode = () => {
    setCompareMode((v) => !v);
    setSelected([]);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 2 ? [...prev, id] : prev
    );
  };

  const handleCompare = () => {
    const [a, b] = selected.map((id) => setups.find((s) => s.id === id)!);
    if (a && b) onCompare(a, b);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Delete this setup?')) {
      deleteSetup(id);
      onDeleted();
    }
  };

  if (setups.length === 0) {
    return (
      <p className="text-gray-500 text-sm text-center py-8">
        No saved setups yet. Create one above.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600">{setups.length} setup{setups.length !== 1 ? 's' : ''}</span>
        <div className="flex items-center gap-2">
          {compareMode && selected.length === 2 && (
            <button
              onClick={handleCompare}
              className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
            >
              Compare →
            </button>
          )}
          {compareMode && (
            <span className="text-xs text-gray-500">
              {selected.length}/2 selected
            </span>
          )}
          <button
            onClick={toggleCompareMode}
            className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
              compareMode
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-200'
            }`}
          >
            Compare
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {setups.map((setup) => {
          const schema = schemas.find((s) => s.id === setup.carId);
          const isSelected = selected.includes(setup.id);
          const lapCount = setup.lapTimes?.length ?? 0;
          const stats = lapCount > 0
            ? computeLapStats(setup.lapTimes!.map((l) => l.lapTimeMs))
            : null;

          return (
            <div
              key={setup.id}
              onClick={() => compareMode ? toggleSelect(setup.id) : onOpen(setup)}
              className={`bg-gray-900 border rounded-xl px-4 py-3 cursor-pointer flex items-center justify-between transition-colors ${
                compareMode && isSelected
                  ? 'border-blue-500 bg-blue-500/5'
                  : 'border-gray-700 hover:border-blue-600'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {compareMode && (
                  <div className={`w-4 h-4 rounded border-2 flex-shrink-0 transition-colors ${
                    isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-600'
                  }`}>
                    {isSelected && (
                      <svg viewBox="0 0 12 12" className="w-full h-full text-white" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-gray-100 font-medium text-sm truncate">{setup.name}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {schema?.name ?? setup.carId}
                    {setup.track ? ` · ${setup.track}` : ''}
                    {' · '}
                    {new Date(setup.updatedAt).toLocaleDateString()}
                    {lapCount > 0 ? ` · ${lapCount} lap${lapCount !== 1 ? 's' : ''}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                {stats && (
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-mono font-semibold text-emerald-400">
                      {formatLapTime(stats.fastest)}
                    </p>
                    <p className="text-[10px] text-gray-600">best</p>
                  </div>
                )}
                {!compareMode && (
                  <button
                    onClick={(e) => handleDelete(e, setup.id)}
                    className="text-gray-600 hover:text-red-400 text-xs px-2 py-1 rounded transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
