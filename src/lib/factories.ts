import { generateId } from './id'
import type {
  Binding,
  ControlObject,
  ControlType,
  HardwareTemplate,
  UserProfile,
} from '../types/models'

// Low fill opacity + a crisp full-strength stroke reads as a clean outline
// "hotspot" annotation rather than a flat paint-bucket fill over the photo.
const DEFAULT_STYLE = {
  shape: 'rect' as const,
  fill: '#38bdf8',
  stroke: '#0ea5e9',
  opacity: 0.25,
}

const DEFAULT_SIZE_BY_TYPE: Record<ControlType, { width: number; height: number }> = {
  button: { width: 4, height: 4 },
  'rotary-encoder': { width: 6, height: 6 },
  'toggle-switch': { width: 3, height: 6 },
  'funky-switch': { width: 6, height: 6 },
  paddle: { width: 10, height: 4 },
  joystick: { width: 8, height: 8 },
  slider: { width: 10, height: 3 },
  custom: { width: 5, height: 5 },
}

let controlCounter = 0

export function createControlObject(
  type: ControlType,
  position: { x: number; y: number },
): ControlObject {
  controlCounter += 1
  return {
    id: generateId(),
    type,
    label: `${type}-${controlCounter}`,
    position,
    size: DEFAULT_SIZE_BY_TYPE[type],
    rotation: 0,
    labelRotation: 0,
    style: { ...DEFAULT_STYLE },
    notes: '',
    defaultBinding: '',
  }
}

export function createHardwareTemplate(params: {
  manufacturer: string
  model: string
  description?: string
  imageUrl: string
  imageWidth: number
  imageHeight: number
}): HardwareTemplate {
  const now = new Date().toISOString()
  return {
    id: generateId(),
    meta: {
      manufacturer: params.manufacturer,
      model: params.model,
      description: params.description,
    },
    imageUrl: params.imageUrl,
    imageWidth: params.imageWidth,
    imageHeight: params.imageHeight,
    controls: [],
    version: 1,
    isPublic: false,
    createdAt: now,
    updatedAt: now,
  }
}

/** Copies a (typically public, other-owned) template into a new one the caller owns. */
export function forkHardwareTemplate(source: HardwareTemplate): HardwareTemplate {
  const now = new Date().toISOString()
  return {
    ...source,
    id: generateId(),
    controls: source.controls.map((control) => ({ ...control })),
    version: 1,
    isPublic: false,
    creatorId: undefined,
    createdAt: now,
    updatedAt: now,
  }
}

/**
 * Starts a new template using a preset's control layout (metadata + all
 * ControlObjects, e.g. the built-in Conspit MAX 01 mapping) but the caller's
 * own uploaded image. Positions are already normalized percentages, so they
 * carry over onto any image — closest fidelity when the new photo has a
 * similar aspect ratio/framing to the one the preset was mapped from.
 */
export function createTemplateFromPresetControls(
  preset: HardwareTemplate,
  image: { imageUrl: string; imageWidth: number; imageHeight: number },
): HardwareTemplate {
  const now = new Date().toISOString()
  return {
    id: generateId(),
    meta: { ...preset.meta },
    imageUrl: image.imageUrl,
    imageWidth: image.imageWidth,
    imageHeight: image.imageHeight,
    controls: preset.controls.map((control) => ({ ...control, id: generateId() })),
    version: 1,
    isPublic: false,
    createdAt: now,
    updatedAt: now,
  }
}

export function createUserProfile(params: {
  hardwareTemplateId: string
  name: string
  game?: string
  vehicle?: string
  track?: string
}): UserProfile {
  const now = new Date().toISOString()
  return {
    id: generateId(),
    hardwareTemplateId: params.hardwareTemplateId,
    name: params.name,
    game: params.game,
    vehicle: params.vehicle,
    track: params.track,
    bindings: [],
    createdAt: now,
    updatedAt: now,
  }
}

export function createBinding(params: {
  controlId: string
  assignedFunction: string
  notes?: string
  category?: string
}): Binding {
  return {
    id: generateId(),
    controlId: params.controlId,
    assignedFunction: params.assignedFunction,
    notes: params.notes,
    category: params.category,
  }
}
