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

function BlockTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-800/60">
            {headers.map((h) => (
              <th key={h} className="px-3 py-2 text-left font-semibold text-gray-300 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/60">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-gray-800/30 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className={`px-3 py-2 text-gray-300 ${j === 0 ? 'font-medium text-gray-200' : ''}`}>
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
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-xs">
          <span className="text-blue-400 flex-shrink-0 mt-0.5">›</span>
          <span>
            <span className="font-semibold text-gray-200">{item.label}</span>
            {item.detail && (
              <span className="text-gray-400"> — {item.detail}</span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

function BlockText({ body }: { body: string }) {
  return (
    <p className="text-xs text-gray-400 leading-relaxed border-l-2 border-gray-700 pl-3">
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

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-800/40 transition-colors"
      >
        <span
          className={`mt-0.5 flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${colorClass}`}
        >
          {CATEGORY_LABELS[entry.category]}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-100 text-sm leading-snug">{entry.title}</p>
          {entry.subtitle && (
            <p className="text-xs text-gray-500 mt-0.5 leading-snug">{entry.subtitle}</p>
          )}
        </div>
        <span className="text-gray-600 text-sm flex-shrink-0 mt-0.5">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-800">
          <div className="pt-4 space-y-4">
            {entry.blocks.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] bg-gray-800 text-gray-500 rounded px-1.5 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
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
        if (block.type === 'list' && block.items.some((item) => item.label.toLowerCase().includes(q) || item.detail?.toLowerCase().includes(q))) return true;
        if (block.type === 'table') {
          if (block.headers.some((h) => h.toLowerCase().includes(q))) return true;
          if (block.rows.some((row) => row.some((cell) => cell.toLowerCase().includes(q)))) return true;
        }
      }
      return false;
    });
  }, [search, activeCategory]);

  const countForCategory = (cat: KnowledgeCategory) =>
    knowledgeEntries.filter((e) => e.category === cat).length;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Search bar */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">⌕</span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search: tight, loose, ARB, diff, oversteer, Sebring…"
          className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-9 pr-4 py-3 text-sm text-gray-100 placeholder-gray-600 outline-none focus:border-blue-500 transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => setActiveCategory('all')}
          className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
            activeCategory === 'all'
              ? 'bg-gray-200 border-gray-200 text-gray-900 font-semibold'
              : 'bg-gray-900 border-gray-700 text-gray-400 hover:text-gray-200'
          }`}
        >
          All ({knowledgeEntries.length})
        </button>
        {ALL_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                isActive
                  ? `${CATEGORY_COLORS[cat]} font-semibold`
                  : 'bg-gray-900 border-gray-700 text-gray-400 hover:text-gray-200'
              }`}
            >
              {CATEGORY_LABELS[cat]} ({countForCategory(cat)})
            </button>
          );
        })}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-600 text-sm">
          No entries match &ldquo;{search}&rdquo;
        </div>
      ) : (
        <div className="space-y-2">
          {search && (
            <p className="text-xs text-gray-600 px-1">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
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
