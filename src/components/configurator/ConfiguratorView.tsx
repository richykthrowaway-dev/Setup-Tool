import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLibraryStore } from '../../store/libraryStore'
import { useProfileStore } from '../../store/profileStore'
import { useUiPreferencesStore, type LabelDisplayMode } from '../../store/uiPreferencesStore'
import { GAME_FUNCTION_DATALIST_ID, getGameFunctionSuggestions } from '../../data/gameFunctions'
import { HardwareCanvas } from '../canvas/HardwareCanvas'
import { BindingPanel } from './BindingPanel'
import { BindingsTable } from './BindingsTable'
import { BindingProgress } from './BindingProgress'
import { Field } from '../shared/Field'
import {
  exportUserProfile,
  importUserProfile,
  ImportValidationError,
} from '../../services/io/exportImport'

interface ConfiguratorViewProps {
  /** Preselects the hardware template, e.g. when arriving from a dashboard "Configure" link. */
  initialTemplateId?: string
  /** Preselects a specific profile once it's loaded, e.g. from a "Your profiles" deep link. */
  initialProfileId?: string
  /** Forces the view mode on arrival, e.g. from a "View table" deep link. Overrides the persisted preference. */
  initialViewMode?: 'canvas' | 'table'
}

export function ConfiguratorView({ initialTemplateId, initialProfileId, initialViewMode }: ConfiguratorViewProps) {
  const templates = useLibraryStore((s) => s.templates)
  const refreshTemplates = useLibraryStore((s) => s.refreshTemplates)
  const profiles = useLibraryStore((s) => s.profiles)
  const refreshProfiles = useLibraryStore((s) => s.refreshProfiles)

  const profile = useProfileStore((s) => s.profile)
  const startNewProfile = useProfileStore((s) => s.startNewProfile)
  const loadProfile = useProfileStore((s) => s.loadProfile)
  const clearProfile = useProfileStore((s) => s.clearProfile)
  const updateMeta = useProfileStore((s) => s.updateMeta)
  const setBinding = useProfileStore((s) => s.setBinding)
  const removeBinding = useProfileStore((s) => s.removeBinding)
  const saveProfile = useProfileStore((s) => s.saveProfile)
  const saveError = useProfileStore((s) => s.saveError)

  const viewMode = useUiPreferencesStore((s) => s.configuratorViewMode)
  const setViewMode = useUiPreferencesStore((s) => s.setConfiguratorViewMode)
  const canvasLabelDisplayMode = useUiPreferencesStore((s) => s.canvasLabelDisplayMode)
  const setCanvasLabelDisplayMode = useUiPreferencesStore((s) => s.setCanvasLabelDisplayMode)

  const [selectedTemplateId, setSelectedTemplateId] = useState(initialTemplateId ?? '')
  const [selectedControlId, setSelectedControlId] = useState<string | null>(null)
  const [hoveredControlId, setHoveredControlId] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    refreshTemplates()
  }, [refreshTemplates])

  useEffect(() => {
    if (initialTemplateId) setSelectedTemplateId(initialTemplateId)
  }, [initialTemplateId])

  useEffect(() => {
    if (initialViewMode) setViewMode(initialViewMode)
  }, [initialViewMode, setViewMode])

  useEffect(() => {
    if (selectedTemplateId) refreshProfiles(selectedTemplateId)
  }, [selectedTemplateId, refreshProfiles])

  const template = templates.find((t) => t.id === selectedTemplateId) ?? null
  const templateProfiles = profiles.filter((p) => p.hardwareTemplateId === selectedTemplateId)

  useEffect(() => {
    if (!initialProfileId || profile) return
    const found = templateProfiles.find((p) => p.id === initialProfileId)
    if (found) loadProfile(found)
  }, [initialProfileId, templateProfiles, profile, loadProfile])
  const selectedControl = template?.controls.find((c) => c.id === selectedControlId) ?? null
  const selectedBinding = profile?.bindings.find((b) => b.controlId === selectedControlId)
  const gameFunctionSuggestions = useMemo(() => getGameFunctionSuggestions(profile?.game), [profile?.game])

  const displayModeOrder: LabelDisplayMode[] = ['numbers', 'names', 'functions']
  const displayModeLabels: Record<LabelDisplayMode, string> = {
    numbers: 'Numbers',
    names: 'Names',
    functions: 'Functions',
  }

  function cycleCanvasLabelDisplayMode() {
    const currentIndex = displayModeOrder.indexOf(canvasLabelDisplayMode)
    const nextIndex = (currentIndex + 1) % displayModeOrder.length
    setCanvasLabelDisplayMode(displayModeOrder[nextIndex])
  }

  async function handleSaveProfile() {
    await saveProfile()
    if (selectedTemplateId) await refreshProfiles(selectedTemplateId)
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const imported = await importUserProfile(file)
      loadProfile(imported)
      setSelectedTemplateId(imported.hardwareTemplateId)
      setImportError(null)
    } catch (err) {
      setImportError(err instanceof ImportValidationError ? err.message : 'Import failed.')
    }
  }

  if (templates.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center text-sm text-slate-400">
        <p>No hardware templates yet. Create one first.</p>
        <Link to="/creator/new" className="text-cyan-400 underline">
          Go to Template Creator
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      {gameFunctionSuggestions.length > 0 && (
        <datalist id={GAME_FUNCTION_DATALIST_ID}>
          {gameFunctionSuggestions.map((fn, i) => (
            <option key={`${fn}-${i}`} value={fn} />
          ))}
        </datalist>
      )}
      <div className="flex min-w-0 flex-col gap-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Hardware template">
            <select
              className="input"
              value={selectedTemplateId}
              onChange={(e) => {
                setSelectedTemplateId(e.target.value)
                setSelectedControlId(null)
                clearProfile()
              }}
            >
              <option value="">Select a template…</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.meta.manufacturer ? `${t.meta.manufacturer} ` : ''}
                  {t.meta.model}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Profile">
            <select
              className="input"
              value={profile?.id ?? ''}
              disabled={!selectedTemplateId}
              onChange={(e) => {
                const found = templateProfiles.find((p) => p.id === e.target.value)
                if (found) loadProfile(found)
              }}
            >
              <option value="">Select a profile…</option>
              {templateProfiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.game ? ` — ${p.game}` : ''}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {selectedTemplateId && !profile && (
          <NewProfileForm
            onCreate={(params) => startNewProfile({ hardwareTemplateId: selectedTemplateId, ...params })}
          />
        )}

        {template && profile && (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <input
                className="input"
                placeholder="Profile name"
                value={profile.name}
                onChange={(e) => updateMeta({ name: e.target.value })}
              />
              <input
                className="input"
                placeholder="Game"
                value={profile.game ?? ''}
                onChange={(e) => updateMeta({ game: e.target.value })}
              />
              <input
                className="input"
                placeholder="Vehicle"
                value={profile.vehicle ?? ''}
                onChange={(e) => updateMeta({ vehicle: e.target.value })}
              />
            </div>

            <BindingProgress controls={template.controls} profile={profile} />

            <div className="flex items-center gap-1 rounded-lg border border-slate-700 p-1 w-fit">
              <button
                type="button"
                onClick={() => setViewMode('canvas')}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  viewMode === 'canvas' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:text-white'
                }`}
              >
                Canvas
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  viewMode === 'table' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:text-white'
                }`}
              >
                Table
              </button>
            </div>

            {viewMode === 'canvas' ? (
              <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800 px-3 py-2">
                  <span className="text-xs font-medium text-slate-300">Canvas Labels</span>
                  <button
                    type="button"
                    onClick={cycleCanvasLabelDisplayMode}
                    className="rounded-md border border-slate-600 px-2 py-1 text-xs text-slate-200 hover:border-slate-400"
                    title="Cycle through: Button numbers, Control names, Assigned functions"
                  >
                    {displayModeLabels[canvasLabelDisplayMode]}
                  </button>
                </div>
                <HardwareCanvas
                  imageUrl={template.imageUrl}
                  imageWidth={template.imageWidth}
                  imageHeight={template.imageHeight}
                  controls={template.controls}
                  selectedControlId={selectedControlId}
                  editable={false}
                  onSelectControl={setSelectedControlId}
                  isControlDimmed={(c) => !profile.bindings.some((b) => b.controlId === c.id)}
                  showNumbersOnly={true}
                  getBindingForControl={(controlId) => profile.bindings.find((b) => b.controlId === controlId)}
                  canvasLabelDisplayMode={canvasLabelDisplayMode}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[340px_1fr]">
                <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-900">
                  <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800 px-3 py-2">
                    <span className="text-xs font-medium text-slate-300">Canvas Labels</span>
                    <button
                      type="button"
                      onClick={cycleCanvasLabelDisplayMode}
                      className="rounded-md border border-slate-600 px-2 py-1 text-xs text-slate-200 hover:border-slate-400"
                      title="Cycle through: Button numbers, Control names, Assigned functions"
                    >
                      {displayModeLabels[canvasLabelDisplayMode]}
                    </button>
                  </div>
                  <HardwareCanvas
                    imageUrl={template.imageUrl}
                    imageWidth={template.imageWidth}
                    imageHeight={template.imageHeight}
                    controls={template.controls}
                    selectedControlId={selectedControlId}
                    editable={false}
                    onSelectControl={setSelectedControlId}
                    isControlDimmed={(c) => !profile.bindings.some((b) => b.controlId === c.id)}
                    showNumbersOnly={true}
                    hoveredControlId={hoveredControlId}
                    getBindingForControl={(controlId) => profile.bindings.find((b) => b.controlId === controlId)}
                    canvasLabelDisplayMode={canvasLabelDisplayMode}
                  />
                </div>
                <BindingsTable
                  controls={template.controls}
                  profile={profile}
                  selectedControlId={selectedControlId}
                  onSelectControl={setSelectedControlId}
                  onSaveBinding={setBinding}
                  onClearBinding={removeBinding}
                  functionSuggestionsListId={GAME_FUNCTION_DATALIST_ID}
                  hoveredControlId={hoveredControlId}
                  onHoverControl={setHoveredControlId}
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSaveProfile}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
              >
                Save profile
              </button>
              <button
                type="button"
                onClick={() => exportUserProfile(profile)}
                className="rounded-md border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:border-slate-400"
              >
                Export JSON
              </button>
              <button
                type="button"
                onClick={() => importInputRef.current?.click()}
                className="rounded-md border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:border-slate-400"
              >
                Import JSON
              </button>
              <Link
                to={`/print/${template.id}?profile=${profile.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:border-slate-400"
              >
                Print cheat sheet
              </Link>
              <span className="text-xs text-slate-500">
                {profile.bindings.length} / {template.controls.length} bound
              </span>
            </div>
            {saveError && <p className="text-sm text-red-400">{saveError}</p>}
          </>
        )}
        <input ref={importInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
        {importError && <p className="text-sm text-red-400">{importError}</p>}
      </div>

      <aside className="rounded-lg border border-slate-700 bg-slate-900 p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-200">Binding</h3>
        {profile ? (
          <BindingPanel
            control={selectedControl}
            binding={selectedBinding}
            onSave={setBinding}
            onClear={removeBinding}
            functionSuggestionsListId={GAME_FUNCTION_DATALIST_ID}
          />
        ) : (
          <p className="text-sm text-slate-400">Select or create a profile to assign bindings.</p>
        )}
      </aside>
    </div>
  )
}

function NewProfileForm({
  onCreate,
}: {
  onCreate: (params: { name: string; game?: string; vehicle?: string; track?: string }) => void
}) {
  const [name, setName] = useState('')
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-700 bg-slate-900 p-4">
      <Field label="New profile name">
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. iRacing Ferrari 296 GT3" />
      </Field>
      <button
        type="button"
        disabled={!name.trim()}
        onClick={() => onCreate({ name: name.trim() })}
        className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Create profile
      </button>
    </div>
  )
}
