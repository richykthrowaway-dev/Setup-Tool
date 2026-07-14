import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ConfiguratorView } from '../components/configurator/ConfiguratorView'

export function ConfiguratorPage() {
  const { templateId } = useParams()
  const [searchParams] = useSearchParams()

  return (
    <div className="flex flex-col gap-4">
      <Link to="/dashboard" className="w-fit text-sm text-slate-400 hover:text-slate-200">
        ← Dashboard
      </Link>
      <ConfiguratorView
        initialTemplateId={templateId}
        initialProfileId={searchParams.get('profile') ?? undefined}
        initialViewMode={searchParams.get('view') === 'table' ? 'table' : undefined}
      />
    </div>
  )
}
