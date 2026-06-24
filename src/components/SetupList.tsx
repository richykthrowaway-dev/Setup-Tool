'use client';

import { Setup } from '@/types/setup';
import { deleteSetup } from '@/lib/setup';
import { schemas } from '@/data/schemas';

interface Props {
  setups: Setup[];
  onOpen: (setup: Setup) => void;
  onDeleted: () => void;
}

export default function SetupList({ setups, onOpen, onDeleted }: Props) {
  if (setups.length === 0) {
    return (
      <p className="text-gray-500 text-sm text-center py-8">
        No saved setups yet. Create one above.
      </p>
    );
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Delete this setup?')) {
      deleteSetup(id);
      onDeleted();
    }
  };

  return (
    <div className="space-y-2">
      {setups.map((setup) => {
        const schema = schemas.find((s) => s.id === setup.carId);
        return (
          <div
            key={setup.id}
            onClick={() => onOpen(setup)}
            className="bg-gray-900 border border-gray-700 hover:border-blue-600 rounded-xl px-4 py-3 cursor-pointer flex items-center justify-between transition-colors"
          >
            <div>
              <p className="text-gray-100 font-medium text-sm">{setup.name}</p>
              <p className="text-gray-500 text-xs mt-0.5">
                {schema?.name ?? setup.carId}
                {setup.track ? ` · ${setup.track}` : ''}
                {' · '}
                {new Date(setup.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={(e) => handleDelete(e, setup.id)}
              className="text-gray-600 hover:text-red-400 text-xs px-2 py-1 rounded transition-colors"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
