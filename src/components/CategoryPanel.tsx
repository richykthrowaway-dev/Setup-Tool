'use client';

import { Category } from '@/types/setup';
import ParameterInput from './ParameterInput';
import { useState } from 'react';

interface Props {
  category: Category;
  values: Record<string, number | string | boolean>;
  onChange: (id: string, value: number | string | boolean) => void;
}

export default function CategoryPanel({ category, values, onChange }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800 transition-colors"
      >
        <span className="text-gray-100 font-semibold text-sm tracking-wide uppercase">
          {category.label}
        </span>
        <span className="text-gray-500 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-4 pb-2">
          {category.parameters.map((param) => (
            <ParameterInput
              key={param.id}
              param={param}
              value={values[param.id] ?? param.defaultValue}
              onChange={onChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
