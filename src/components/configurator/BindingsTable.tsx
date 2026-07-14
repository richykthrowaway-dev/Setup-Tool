import { useMemo, useState } from 'react'
import { CONTROL_TYPE_LABELS, type ControlObject, type UserProfile } from '../../types/models'
import { useUiPreferencesStore, type LabelDisplayMode } from '../../store/uiPreferencesStore'
import {
  buildBindingRows,
  filterBindingRows,
  filterByBindingStatus,
  sortBindingRows,
  type BindingSortKey,
  type BindingStatusFilter,
  type SortDirection,
} from '../../lib/bindingsTable'

interface BindingsTableProps {
  controls: ControlObject[]
  profile: UserProfile
  selectedControlId: string | null
  onSelectControl: (id: string) => void
  onSaveBinding: (params: { controlId: string; assignedFunction: string; notes?: string; category?: string }) => void
  onClearBinding: (controlId: string) => void
  functionSuggestionsListId?: string
  hoveredControlId?: string | null
  onHoverControl?: (id: string | null) => void
}

const SORTABLE_COLUMNS: { key: BindingSortKey; label: string; width: string }[] = [
  { key: 'label', label: 'Control', width: 'w-[22%]' },
  { key: 'function', label: 'Function', width: 'w-[30%]' },
  { key: 'category', label: 'Category', width: 'w-[16%]' },
]

const STATUS_TABS: { key: BindingStatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unbound', label: 'Unbound' },
  { key: 'bound', label: 'Bound' },
]

