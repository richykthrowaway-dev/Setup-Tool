import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { isSupabaseConfigured } from '../lib/config'
import { templateMatchesQuery } from '../lib/search'
import { useAuthStore } from '../store/authStore'
import { useLibraryStore } from '../store/libraryStore'
import type { HardwareTemplate, UserProfile } from '../types/models'

export function DashboardPage() {
  const templates = useLibraryStore((s) => s.templates)
  const profiles = useLibraryStore((s) => s.profiles)
  const templatesLoading = useLibraryStore((s) => s.templatesLoading)
  const profilesLoading = useLibraryStore((s) => s.profilesLoading)
  const error = useLibraryStore((s) => s.error)
  const refreshTemplates = useLibraryStore((s) => s.refreshTemplates)
  const refreshProfiles = useLibraryStore((s) => s.refreshProfiles)
  const deleteTemplate = useLibraryStore((s) => s.deleteTemplate)
  const deleteProfile = useLibraryStore((s) => s.deleteProfile)
  const forkTemplate = useLibraryStore((s) => s.forkTemplate)
  const user = useAuthStore((s) => s.user)

  const [search, setSearch] = useState('')

  useEffect(() => {
    refreshTemplates()
    refreshProfiles()
  }, [refreshTemplates, refreshProfiles])

  const myTemplates = (isSupabaseConfigured ? templates.filter((t) => t.creatorId === user?.id) : templates).filter(
    (t) => templateMatchesQuery(t, search),
  )
  const publicTemplates = (
    isSupabaseConfigured ? templates.filter((t) => t.isPublic && t.creatorId !== user?.id) : []
  ).filter((t) => templateMatchesQuery(t, search))

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

      {templates.length > 0 && (
        <input
          className="input max-w-sm"
          type="search"
          placeholder="Search by manufacturer or model…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      {templatesLoading && templates.length === 0 ? (
        <p className="text-sm text-slate-400">Loading templates…</p>
      ) : (
        <TemplateGrid
          templates={myTemplates}
          emptyMessage={search ? 'No templates match your search.' : 'No templates yet. Create one to get started.'}
          onDelete={deleteTemplate}
        />
      )}

      {isSupabaseConfigured && publicTemplates.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-200">Community templates</h2>
          <TemplateGrid templates={publicTemplates} emptyMessage="" onFork={forkTemplate} />
        </div>
      )}

      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-200">Your profiles</h2>
        {profilesLoading && profiles.length === 0 ? (
          <p className="text-sm text-slate-400">Loading profiles…</p>
        ) : (
          <ProfileList profiles={profiles} templates={templates} onDelete={deleteProfile} />
        )}
      </div>
    </div>
  )
}

function TemplateGrid({
  templates,
  emptyMessage,
  onDelete,
  onFork,
}: {
  templates: HardwareTemplate[]
  emptyMessage: string
  onDelete?: (id: string) => void
  onFork?: (template: HardwareTemplate) => void
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
              {onDelete && (
                <Link
                  to={`/creator/${template.id}`}
                  className="rounded-md border border-slate-600 px-3 py-1.5 text-slate-200 hover:border-slate-400"
                >
                  Edit
                </Link>
              )}
              <Link
                to={`/configure/${template.id}`}
                className="rounded-md border border-slate-600 px-3 py-1.5 text-slate-200 hover:border-slate-400"
              >
                Configure
              </Link>
              {onFork && (
                <button
                  type="button"
                  onClick={() => onFork(template)}
                  className="rounded-md border border-slate-600 px-3 py-1.5 text-slate-200 hover:border-slate-400"
                >
                  Fork
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => confirmAndRun(onDelete, template.id, 'Delete this template? This cannot be undone.')}
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

function ProfileList({
  profiles,
  templates,
  onDelete,
}: {
  profiles: UserProfile[]
  templates: HardwareTemplate[]
  onDelete: (id: string) => void
}) {
  if (profiles.length === 0) {
    return <p className="text-sm text-slate-400">No profiles yet. Configure a template to create one.</p>
  }

  return (
    <div className="flex flex-col divide-y divide-slate-800 rounded-lg border border-slate-700 bg-slate-900">
      {profiles.map((profile) => {
        const template = templates.find((t) => t.id === profile.hardwareTemplateId)
        return (
          <div key={profile.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <div className="font-medium text-slate-100">{profile.name || 'Untitled profile'}</div>
              <div className="text-xs text-slate-500">
                {template ? `${template.meta.manufacturer} ${template.meta.model}` : 'Unknown template'}
                {profile.game ? ` · ${profile.game}` : ''}
                {' · '}
                {profile.bindings.length} binding{profile.bindings.length === 1 ? '' : 's'}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {template && (
                <Link
                  to={`/configure/${template.id}?profile=${profile.id}`}
                  className="rounded-md border border-slate-600 px-3 py-1.5 text-slate-200 hover:border-slate-400"
                >
                  Open
                </Link>
              )}
              <button
                type="button"
                onClick={() => confirmAndRun(onDelete, profile.id, 'Delete this profile? This cannot be undone.')}
                className="text-red-400 hover:text-red-300"
              >
                Delete
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function confirmAndRun(action: (id: string) => void, id: string, message: string) {
  if (confirm(message)) action(id)
}
