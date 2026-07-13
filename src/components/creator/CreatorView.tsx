import { useRef, useState } from 'react'
import { useTemplateStore } from '../../store/templateStore'
import { useLibraryStore } from '../../store/libraryStore'
import { HardwareCanvas } from '../canvas/HardwareCanvas'
import { ImageUploader } from '../shared/ImageUploader'
import { ControlToolbar } from './ControlToolbar'
import { ControlPropertiesPanel } from './ControlPropertiesPanel'
import { TemplateLibraryBar } from '../shared/TemplateLibraryBar'
import { exportHardwareTemplate, importHardwareTemplate, ImportValidationError } from '../../services/io/exportImport'
import { CONSPIT_MAX_01_TEMPLATE } from '../../data/templates/conspitMax01'
import type { ControlType } from '../../types/models'

export function CreatorView() {
  const template = useTemplateStore((s) => s.template)
  const selectedControlId = useTemplateStore((s) => s.selectedControlId)
  const startNewTemplate = useTemplateStore((s) => s.startNewTemplate)
  const updateMeta = useTemplateStore((s) => s.updateMeta)
  const addControl = useTemplateStore((s) => s.addControl)
  const updateControl = useTemplateStore((s) => s.updateControl)
  const removeControl = useTemplateStore((s) => s.removeControl)
  const selectControl = useTemplateStore((s) => s.selectControl)
  const saveTemplate = useTemplateStore((s) => s.saveTemplate)
  const loadTemplate = useTemplateStore((s) => s.loadTemplate)
  const clearTemplate = useTemplateStore((s) => s.clearTemplate)

  const refreshTemplates = useLibraryStore((s) => s.refreshTemplates)

  const [pendingType, setPendingType] = useState<ControlType | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  const selectedControl = template?.controls.find((c) => c.id === selectedControlId) ?? null

  async function handleSave() {
    await saveTemplate()
    await refreshTemplates()
  }

  function handleCanvasClick(position: { x: number; y: number }) {
    if (!pendingType) return
    addControl(pendingType, position)
    setPendingType(null)
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const imported = await importHardwareTemplate(file)
      loadTemplate(imported)
      setImportError(null)
    } catch (err) {
      setImportError(err instanceof ImportValidationError ? err.message : 'Import failed.')
    }
  }

  if (!template) {
    return (
      <div className="flex flex-col gap-6">
        <TemplateLibraryBar onLoad={loadTemplate} />
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
          <h2 className="text-lg font-semibold text-slate-100">Start a hardware template</h2>
          <p className="text-sm text-slate-400">
            Upload a photo of any sim racing device — wheel, button box, shifter, pedals, dash — and turn it into an
            interactive, reusable template.
          </p>
          <ImageUploader
            label="Upload image to start"
            onImageLoaded={({ imageUrl, width, height }) =>
              startNewTemplate({ manufacturer: '', model: 'Untitled Device', imageUrl, imageWidth: width, imageHeight: height })
            }
          />
          <div className="text-xs text-slate-500">or</div>
          <button
            type="button"
            onClick={() => importInputRef.current?.click()}
            className="rounded-md border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:border-slate-400"
          >
            Import a template JSON file
          </button>
          <button
            type="button"
            onClick={() => loadTemplate(CONSPIT_MAX_01_TEMPLATE)}
            className="text-xs text-slate-500 underline hover:text-slate-300"
          >
            Or load the Conspit MAX 01 example
          </button>
          <input ref={importInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
          {importError && <p className="text-sm text-red-400">{importError}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex min-w-0 flex-col gap-4">
        <TemplateLibraryBar activeTemplateId={template.id} onLoad={loadTemplate} onNew={clearTemplate} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input
            className="input"
            placeholder="Manufacturer"
            value={template.meta.manufacturer}
            onChange={(e) => updateMeta({ manufacturer: e.target.value })}
          />
          <input
            className="input"
            placeholder="Model"
            value={template.meta.model}
            onChange={(e) => updateMeta({ model: e.target.value })}
          />
          <input
            className="input"
            placeholder="Description (optional)"
            value={template.meta.description ?? ''}
            onChange={(e) => updateMeta({ description: e.target.value })}
          />
        </div>

        <ControlToolbar pendingType={pendingType} onSelectType={setPendingType} />

        <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-900">
          <HardwareCanvas
            imageUrl={template.imageUrl}
            imageWidth={template.imageWidth}
            imageHeight={template.imageHeight}
            controls={template.controls}
            selectedControlId={selectedControlId}
            editable
            onSelectControl={selectControl}
            onChangeControl={updateControl}
            onCanvasClick={handleCanvasClick}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Save template (v{template.version})
          </button>
          <button
            type="button"
            onClick={() => exportHardwareTemplate(template)}
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
          <span className="text-xs text-slate-500">{template.controls.length} control(s)</span>
        </div>
        <input ref={importInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
        {importError && <p className="text-sm text-red-400">{importError}</p>}
      </div>

      <aside className="rounded-lg border border-slate-700 bg-slate-900 p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-200">Control properties</h3>
        <ControlPropertiesPanel control={selectedControl} onChange={updateControl} onDelete={removeControl} />
      </aside>
    </div>
  )
}
