'use client';

import { Parameter } from '@/types/setup';
import { useState } from 'react';

interface Props {
  param: Parameter;
  value: number | string | boolean;
  onChange: (id: string, value: number | string | boolean) => void;
}

export default function ParameterInput({ param, value, onChange }: Props) {
  const [showInfo, setShowInfo] = useState(false);

  if (param.type === 'select') {
    const selectChanged = String(value) !== String(param.defaultValue);
    return (
      <div className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-200 font-medium">{param.label}</span>
            {selectChanged && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-0.5 flex-shrink-0" />
            )}
            <button
              onClick={() => setShowInfo((v) => !v)}
              className="text-gray-500 hover:text-gray-300 text-xs ml-1 flex-shrink-0"
              title="Show effect"
            >
              ⓘ
            </button>
          </div>
          {showInfo && (
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              {param.description} <span className="text-blue-400">↑ {param.increaseEffect}</span>
            </p>
          )}
        </div>
        <select
          value={String(value)}
          onChange={(e) => onChange(param.id, e.target.value)}
          className="bg-gray-800 border border-gray-600 text-gray-100 text-sm rounded px-2 py-1 w-40 flex-shrink-0"
        >
          {param.options?.map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  const numValue = Number(value);
  const min = param.min ?? 0;
  const max = param.max ?? 100;
  const step = param.step ?? 1;
  const pct = max !== min ? ((numValue - min) / (max - min)) * 100 : 0;
  const delta = numValue - Number(param.defaultValue);
  const deltaStr = delta !== 0 ? `${delta > 0 ? '+' : ''}${parseFloat(delta.toFixed(4))}` : null;

  return (
    <div className="py-2 border-b border-gray-800 last:border-0">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-200 font-medium">{param.label}</span>
            {deltaStr && (
              <span className={`text-xs font-semibold ml-0.5 flex-shrink-0 ${delta > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {deltaStr}
              </span>
            )}
            <button
              onClick={() => setShowInfo((v) => !v)}
              className="text-gray-500 hover:text-gray-300 text-xs ml-1 flex-shrink-0"
              title="Show effect"
            >
              ⓘ
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() =>
              onChange(param.id, Math.max(min, parseFloat((numValue - step).toFixed(10))))
            }
            className="w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded text-gray-200 text-sm font-bold flex items-center justify-center"
          >
            −
          </button>
          <input
            type="number"
            value={numValue}
            min={min}
            max={max}
            step={step}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v)) onChange(param.id, Math.min(max, Math.max(min, v)));
            }}
            className="bg-gray-800 border border-gray-600 text-gray-100 text-sm rounded px-2 py-1 w-24 text-center"
          />
          <span className="text-gray-500 text-xs w-10 text-left">{param.unit ?? ''}</span>
          <button
            onClick={() =>
              onChange(param.id, Math.min(max, parseFloat((numValue + step).toFixed(10))))
            }
            className="w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded text-gray-200 text-sm font-bold flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>
      <div className="mt-1.5 h-1 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all"
          style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
        />
      </div>
      {showInfo && (
        <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
          {param.description}{' '}
          <span className="text-blue-400">↑ {param.increaseEffect}</span>
        </p>
      )}
    </div>
  );
}
