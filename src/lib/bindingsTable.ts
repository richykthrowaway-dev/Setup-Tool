import type { Binding, ControlObject } from '../types/models'

export interface BindingRow {
  control: ControlObject
  binding: Binding | undefined
}

/** Pairs every control with its binding in the given profile, if any. */
export function buildBindingRows(controls: ControlObject[], bindings: Binding[]): BindingRow[] {
  const byControlId = new Map(bindings.map((b) => [b.controlId, b]))
  return controls.map((control) => ({ control, binding: byControlId.get(control.id) }))
}

/** Case-insensitive substring match against label, type, function, category, and notes. */
export function filterBindingRows(rows: BindingRow[], query: string): BindingRow[] {
  const q = query.trim().toLowerCase()
  if (!q) return rows
  return rows.filter(({ control, binding }) => {
    const haystack = [control.label, control.type, binding?.assignedFunction, binding?.category, binding?.notes]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
}

export const BINDING_SORT_KEYS = ['label', 'type', 'function', 'category', 'unbound'] as const
export type BindingSortKey = (typeof BINDING_SORT_KEYS)[number]
export type SortDirection = 'asc' | 'desc'

export function sortBindingRows(rows: BindingRow[], key: BindingSortKey, direction: SortDirection): BindingRow[] {
  const sign = direction === 'asc' ? 1 : -1
  return [...rows].sort((a, b) => {
    switch (key) {
      case 'label':
        return sign * a.control.label.localeCompare(b.control.label)
      case 'type':
        return sign * a.control.type.localeCompare(b.control.type)
      case 'function':
        return sign * (a.binding?.assignedFunction ?? '').localeCompare(b.binding?.assignedFunction ?? '')
      case 'category':
        return sign * (a.binding?.category ?? '').localeCompare(b.binding?.category ?? '')
      case 'unbound':
        return sign * (Number(!a.binding) - Number(!b.binding))
      default:
        return 0
    }
  })
}
