import { Link, useParams } from 'react-router-dom'
import { ConfiguratorView } from '../components/configurator/ConfiguratorView'

export function ConfiguratorPage() {
  const { templateId } = useParams()

  return (
    <div className="flex flex-col gap-4">
      <Link to="/dashboard" className="w-fit text-sm text-slate-400 hover:text-slate-200">
        ← Dashboard
      </Link>
      <ConfiguratorView initialTemplateId={templateId} />
    </div>
  )
}
