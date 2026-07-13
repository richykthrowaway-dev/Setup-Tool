import { useState } from 'react'
import { CreatorView } from './components/creator/CreatorView'
import { ConfiguratorView } from './components/configurator/ConfiguratorView'

type Mode = 'creator' | 'configurator'

function App() {
  const [mode, setMode] = useState<Mode>('creator')

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <h1 className="text-xl font-bold">SuperMapper</h1>
            <p className="text-xs text-slate-400">Universal sim racing hardware mapping platform</p>
          </div>
          <nav className="flex rounded-lg border border-slate-700 p-1">
            <ModeButton active={mode === 'creator'} onClick={() => setMode('creator')}>
              Template Creator
            </ModeButton>
            <ModeButton active={mode === 'configurator'} onClick={() => setMode('configurator')}>
              User Configuration
            </ModeButton>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {mode === 'creator' ? <CreatorView /> : <ConfiguratorView />}
      </main>
    </div>
  )
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
        active ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

export default App
