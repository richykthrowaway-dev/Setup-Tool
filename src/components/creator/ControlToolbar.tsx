import { CONTROL_TYPES, CONTROL_TYPE_LABELS, type ControlType } from '../../types/models'

interface ControlToolbarProps {
  pendingType: ControlType | null
  onSelectType: (type: ControlType | null) => void
}

/** Lets the user arm a control type, then click the canvas to place it. */
export function ControlToolbar({ pendingType, onSelectType }: ControlToolbarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CONTROL_TYPES.map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => onSelectType(pendingType === type ? null : type)}
          className={`rounded-md border px-3 py-1.5 text-sm font-medium transition ${
            pendingType === type
              ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
              : 'border-slate-600 text-slate-200 hover:border-slate-400'
          }`}
        >
          + {CONTROL_TYPE_LABELS[type]}
        </button>
      ))}
      {pendingType && (
        <span className="self-center text-xs text-slate-400">Click the image to place it</span>
      )}
    </div>
  )
}
