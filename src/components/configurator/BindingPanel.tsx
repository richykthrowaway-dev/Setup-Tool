import { useEffect, useState } from 'react'
import { CONTROL_TYPE_LABELS, type Binding, type ControlObject } from '../../types/models'
import { Field } from '../shared/Field'

interface BindingPanelProps {
  control: ControlObject | null
  binding: Binding | undefined
  onSave: (params: { controlId: string; assignedFunction: string; notes?: string; category?: string }) => void
  onClear: (controlId: string) => void
  functionSuggestionsListId?: string
}

export function BindingPanel({ control, binding, onSave, onClear, functionSuggestionsListId }: BindingPanelProps) {
  const [assignedFunction, setAssignedFunction] = useState('')
  const [notes, setNotes] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    setAssignedFunction(binding?.assignedFunction ?? control?.defaultBinding ?? '')
    setNotes(binding?.notes ?? '')
    setCategory(binding?.category ?? '')
  }, [control?.id, binding])

  if (!control) {
    return (
      <div className="text-sm text-slate-400">
        Select a control on the canvas to assign a software binding.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-400">{CONTROL_TYPE_LABELS[control.type]}</div>
        <div className="text-base font-semibold text-slate-100">{control.label}</div>
        {control.notes && <p className="mt-1 text-xs text-slate-500">{control.notes}</p>}
      </div>

      <Field label="Assigned function">
        <input
          className="input"
          value={assignedFunction}
          onChange={(e) => setAssignedFunction(e.target.value)}
          placeholder={control.defaultBinding || 'e.g. Brake Bias Adjustment'}
          list={functionSuggestionsListId}
        />
      </Field>

      <Field label="Category">
        <input
          className="input"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g. Brake, Traction Control"
        />
      </Field>

      <Field label="Notes">
        <textarea className="input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onSave({ controlId: control.id, assignedFunction, notes, category })}
          disabled={!assignedFunction.trim()}
          className="rounded-md bg-emerald-600 px-3 py-1.5 font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Save binding
        </button>
        {binding && (
          <button
            type="button"
            onClick={() => onClear(control.id)}
            className="rounded-md border border-red-500/50 px-3 py-1.5 text-red-300 hover:bg-red-500/10"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
