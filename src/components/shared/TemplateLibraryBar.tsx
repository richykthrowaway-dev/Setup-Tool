import { useEffect } from 'react'
import { useLibraryStore } from '../../store/libraryStore'
import type { HardwareTemplate } from '../../types/models'

interface TemplateLibraryBarProps {
  activeTemplateId?: string
  onLoad: (template: HardwareTemplate) => void
  onNew?: () => void
}

/** Saved-template picker shared by both operating modes. */
export function TemplateLibraryBar({ activeTemplateId, onLoad, onNew }: TemplateLibraryBarProps) {
  const templates = useLibraryStore((s) => s.templates)
  const refreshTemplates = useLibraryStore((s) => s.refreshTemplates)
  const deleteTemplate = useLibraryStore((s) => s.deleteTemplate)

  useEffect(() => {
    refreshTemplates()
  }, [refreshTemplates])

  if (templates.length === 0 && !onNew) return null

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 p-3">
      <span className="text-xs uppercase tracking-wide text-slate-400">Saved templates</span>
      {templates.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-1 rounded-md border px-2 py-1 text-xs ${
            t.id === activeTemplateId ? 'border-cyan-400 text-cyan-200' : 'border-slate-600 text-slate-300'
          }`}
        >
          <button type="button" onClick={() => onLoad(t)} className="hover:underline">
            {t.meta.model || 'Untitled'} · v{t.version}
          </button>
          <button
            type="button"
            onClick={() => deleteTemplate(t.id)}
            className="ml-1 text-slate-500 hover:text-red-400"
            aria-label={`Delete ${t.meta.model}`}
          >
            ×
          </button>
        </div>
      ))}
      {onNew && (
        <button
          type="button"
          onClick={onNew}
          className="ml-auto rounded-md border border-slate-600 px-2 py-1 text-xs text-slate-300 hover:border-slate-400"
        >
          + New template
        </button>
      )}
    </div>
  )
}