export function BindingsTable({
  controls,
  profile,
  selectedControlId,
  onSelectControl,
  onSaveBinding,
  onClearBinding,
  functionSuggestionsListId,
  hoveredControlId,
  onHoverControl,
}: BindingsTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<BindingStatusFilter>('all')
  // Unbound-first by default: the whole point of this view is finding what
  // still needs attention, so that should be visible without extra clicks.
  const [sortKey, setSortKey] = useState<BindingSortKey>('unbound')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const labelDisplayMode = useUiPreferencesStore((s) => s.labelDisplayMode)
  const setLabelDisplayMode = useUiPreferencesStore((s) => s.setLabelDisplayMode)

  const displayModeOrder: LabelDisplayMode[] = ['names', 'numbers', 'functions']
  const displayModeLabels: Record<LabelDisplayMode, string> = {
    names: 'Names',
    numbers: 'Numbers',
    functions: 'Functions',
  }

  function cycleLabelDisplayMode() {
    const currentIndex = displayModeOrder.indexOf(labelDisplayMode)
    const nextIndex = (currentIndex + 1) % displayModeOrder.length
    setLabelDisplayMode(displayModeOrder[nextIndex])
  }

  const allRows = useMemo(() => buildBindingRows(controls, profile.bindings), [controls, profile.bindings])
  const unboundWithSuggestionCount = useMemo(
    () => allRows.filter((r) => !r.binding && r.control.defaultBinding).length,
    [allRows],
  )

  const rows = useMemo(() => {
    const byStatus = filterByBindingStatus(allRows, statusFilter)
    const filtered = filterBindingRows(byStatus, search)
    return sortBindingRows(filtered, sortKey, sortDirection)
  }, [allRows, statusFilter, search, sortKey, sortDirection])

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

  function fillAllSuggested() {
    for (const row of allRows) {
      if (!row.binding && row.control.defaultBinding) {
        onSaveBinding({ controlId: row.control.id, assignedFunction: row.control.defaultBinding })
      }
    }
  }

  const boundCount = allRows.length - allRows.filter((r) => !r.binding).length
  const unboundCount = allRows.filter((r) => !r.binding).length

  const statusCounts = {
    all: allRows.length,
    bound: boundCount,
    unbound: unboundCount,
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-lg border border-slate-700 p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-1 text-sm font-medium transition ${
                statusFilter === tab.key ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              <span className="rounded-full bg-slate-700/50 px-2 py-0.5 text-xs font-semibold">
                {statusCounts[tab.key as keyof typeof statusCounts]}
              </span>
            </button>
          ))}
        </div>

        <input
          className="input max-w-[220px]"
          type="search"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          type="button"
          onClick={cycleLabelDisplayMode}
          className="rounded-md border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:border-slate-400"
          title="Cycle through: Control names, Button numbers, Assigned functions"
        >
          Labels: {displayModeLabels[labelDisplayMode]}
        </button>

        {unboundWithSuggestionCount > 0 && (
          <button
            type="button"
            onClick={fillAllSuggested}
            className="rounded-md border border-cyan-500/50 bg-cyan-500/10 px-3 py-1.5 text-sm text-cyan-300 hover:bg-cyan-500/20"
          >
            Fill {unboundWithSuggestionCount} suggested binding{unboundWithSuggestionCount === 1 ? '' : 's'}
          </button>
        )}

        <span className="ml-auto text-xs text-slate-500">
          {boundCount} / {allRows.length} bound · {rows.length} shown
        </span>
      </div>

      <div className="max-h-[70vh] overflow-auto rounded-lg border border-slate-700">
        <table className="w-full min-w-[640px] table-fixed border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-900">
            <tr className="border-b border-slate-700 text-xs uppercase tracking-wide text-slate-400">
              {SORTABLE_COLUMNS.map((col) => (
                <th key={col.key} className={`${col.width} px-3 py-2 font-medium`}>
                  <button type="button" onClick={() => toggleSort(col.key)} className="flex items-center gap-1 hover:text-slate-200">
                    {col.label}
                    <span className="w-3 text-[10px]">{sortKey === col.key ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</span>
                  </button>
                </th>
              ))}
              <th className="w-[16%] px-3 py-2 font-medium">Notes</th>
              <th className="w-[8%] px-3 py-2 text-right font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ control, binding }, i) => {
              const isSelected = control.id === selectedControlId
              const isHovered = control.id === hoveredControlId
              return (
                <tr
                  key={control.id}
                  onClick={() => onSelectControl(control.id)}
                  onMouseEnter={() => onHoverControl?.(control.id)}
                  onMouseLeave={() => onHoverControl?.(null)}
                  className={`cursor-pointer border-b border-slate-800 border-l-4 last:border-b-0 transition-all duration-150 ${
                    isSelected
                      ? 'border-l-cyan-400 bg-cyan-500/10'
                      : isHovered
                        ? 'border-l-blue-400 bg-blue-500/20'
                        : !binding
                          ? 'border-l-amber-500/60 bg-amber-500/5 hover:bg-amber-500/10'
                          : i % 2 === 0
                            ? 'border-l-transparent hover:bg-slate-800/60'
                            : 'border-l-transparent bg-slate-900/40 hover:bg-slate-800/60'
                  }`}
                >
                  <td className="truncate px-3 py-2 align-top">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-slate-100">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-slate-100" title={control.label}>
                          {control.label}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{CONTROL_TYPE_LABELS[control.type]}</span>
                          {binding ? (
                            <span className="inline-flex items-center gap-1 text-green-400">
                              <span>✓</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-400">
                              <span>○</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 align-top" onClick={(e) => e.stopPropagation()}>
                    <input
                      key={`fn-${binding?.assignedFunction ?? ''}`}
                      className="input"
                      defaultValue={binding?.assignedFunction ?? ''}
                      placeholder={control.defaultBinding || '—'}
                      onBlur={(e) => commitField(control.id, 'assignedFunction', e.target.value)}
                      list={functionSuggestionsListId}
                    />
                    {!binding && control.defaultBinding && (
                      <button
                        type="button"
                        onClick={() => onSaveBinding({ controlId: control.id, assignedFunction: control.defaultBinding! })}
                        className="mt-1 text-xs text-cyan-400 hover:underline"
                      >
                        Use "{control.defaultBinding}"
                      </button>
                    )}
                  </td>
                  <td className="px-3 py-2 align-top" onClick={(e) => e.stopPropagation()}>
                    <input
                      key={`cat-${binding?.category ?? ''}`}
                      className="input disabled:opacity-40"
                      defaultValue={binding?.category ?? ''}
                      placeholder="—"
                      disabled={!binding}
                      onBlur={(e) => commitField(control.id, 'category', e.target.value)}
                    />
                  </td>
                  <td className="px-3 py-2 align-top" onClick={(e) => e.stopPropagation()}>
                    <input
                      key={`notes-${binding?.notes ?? ''}`}
                      className="input disabled:opacity-40"
                      defaultValue={binding?.notes ?? ''}
                      placeholder="—"
                      disabled={!binding}
                      onBlur={(e) => commitField(control.id, 'notes', e.target.value)}
                    />
                  </td>
                  <td className="px-3 py-2 text-right align-top" onClick={(e) => e.stopPropagation()}>
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
              )
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-sm text-slate-500">
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
