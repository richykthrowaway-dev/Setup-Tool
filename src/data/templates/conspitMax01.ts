import type { HardwareTemplate } from '../../types/models'

// This is a demo fixture only — proof that the engine works, not a
// hardcoded "MAX 01 mode". Any hardware image can produce an equivalent
// HardwareTemplate through the Template Creator.
//
// The control layout below is mapped from an actual Conspit MAX 01 product
// photo (all 20 physical controls, positioned/sized to match). The image
// itself is still a placeholder pending the real photo file — swap
// PLACEHOLDER_IMAGE_URL (and IMAGE_WIDTH/IMAGE_HEIGHT if the aspect ratio
// differs) for a hosted URL of the real photo and the overlay will line up.

const IMAGE_WIDTH = 1500
const IMAGE_HEIGHT = 1000

const PLACEHOLDER_IMAGE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}">
  <rect width="100%" height="100%" fill="#f8fafc" />
  <rect x="20" y="20" width="${IMAGE_WIDTH - 40}" height="${IMAGE_HEIGHT - 40}" rx="24" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="3" />
  <text x="50%" y="46%" text-anchor="middle" fill="#64748b" font-family="system-ui, sans-serif" font-size="40" font-weight="600">
    Conspit MAX 01
  </text>
  <text x="50%" y="54%" text-anchor="middle" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="18">
    Placeholder — swap in the real product photo, layout is already mapped
  </text>
