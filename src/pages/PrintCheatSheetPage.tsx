import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { storage } from '../services/storage'
import type { HardwareTemplate, UserProfile } from '../types/models'
import { CONTROL_TYPE_LABELS } from '../types/models'

/**
 * Standalone, print-optimized page — deliberately rendered outside AppShell
 * so there's no app chrome to hide. Positions controls with plain CSS
 * percentages (not Konva) since that prints reliably at any page size,
 * unlike a canvas element.
 */
export function PrintCheatSheetPage() {
  const { templateId } = useParams()
  const [searchParams] = useSearchParams()
  const profileId = searchParams.get('profile') ?? undefined

  const [template, setTemplate] = useState<HardwareTemplate | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!templateId) return
    setLoading(true)
    Promise.all([storage.getTemplate(templateId), profileId ? storage.getProfile(profileId) : Promise.resolve(undefined)])
      .then(([foundTemplate, foundProfile]) => {
        setTemplate(foundTemplate ?? null)
        setProfile(foundProfile ?? null)
      })
      .finally(() => setLoading(false))
  }, [templateId, profileId])

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-400">Loading…</div>
  }

  if (!template) {
    return (
      <div className="p-8 text-center text-sm text-slate-400">
        Template not found. <Link to="/dashboard" className="text-cyan-400 underline">Back to dashboard</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl bg-white p-6 text-slate-900 print:max-w-none print:p-0">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link to={`/configure/${template.id}`} className="text-sm text-slate-500 underline">
          ← Back to configurator
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Print / Save as PDF
        </button>
      </div>

      <header className="mb-4">
        <h1 className="text-2xl font-bold">
          {template.meta.manufacturer} {template.meta.model}
        </h1>
        {profile && (
          <p className="text-sm text-slate-600">
            {profile.name}
            {profile.game ? ` — ${profile.game}` : ''}
            {profile.vehicle ? ` — ${profile.vehicle}` : ''}
          </p>
        )}
      </header>

      <div
        className="relative w-full overflow-hidden rounded-lg border border-slate-300"
        style={{ aspectRatio: `${template.imageWidth} / ${template.imageHeight}` }}
      >
        <img src={template.imageUrl} alt={`${template.meta.manufacturer} ${template.meta.model}`} className="h-full w-full object-contain" />
        {template.controls.map((control, index) => {
          const centerX = control.position.x + control.size.width / 2
          const centerY = control.position.y + control.size.height / 2
          return (
            <div
              key={control.id}
              title={control.label}
              className="absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-slate-900 bg-white text-xs font-bold text-slate-900 shadow"
              style={{ left: `${centerX}%`, top: `${centerY}%` }}
            >
              {index + 1}
            </div>
          )
        })}
      </div>

      <table className="mt-6 w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b-2 border-slate-900">
            <th className="py-1.5 pr-2 font-semibold">#</th>
            <th className="py-1.5 pr-2 font-semibold">Control</th>
            <th className="py-1.5 pr-2 font-semibold">Type</th>
            <th className="py-1.5 pr-2 font-semibold">Function</th>
            <th className="py-1.5 font-semibold">Notes</th>
          </tr>
        </thead>
        <tbody>
          {template.controls.map((control, index) => {
            const binding = profile?.bindings.find((b) => b.controlId === control.id)
            return (
              <tr key={control.id} className="border-b border-slate-300">
                <td className="py-1.5 pr-2 font-semibold">{index + 1}</td>
                <td className="py-1.5 pr-2">{control.label}</td>
                <td className="py-1.5 pr-2 text-slate-600">{CONTROL_TYPE_LABELS[control.type]}</td>
                <td className="py-1.5 pr-2">
                  {binding?.assignedFunction || (
                    <span className="italic text-slate-500">
                      {control.defaultBinding ? `${control.defaultBinding} (suggested)` : '—'}
                    </span>
                  )}
                </td>
                <td className="py-1.5 text-slate-600">{binding?.notes || control.notes || ''}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
