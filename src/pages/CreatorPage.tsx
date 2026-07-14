import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CreatorView } from '../components/creator/CreatorView'
import { storage } from '../services/storage'
import { useTemplateStore } from '../store/templateStore'

export function CreatorPage() {
  const { templateId } = useParams()
  const template = useTemplateStore((s) => s.template)
  const clearTemplate = useTemplateStore((s) => s.clearTemplate)
  const loadTemplate = useTemplateStore((s) => s.loadTemplate)

  useEffect(() => {
    if (!templateId || templateId === 'new') {
      clearTemplate()
      return
    }
    if (template?.id === templateId) return
    storage.getTemplate(templateId).then((found) => {
      if (found) loadTemplate(found)
    })
    // Intentionally re-runs only on route param changes, not on store updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId])

  return (
    <div className="flex flex-col gap-4">
      <Link to="/dashboard" className="w-fit text-sm text-slate-400 hover:text-slate-200">
        ← Dashboard
      </Link>
      <CreatorView />
    </div>
  )
}
