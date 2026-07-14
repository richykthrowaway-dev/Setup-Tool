import type { UserProfile, ControlObject } from '../../types/models'

interface BindingProgressProps {
  controls: ControlObject[]
  profile: UserProfile
}

export function BindingProgress({ controls, profile }: BindingProgressProps) {
  const boundCount = profile.bindings.length
  const totalCount = controls.length
  const percentage = totalCount > 0 ? Math.round((boundCount / totalCount) * 100) : 0
  const unboundCount = totalCount - boundCount

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="font-medium text-slate-200">
          Binding Progress
        </div>
        <div className="text-xs text-slate-400">
          {boundCount} of {totalCount} ({percentage}%)
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400"
        >
          <span className="text-sm">✓</span>
          <span>{boundCount} bound</span>
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400"
        >
          <span className="text-sm">○</span>
          <span>{unboundCount} unbound</span>
        </button>
      </div>
    </div>
  )
}
