import { useMemo, useState } from 'react'
import { CONTROL_TYPE_LABELS, type ControlObject, type UserProfile } from '../../types/models'
import {
  buildBindingRows,
  filterBindingRows,
  sortBindingRows,
  type BindingSortKey,
  type SortDirection,
} from '../../lib/bindingsTable'

interface BindingsTableProps {
  controls: ControlObject[]
  profile: UserProfile
  selectedControlId: string | null
  onSelectControl: (id: string) => void
  onSaveBinding: (params: { controlId: string; assignedFunction: string; notes?: string; category?: string }) => void
  onClearBinding: (controlId: string) => void
}

const SORTABLE_COLUMNS: { key: BindingSortKey; label: string }[] = [
  { key: 'label', label: 'Control' },
  { key: 'type', label: 'Type' },
  { key: 'function', label: 'Function' },
  { key: 'category', label: 'Category' },
]

export function BindingsTable({
  controls,
  profile,
  selectedControlId,
  onSelectControl,
  onSaveBinding,
  onClearBinding,
}: BindingsTableProps) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<BindingSortKey>('label')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const rows = useMemo(() => {
    const built = buildBindingRows(controls, profile.bindings)
    const filtered = filterBindingRows(built, search)
    return sortBindingRows(filtered, sortKey, sortDirection)
  }, [controls, profile.bindings, search, sortKey, sortDirection])

  function toggleSort(key: BindingSortKey) {
    if (key === sortKey) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  function commitField(controlId: string, field: 'assignedFunction' | 'category' | 'notes', value: string) {
    const existing = profile.bindings.find((b) => b.controlId === controlId)
    const next = {
      controlId,
      assignedFunction: existing?.assignedFunction ?? '',
      category: existing?.category,
      notes: existing?.notes,
      [field]: value,
    }
    if (!next.assignedFunction.trim()) return
    onSaveBinding(next)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <input
          className="input max-w-xs"
          type="search"
          placeholder="Search controls, functions, categories…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="text-xs text-slate-500">
          {rows.length} of {controls.length} control{controls.length === 1 ? '' : 's'} shown
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900 text-xs uppercase tracking-wide text-slate-400">
              {SORTABLE_COLUMNS.map((col) => (
                <th key={col.key} className="px-3 py-2 font-medium">
                  <button type="button" onClick={() => toggleSort(col.key)} className="flex items-center gap-1 hover:text-slate-200">
                    {col.label}
                    {sortKey === col.key && <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                  </button>
                </th>
              ))}
              <th className="px-3 py-2 font-medium">Notes</th>
              <th className="px-3 py-2 font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ control, binding }) => (
              <tr
                key={control.id}
                onClick={() => onSelectControl(control.id)}
                className={`cursor-pointer border-b border-slate-800 last:border-0 ${
                  control.id === selectedControlId ? 'bg-cyan-500/10' : !binding ? 'bg-amber-500/5' : 'hover:bg-slate-800/60'
                }`}
              >
                <td className="px-3 py-2 font-medium text-slate-100">
                  {control.label}
                  {!binding && (
                    <span className="ml-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-normal uppercase tracking-wide text-amber-300">
                      Unbound
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-slate-400">{CONTROL_TYPE_LABELS[control.type]}</td>
                <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    key={`fn-${binding?.assignedFunction ?? ''}`}
                    className="input"
                    defaultValue={binding?.assignedFunction ?? ''}
                    placeholder={control.defaultBinding || '—'}
                    onBlur={(e) => commitField(control.id, 'assignedFunction', e.target.value)}
                  />
                </td>
                <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    key={`cat-${binding?.category ?? ''}`}
                    className="input"
                    defaultValue={binding?.category ?? ''}
                    placeholder="—"
                    disabled={!binding}
                    onBlur={(e) => commitField(control.id, 'category', e.target.value)}
                  />
                </td>
                <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    key={`notes-${binding?.notes ?? ''}`}
                    className="input"
                    defaultValue={binding?.notes ?? ''}
                    placeholder="—"
                    disabled={!binding}
                    onBlur={(e) => commitField(control.id, 'notes', e.target.value)}
                  />
                </td>
                <td className="px-3 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                  {binding && (
                    <button
                      type="button"
                      onClick={() => onClearBinding(control.id)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Clear
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-sm text-slate-500">
                  No controls match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
