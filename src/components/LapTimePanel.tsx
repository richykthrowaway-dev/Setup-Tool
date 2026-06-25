'use client';

import { Setup, LapTime } from '@/types/setup';
import { parseLapTime, formatLapTime, computeLapStats } from '@/lib/laptime';
import { repo } from '@/lib/repository';
import { useState, useCallback } from 'react';

interface Props {
  setup: Setup;
  onUpdated: (setup: Setup) => void;
}

export default function LapTimePanel({ setup, onUpdated }: Props) {
  const [input, setInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [error, setError] = useState('');

  const lapTimes = setup.lapTimes ?? [];
  const sorted = [...lapTimes].sort((a, b) => a.lapTimeMs - b.lapTimeMs);
  const stats = computeLapStats(lapTimes.map((l) => l.lapTimeMs));
  const fastestId = sorted[0]?.id;

  const handleAdd = useCallback(async () => {
    const ms = parseLapTime(input);
    if (ms === null) {
      setError('Use format  1:52.341  or  52.341');
      return;
    }
    setError('');
    const lt: LapTime = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      lapTimeMs: ms,
      note: noteInput.trim() || undefined,
      recordedAt: Date.now(),
    };
    const updated = await repo.addLapTime(setup.id, lt);
    onUpdated(updated);
    setInput('');
    setNoteInput('');
  }, [input, noteInput, setup.id, onUpdated]);

  const handleDelete = useCallback(async (lapTimeId: string) => {
    const updated = await repo.deleteLapTime(setup.id, lapTimeId);
    onUpdated(updated);
  }, [setup.id, onUpdated]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <div className="space-y-6">
      {/* Stats banner */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Fastest" value={formatLapTime(stats.fastest)} accent="text-emerald-400" />
          <StatCard label="Average" value={formatLapTime(Math.round(stats.average))} />
          <StatCard label="Laps" value={String(stats.count)} />
          <StatCard label="Consistency ±" value={`${(stats.stdDev / 1000).toFixed(3)}s`} />
        </div>
      )}

      {/* Input row */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Add Lap Time</p>
        <div className="flex items-start gap-2 flex-wrap">
          <div className="flex flex-col gap-1">
            <input
              type="text"
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
              placeholder="1:52.341"
              className="bg-gray-800 border border-gray-600 text-gray-100 text-sm rounded-lg px-3 py-2 w-32 outline-none focus:border-blue-500 font-mono"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>
          <input
            type="text"
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Note (optional)"
            className="bg-gray-800 border border-gray-600 text-gray-100 text-sm rounded-lg px-3 py-2 flex-1 min-w-32 outline-none focus:border-blue-500"
          />
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors flex-shrink-0"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Lap list */}
      {lapTimes.length === 0 ? (
        <p className="text-sm text-gray-600 text-center py-8">
          No lap times recorded yet for this setup.
        </p>
      ) : (
        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-800 grid grid-cols-[2rem_1fr_1fr_auto] gap-3 text-xs text-gray-500 uppercase tracking-wide font-semibold">
            <span>#</span>
            <span>Time</span>
            <span>Note</span>
            <span />
          </div>
          <div className="divide-y divide-gray-800">
            {[...lapTimes]
              .sort((a, b) => a.recordedAt - b.recordedAt)
              .map((lt, i) => {
                const isFastest = lt.id === fastestId;
                const delta = stats ? lt.lapTimeMs - stats.fastest : 0;
                return (
                  <div
                    key={lt.id}
                    className="px-4 py-2.5 grid grid-cols-[2rem_1fr_1fr_auto] gap-3 items-center group"
                  >
                    <span className="text-xs text-gray-600">{i + 1}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-mono font-semibold ${isFastest ? 'text-emerald-400' : 'text-gray-200'}`}>
                        {formatLapTime(lt.lapTimeMs)}
                      </span>
                      {isFastest && (
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-1.5 py-0.5">
                          BEST
                        </span>
                      )}
                      {!isFastest && delta > 0 && (
                        <span className="text-[10px] text-red-400 font-mono">
                          +{(delta / 1000).toFixed(3)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 truncate">{lt.note ?? '—'}</span>
                    <button
                      onClick={() => handleDelete(lt.id)}
                      className="text-gray-700 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove lap"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3">
      <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold mb-1">{label}</p>
      <p className={`text-lg font-bold font-mono ${accent ?? 'text-gray-100'}`}>{value}</p>
    </div>
  );
}
