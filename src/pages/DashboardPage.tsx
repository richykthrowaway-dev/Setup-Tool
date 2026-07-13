import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { isSupabaseConfigured } from '../lib/config'
import { useAuthStore } from '../store/authStore'
import { useLibraryStore } from '../store/libraryStore'
import type { HardwareTemplate } from '../types/models'

export function DashboardPage() {
  const templates = useLibraryStore((s) => s.templates)
  const error = useLibraryStore((s) => s.error)
  const refreshTemplates = useLibraryStore((s) => s.refreshTemplates)
  const deleteTemplate = useLibraryStore((s) => s.deleteTemplate)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    refreshTemplates()
  }, [refreshTemplates])

  const myTemplates = isSupabaseConfigured ? templates.filter((t) => t.creatorId === user?.id) : templates
  const publicTemplates = isSupabaseConfigured
    ? templates.filter((t) => t.isPublic && t.creatorId !== user?.id)
    : []

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Your hardware templates</h1>
        <Link
          to="/creator/new"
          className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500"
        >
          + New template
        </Link>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <TemplateGrid
        templates={myTemplates}
        emptyMessage="No templates yet. Create one to get started."
        onDelete={deleteTemplate}
      />

      {isSupabaseConfigured && publicTemplates.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-200">Community templates</h2>
          <TemplateGrid templates={publicTemplates} emptyMessage="" />
        </div>
      )}
    </div>
  )
}

function TemplateGrid({
  templates,
  emptyMessage,
  onDelete,
}: {
  templates: HardwareTemplate[]
  emptyMessage: string
  onDelete?: (id: string) => void
}) {
  if (templates.length === 0) {
    return emptyMessage ? <p className="text-sm text-slate-400">{emptyMessage}</p> : null
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <div
          key={template.id}
          className="flex flex-col overflow-hidden rounded-lg border border-slate-700 bg-slate-900"
        >
          <img src={template.imageUrl} alt={template.meta.model} className="h-36 w-full object-cover" />
          <div className="flex flex-1 flex-col gap-2 p-4">
            <div>
              <div className="font-semibold text-slate-100">
                {template.meta.manufacturer} {template.meta.model}
              </div>
              <div className="text-xs text-slate-500">
                v{template.version} · {template.controls.length} controls
                {template.isPublic && <span className="ml-2 text-cyan-400">Public</span>}
              </div>
            </div>
            <div className="mt-auto flex items-center gap-2 pt-2 text-sm">
              <Link
                to={`/creator/${template.id}`}
                className="rounded-md border border-slate-600 px-3 py-1.5 text-slate-200 hover:border-slate-400"
              >
                Edit
              </Link>
              <Link
                to={`/configure/${template.id}`}
                className="rounded-md border border-slate-600 px-3 py-1.5 text-slate-200 hover:border-slate-400"
              >
                Configure
              </Link>
              {onDelete && (
                <button
                  type="button"
                  onClick={() => confirmAndDelete(onDelete, template.id)}
                  className="ml-auto text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function confirmAndDelete(onDelete: (id: string) => void, id: string) {
  if (confirm('Delete this template? This cannot be undone.')) onDelete(id)
}
