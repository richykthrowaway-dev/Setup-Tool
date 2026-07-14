// Core domain model for SuperMapper.
//
// Strict separation is intentional:
// - HardwareTemplate + ControlObject describe the physical device (shape/layout).
// - UserProfile + Binding describe a user's software mapping of that device.
// A template never references a profile; a profile references a template by id
// and its controls by id only, so one physical device can back many profiles.

export const CONTROL_TYPES = [
  'button',
  'rotary-encoder',
  'toggle-switch',
  'funky-switch',
  'paddle',
  'joystick',
  'slider',
  'custom',
] as const

export type ControlType = (typeof CONTROL_TYPES)[number]

export const CONTROL_SHAPES = ['rect', 'circle', 'ellipse', 'triangle', 'diamond', 'hexagon', 'star'] as const
export type ControlShape = (typeof CONTROL_SHAPES)[number]

/** Percentage-based position, relative to the source image (0-100). */
export interface NormalizedPosition {
  x: number
  y: number
}

/** Percentage-based size, relative to the source image dimensions (0-100). */
export interface NormalizedSize {
  width: number
  height: number
}

export interface ControlStyle {
  shape: ControlShape
  fill: string
  stroke: string
  opacity: number
}

/** A single physical input on a piece of hardware (button, encoder, etc). */
export interface ControlObject {
  id: string
  type: ControlType
  label: string
  position: NormalizedPosition
  size: NormalizedSize
  /** Rotation of the marker shape, in degrees. */
  rotation: number
  /**
   * Extra rotation applied to the label only, on top of automatically
   * counter-rotating the marker's own rotation — so by default (0) the
   * label stays upright even when the marker itself is tilted.
   */
  labelRotation?: number
  style: ControlStyle
  notes?: string
  /** Optional suggested binding shown until the user assigns their own. */
  defaultBinding?: string
}

export interface HardwareTemplateMeta {
  manufacturer: string
  model: string
  description?: string
}

/** A reusable, device-agnostic description of a piece of sim racing hardware. */
export interface HardwareTemplate {
  id: string
  meta: HardwareTemplateMeta
  /** Data URL or storage reference for the background image. */
  imageUrl: string
  imageWidth: number
  imageHeight: number
  controls: ControlObject[]
  version: number
  creatorId?: string
  /** Visible to other users in the community gallery. Ignored in local demo mode. */
  isPublic?: boolean
  createdAt: string
  updatedAt: string
}

/** A software assignment for one control, scoped to a single profile. */
export interface Binding {
  id: string
  controlId: string
  assignedFunction: string
  notes?: string
  category?: string
}

/** A user's personal configuration of a hardware template for one context. */
export interface UserProfile {
  id: string
  userId?: string
  hardwareTemplateId: string
  name: string
  game?: string
  vehicle?: string
  track?: string
  bindings: Binding[]
  createdAt: string
  updatedAt: string
}

export const CONTROL_TYPE_LABELS: Record<ControlType, string> = {
  button: 'Button',
  'rotary-encoder': 'Rotary Encoder',
  'toggle-switch': 'Toggle Switch',
  'funky-switch': '7-Way Funky Switch',
  paddle: 'Paddle',
  joystick: 'Joystick',
  slider: 'Slider',
  custom: 'Custom',
}
