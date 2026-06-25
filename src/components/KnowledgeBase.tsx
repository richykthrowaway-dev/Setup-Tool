'use client';

import { useState, useMemo } from 'react';
import {
  knowledgeEntries,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  KnowledgeCategory,
  KnowledgeEntry,
  KnowledgeBlock,
} from '@/data/knowledge';

const ALL_CATEGORIES: KnowledgeCategory[] = [
  'fundamentals',
  'troubleshooting',
  'parameters',
  'differential',
  'tires',
  'strategy',
  'car-classes',
  'advanced',
];

const CATEGORY_BAR: Record<KnowledgeCategory, string> = {
  fundamentals: 'bg-blue-500',
  troubleshooting: 'bg-amber-500',
  parameters: 'bg-violet-500',
  differential: 'bg-emerald-500',
  tires: 'bg-orange-500',
  strategy: 'bg-sky-500',
  'car-classes': 'bg-rose-500',
  advanced: 'bg-gray-500',
};

const CATEGORY_DOT: Record<KnowledgeCategory, string> = {
  fundamentals: 'bg-blue-400',
  troubleshooting: 'bg-amber-400',
  parameters: 'bg-violet-400',
  differential: 'bg-emerald-400',
  tires: 'bg-orange-400',
  strategy: 'bg-sky-400',
  'car-classes': 'bg-rose-400',
  advanced: 'bg-gray-400',
};

const CATEGORY_ICONS: Record<KnowledgeCategory, string> = {
  fundamentals: '📐',
  troubleshooting: '🔧',
  parameters: '⚙️',
  differential: '🔩',
  tires: '🔄',
  strategy: '🏁',
  'car-classes': '🏎',
  advanced: '📊',
};

function BlockTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700/50">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-800/80 border-b border-gray-700/50">
            {headers.map((h) => (
              <th
                key={h}
                className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={`border-b border-gray-800/60 last:border-0 transition-colors hover:bg-gray-800/30 ${
                i % 2 === 1 ? 'bg-gray-800/10' : ''
              }`}
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`px-4 py-3 text-sm leading-relaxed ${
                    j === 0
                      ? 'font-semibold text-gray-200 whitespace-nowrap'
                      : 'text-gray-400'
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BlockList({ items }: { items: Array<{ label: string; detail?: string }> }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className="flex-shrink-0 mt-[5px] w-1.5 h-1.5 rounded-full bg-blue-400/60" />
          <span className="text-sm leading-relaxed">
            <span className="font-semibold text-gray-200">{item.label}</span>
            {item.detail && (
              <span className="text-gray-500"> — {item.detail}</span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

function BlockText({ body }: { body: string }) {
  return (
    <p className="text-sm text-gray-400 leading-relaxed pl-4 border-l-2 border-gray-700 italic">
      {body}
    </p>
  );
}

function Block({ block }: { block: KnowledgeBlock }) {
  if (block.type === 'table') return <BlockTable headers={block.headers} rows={block.rows} />;
  if (block.type === 'list') return <BlockList items={block.items} />;
  return <BlockText body={block.body} />;
}

function EntryCard({ entry }: { entry: KnowledgeEntry }) {
  const [open, setOpen] = useState(false);
  const colorClass = CATEGORY_COLORS[entry.category];
  const barClass = CATEGORY_BAR[entry.category];

  return (
    <div
      className={`flex bg-gray-900 border border-gray-700/60 rounded-xl overflow-hidden transition-all duration-150 ${
        open ? 'shadow-xl shadow-black/40 border-gray-600/60' : 'hover:border-gray-600/60'
      }`}
    >
      {/* Left accent bar */}
      <div className={`w-[3px] flex-shrink-0 ${barClass} ${open ? 'opacity-100' : 'opacity-40'} transition-opacity`} />

      <div className="flex-1 min-w-0">
        {/* Header button */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-gray-800/20 transition-colors group"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${colorClass}`}>
                {CATEGORY_ICONS[entry.category]} {CATEGORY_LABELS[entry.category]}
              </span>
            </div>
            <p className="font-semibold text-gray-100 text-[15px] leading-snug">{entry.title}</p>
            {entry.subtitle && (
              <p className="text-sm text-gray-500 mt-1 leading-snug">{entry.subtitle}</p>
            )}
          </div>
          <div
            className={`flex-shrink-0 mt-1 transition-transform duration-200 ${
              open ? 'rotate-180' : ''
            }`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="text-gray-600 group-hover:text-gray-400 transition-colors"
            >
              <path
                d="M4 6l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </button>

        {/* Expanded content */}
        {open && (
          <div className="px-5 pb-5 border-t border-gray-800/60">
            <div className="pt-5 space-y-5">
              {entry.blocks.map((block, i) => (
                <Block key={i} block={block} />
              ))}
            </div>

            {entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-5 pt-4 border-t border-gray-800/60">
                <span className="text-[10px] text-gray-600 font-semibold uppercase tracking-wider self-center mr-1">
                  Tags
                </span>
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] bg-gray-800 text-gray-500 rounded-md px-2 py-0.5 font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function KnowledgeBase() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<KnowledgeCategory | 'all'>('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return knowledgeEntries.filter((entry) => {
      if (activeCategory !== 'all' && entry.category !== activeCategory) return false;
      if (!q) return true;
      if (entry.title.toLowerCase().includes(q)) return true;
      if (entry.subtitle?.toLowerCase().includes(q)) return true;
      if (entry.tags.some((t) => t.toLowerCase().includes(q))) return true;
      for (const block of entry.blocks) {
        if (block.type === 'text' && block.body.toLowerCase().includes(q)) return true;
        if (
          block.type === 'list' &&
          block.items.some(
            (item) =>
              item.label.toLowerCase().includes(q) ||
              item.detail?.toLowerCase().includes(q)
          )
        )
          return true;
        if (block.type === 'table') {
          if (block.headers.some((h) => h.toLowerCase().includes(q))) return true;
          if (block.rows.some((row) => row.some((cell) => cell.toLowerCase().includes(q))))
            return true;
        }
      }
      return false;
    });
  }, [search, activeCategory]);

  const countForCategory = (cat: KnowledgeCategory) =>
    knowledgeEntries.filter((e) => e.category === cat).length;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Page header */}
      <div className="pb-1 border-b border-gray-800">
        <h2 className="text-base font-semibold text-gray-100 tracking-tight">
          iRacing Setup Knowledge Base
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          {knowledgeEntries.length} entries covering fundamentals, parameters, and race strategy
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
        >
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search setups: oversteer, ARB, diff, tire pressure, Sebring…"
          className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-10 py-3 text-sm text-gray-100 placeholder-gray-600 outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10 transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors"
            aria-label="Clear search"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path
                d="M1 1l11 11M12 1L1 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => setActiveCategory('all')}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
            activeCategory === 'all'
              ? 'bg-gray-100 border-gray-100 text-gray-900 font-semibold'
              : 'bg-transparent border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-500'
          }`}
        >
          All
          <span
            className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
              activeCategory === 'all'
                ? 'bg-gray-300/60 text-gray-800'
                : 'bg-gray-800 text-gray-500'
            }`}
          >
            {knowledgeEntries.length}
          </span>
        </button>

        {ALL_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          const count = countForCategory(cat);
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                isActive
                  ? `${CATEGORY_COLORS[cat]} font-semibold`
                  : 'bg-transparent border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-500'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-opacity ${
                  CATEGORY_DOT[cat]
                } ${isActive ? 'opacity-100' : 'opacity-30'}`}
              />
              {CATEGORY_LABELS[cat]}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                  isActive ? 'bg-white/15 text-current' : 'bg-gray-800 text-gray-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 space-y-2">
          <p className="text-gray-400 text-sm font-medium">
            No entries match &ldquo;{search}&rdquo;
          </p>
          <p className="text-gray-600 text-xs">
            Try a different keyword or{' '}
            <button onClick={() => setSearch('')} className="text-blue-500 hover:text-blue-400 underline underline-offset-2">
              clear the search
            </button>
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {search && (
            <p className="text-xs text-gray-600 px-0.5">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''} for &ldquo;{search}&rdquo;
            </p>
          )}
          {filtered.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
