import { generateId } from './id'
import type {
  Binding,
  ControlObject,
  ControlType,
  HardwareTemplate,
  UserProfile,
} from '../types/models'

const DEFAULT_STYLE = {
  shape: 'rect' as const,
  fill: '#22d3ee',
  stroke: '#0e7490',
  opacity: 0.55,
}

const DEFAULT_SIZE_BY_TYPE: Record<ControlType, { width: number; height: number }> = {
  button: { width: 4, height: 4 },
  'rotary-encoder': { width: 6, height: 6 },
  'toggle-switch': { width: 3, height: 6 },
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