</svg>`.trim()

const PLACEHOLDER_IMAGE_URL = `data:image/svg+xml;utf8,${encodeURIComponent(PLACEHOLDER_IMAGE_SVG)}`

const WHITE = { shape: 'rect', fill: '#f8fafc', stroke: '#94a3b8', opacity: 0.6 } as const
const TEAL = { shape: 'circle', fill: '#22d3ee', stroke: '#0e7490', opacity: 0.55 } as const
const ORANGE = { shape: 'circle', fill: '#fb923c', stroke: '#9a3412', opacity: 0.55 } as const
const GREEN = { shape: 'circle', fill: '#4ade80', stroke: '#15803d', opacity: 0.55 } as const
const GOLD = { shape: 'circle', fill: '#facc15', stroke: '#a16207', opacity: 0.55 } as const
const FUNKY = { shape: 'rect', fill: '#fbbf24', stroke: '#92400e', opacity: 0.55 } as const
const PURPLE_ROTARY = { shape: 'rect', fill: '#a78bfa', stroke: '#5b21b6', opacity: 0.55 } as const
const PINK = { shape: 'circle', fill: '#f472b6', stroke: '#9d174d', opacity: 0.55 } as const
const RED = { shape: 'circle', fill: '#f87171', stroke: '#991b1b', opacity: 0.55 } as const
const PURPLE_KNOB = { shape: 'circle', fill: '#c084fc', stroke: '#6b21a8', opacity: 0.55 } as const

export const CONSPIT_MAX_01_TEMPLATE: HardwareTemplate = {
  id: 'example-conspit-max-01',
  meta: {
    manufacturer: 'Conspit',
    model: 'MAX 01',
    description: 'Example template shipped with SuperMapper — control layout mapped from a real product photo.',
  },
  imageUrl: PLACEHOLDER_IMAGE_URL,
  imageWidth: IMAGE_WIDTH,
  imageHeight: IMAGE_HEIGHT,
  version: 1,
  isPublic: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  controls: [
    {
      id: 'ctrl-set',
      type: 'button',
      label: 'SET',
      position: { x: 8, y: 13 },
      size: { width: 8, height: 5 },
      rotation: -20,
      style: WHITE,
      defaultBinding: '',
    },
    {
      id: 'ctrl-bias-flag',
      type: 'button',
      label: 'BIAS (flag)',
      position: { x: 85, y: 13 },
      size: { width: 8, height: 5 },
      rotation: 20,
      style: WHITE,
      defaultBinding: '',
    },
    {
      id: 'ctrl-drs',
      type: 'rotary-encoder',
      label: 'DRS',
      position: { x: 16, y: 17 },
      size: { width: 6, height: 6 },
      rotation: 0,
      style: TEAL,
      notes: 'Push-click rotary.',
      defaultBinding: 'DRS Activation',
    },
    {
      id: 'ctrl-p-knob',
      type: 'rotary-encoder',
      label: 'P',
      position: { x: 78, y: 17 },
      size: { width: 6, height: 6 },
      rotation: 0,
      style: ORANGE,
      notes: 'Push-click rotary.',
      defaultBinding: 'Pit Limiter',
    },
    {
      id: 'ctrl-n',
      type: 'button',
      label: 'N',
      position: { x: 24, y: 22 },
      size: { width: 5, height: 6 },
      rotation: 0,
      style: GREEN,
      defaultBinding: 'Neutral',
    },
    {
      id: 'ctrl-fcy',
      type: 'button',
      label: 'FCY',
      position: { x: 70, y: 22 },
      size: { width: 5, height: 6 },
      rotation: 0,
      style: GOLD,
      defaultBinding: 'Full Course Yellow Flag',
    },
    {
      id: 'ctrl-left-rotary-paddle',
      type: 'paddle',
      label: 'Left Rotary Paddle',
      position: { x: 5, y: 25 },
      size: { width: 5, height: 10 },
      rotation: -15,
      style: PURPLE_ROTARY,
      notes: 'Knurled rotary paddle mounted on the grip.',
      defaultBinding: '',
    },
    {
      id: 'ctrl-right-rotary-paddle',
      type: 'paddle',
      label: 'Right Rotary Paddle',
      position: { x: 90, y: 25 },
      size: { width: 5, height: 10 },
      rotation: 15,
      style: PURPLE_ROTARY,
      notes: 'Knurled rotary paddle mounted on the grip.',
      defaultBinding: '',
    },
    {
      id: 'ctrl-mic',
      type: 'button',
      label: 'Radio / PTT',
      position: { x: 27, y: 36 },
      size: { width: 6, height: 6 },
      rotation: 0,
      style: PINK,
      defaultBinding: 'Push-to-Talk',
    },
    {
      id: 'ctrl-wiper',
      type: 'button',
      label: 'Wiper',
      position: { x: 67, y: 36 },
      size: { width: 6, height: 6 },
      rotation: 0,
      style: PINK,
      defaultBinding: 'Wiper Toggle',
    },
    {
      id: 'ctrl-multi',
      type: 'funky-switch',
      label: 'MULTI',
      position: { x: 25, y: 46 },
      size: { width: 5, height: 5 },
      rotation: 0,
      style: FUNKY,
      notes: '7-way directional switch (N/NE/E/SE/S/SW/W + center push) for quick multi-function access.',
      defaultBinding: 'Multi-function Adjustment',
    },
    {
      id: 'ctrl-menu',
      type: 'funky-switch',
      label: 'MENU',
      position: { x: 70, y: 46 },
      size: { width: 5, height: 5 },
      rotation: 0,
      style: FUNKY,
      notes: '7-way directional switch (N/NE/E/SE/S/SW/W + center push) for dash menu navigation.',
      defaultBinding: 'Menu Navigation',
    },
    {
      id: 'ctrl-ok',
      type: 'button',
      label: 'OK',
      position: { x: 26, y: 56 },
      size: { width: 6, height: 6 },
      rotation: 0,
      style: RED,
      defaultBinding: 'Confirm',
    },
    {
      id: 'ctrl-right-function',
      type: 'button',
      label: 'Right Function Button',
      position: { x: 68, y: 56 },
      size: { width: 6, height: 6 },
      rotation: 0,
      style: TEAL,
      defaultBinding: '',
    },
    {
      id: 'ctrl-left-thumbstick',
      type: 'joystick',
      label: 'Left Thumbstick',
      position: { x: 28, y: 71 },
      size: { width: 6, height: 6 },
      rotation: 0,
      style: { shape: 'circle', fill: '#c084fc', stroke: '#6b21a8', opacity: 0.55 },
      defaultBinding: '',
    },
    {
      id: 'ctrl-right-thumbstick',
      type: 'joystick',
      label: 'Right Thumbstick',
      position: { x: 66, y: 71 },
      size: { width: 6, height: 6 },
      rotation: 0,
      style: TEAL,
      defaultBinding: '',
    },
    {
      id: 'ctrl-map',
      type: 'rotary-encoder',
      label: 'MAP',
      position: { x: 35, y: 66 },
      size: { width: 5, height: 5 },
      rotation: 0,
      style: PURPLE_KNOB,
      defaultBinding: 'Engine Map Select',
    },
    {
      id: 'ctrl-delta-left',
      type: 'rotary-encoder',
      label: 'DELTA (left)',
      position: { x: 42, y: 62 },
      size: { width: 5, height: 5 },
      rotation: 0,
      style: PURPLE_KNOB,
      defaultBinding: '',
    },
    {
      id: 'ctrl-delta-right',
      type: 'rotary-encoder',
      label: 'DELTA (right)',
      position: { x: 53, y: 62 },
      size: { width: 5, height: 5 },
      rotation: 0,
      style: PURPLE_KNOB,
      defaultBinding: '',
    },
    {
      id: 'ctrl-mode',
      type: 'rotary-encoder',
      label: 'MODE',
      position: { x: 60, y: 66 },
      size: { width: 5, height: 5 },
      rotation: 0,
      style: PURPLE_KNOB,
      defaultBinding: 'Dash Mode',
    },
  ],
}
