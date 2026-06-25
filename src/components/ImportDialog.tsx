'use client';

import { Setup } from '@/types/setup';
import { schemas } from '@/data/schemas';
import { useState } from 'react';

interface Props {
  parsed: Setup[];
  existing: Setup[];
  onConfirm: (selected: Setup[]) => void;
  onCancel: () => void;
}

export default function ImportDialog({ parsed, existing, onConfirm, onCancel }: Props) {
  const existingIds = new Set(existing.map((s) => s.id));
  const [checked, setChecked] = useState<Set<string>>(() => new Set(parsed.map((s) => s.id)));

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allChecked = checked.size === parsed.length;

  const toggleAll = () => {
    setChecked(allChecked ? new Set() : new Set(parsed.map((s) => s.id)));
  };

  const selectedCount = checked.size;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-lg mx-4 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-100">Import Setups</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {parsed.length} setup{parsed.length !== 1 ? 's' : ''} found — choose which to import
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-200 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Setup list */}
        <div className="flex-1 overflow-y-auto px-2 py-2 divide-y divide-gray-800/50">
          {parsed.map((setup) => {
            const isConflict = existingIds.has(setup.id);
            const schema = schemas.find((s) => s.id === setup.carId);
            const lapCount = setup.lapTimes?.length ?? 0;
            const isChecked = checked.has(setup.id);

            return (
              <label
                key={setup.id}
                className="flex items-start gap-3 px-3 py-3 rounded-lg cursor-pointer hover:bg-gray-800/50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggle(setup.id)}
                  className="mt-0.5 flex-shrink-0 accent-blue-500 w-4 h-4"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-100 truncate">{setup.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {schema?.name ?? setup.carId}
                    {setup.track ? ` · ${setup.track}` : ''}
                    {lapCount > 0 ? ` · ${lapCount} lap${lapCount !== 1 ? 's' : ''}` : ''}
                    {' · '}
                    {new Date(setup.updatedAt).toLocaleDateString()}
                  </p>
                  {isConflict && (
                    <p className="text-xs text-amber-400 mt-1">
                      ⚠ ID already exists — will be saved as a copy
                    </p>
                  )}
                </div>
              </label>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-800 flex items-center justify-between gap-3 flex-shrink-0">
          <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allChecked}
              onChange={toggleAll}
              className="accent-blue-500 w-4 h-4"
            />
            Select all
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(parsed.filter((s) => checked.has(s.id)))}
              disabled={selectedCount === 0}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Import {selectedCount > 0 ? `${selectedCount} ` : ''}
              {selectedCount === 1 ? 'setup' : 'setups'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
