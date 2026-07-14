import { CONTROL_SHAPES, CONTROL_TYPES, CONTROL_TYPE_LABELS, type ControlObject } from '../../types/models'
import { Field } from '../shared/Field'

interface ControlPropertiesPanelProps {
  control: ControlObject | null
  onChange: (id: string, partial: Partial<ControlObject>) => void
  onDelete: (id: string) => void
}

export function ControlPropertiesPanel({ control, onChange, onDelete }: ControlPropertiesPanelProps) {
  if (!control) {
    return (
      <div className="text-sm text-slate-400">
        Select a control on the canvas to edit its properties, or add a new one from the toolbar.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 text-sm">
      <Field label="Label">
        <input
          className="input"
          value={control.label}
          onChange={(e) => onChange(control.id, { label: e.target.value })}
        />
      </Field>

      <Field label="Type">
        <select
          className="input"
          value={control.type}
          onChange={(e) => onChange(control.id, { type: e.target.value as ControlObject['type'] })}
        >
          {CONTROL_TYPES.map((type) => (
            <option key={type} value={type}>
              {CONTROL_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="X %">
          <input
            type="number"
            className="input"
            value={round(control.position.x)}
            onChange={(e) =>
              onChange(control.id, { position: { ...control.position, x: Number(e.target.value) } })
            }
          />
        </Field>
        <Field label="Y %">
          <input
            type="number"
            className="input"
            value={round(control.position.y)}
            onChange={(e) =>
              onChange(control.id, { position: { ...control.position, y: Number(e.target.value) } })
            }
          />
        </Field>
        <Field label="Width %">
          <input
            type="number"
            className="input"
            value={round(control.size.width)}
            onChange={(e) => onChange(control.id, { size: { ...control.size, width: Number(e.target.value) } })}
          />
        </Field>
        <Field label="Height %">
          <input
            type="number"
            className="input"
            value={round(control.size.height)}
            onChange={(e) => onChange(control.id, { size: { ...control.size, height: Number(e.target.value) } })}
          />
        </Field>
        <Field label="Shape">
          <select
            className="input"
            value={control.style.shape}
            onChange={(e) =>
              onChange(control.id, { style: { ...control.style, shape: e.target.value as never } })
            }
          >
            {CONTROL_SHAPES.map((shape) => (
              <option key={shape} value={shape}>
                {shape}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label={`Shape rotation (${round(control.rotation)}°)`}>
        <input
          type="range"
          min={-180}
          max={180}
          step={1}
          className="w-full accent-cyan-500"
          value={control.rotation}
          onChange={(e) => onChange(control.id, { rotation: Number(e.target.value) })}
        />
      </Field>

      <Field label={`Label rotation (${round(control.labelRotation ?? 0)}°)`}>
        <input
          type="range"
          min={-180}
          max={180}
          step={1}
          className="w-full accent-cyan-500"
          value={control.labelRotation ?? 0}
          onChange={(e) => onChange(control.id, { labelRotation: Number(e.target.value) })}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Fill color">
          <input
            type="color"
            className="h-9 w-full rounded-md border border-slate-600 bg-transparent"
            value={control.style.fill}
            onChange={(e) => onChange(control.id, { style: { ...control.style, fill: e.target.value } })}
          />
        </Field>
        <Field label="Stroke color">
          <input
            type="color"
            className="h-9 w-full rounded-md border border-slate-600 bg-transparent"
            value={control.style.stroke}
            onChange={(e) => onChange(control.id, { style: { ...control.style, stroke: e.target.value } })}
          />
        </Field>
      </div>

      <Field label="Default binding suggestion (optional)">
        <input
          className="input"
          value={control.defaultBinding ?? ''}
          onChange={(e) => onChange(control.id, { defaultBinding: e.target.value })}
        />
      </Field>

      <Field label="Notes">
        <textarea
          className="input"
          rows={3}
          value={control.notes ?? ''}
          onChange={(e) => onChange(control.id, { notes: e.target.value })}
        />
      </Field>

      <button
        type="button"
        onClick={() => onDelete(control.id)}
        className="mt-2 rounded-md border border-red-500/50 px-3 py-1.5 text-red-300 hover:bg-red-500/10"
      >
        Delete control
      </button>
    </div>
  )
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}
