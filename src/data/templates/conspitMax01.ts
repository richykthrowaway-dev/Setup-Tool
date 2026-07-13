import type { HardwareTemplate } from '../../types/models'

// This is a demo fixture only — proof that the engine works, not a
// hardcoded "MAX 01 mode". Any hardware image can produce an equivalent
// HardwareTemplate through the Template Creator. The image below is a
// generated placeholder standing in for a real product photo.

const IMAGE_WIDTH = 1200
const IMAGE_HEIGHT = 700

const PLACEHOLDER_IMAGE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}">
  <rect width="100%" height="100%" fill="#1e293b" />
  <rect x="20" y="20" width="${IMAGE_WIDTH - 40}" height="${IMAGE_HEIGHT - 40}" rx="24" fill="#111827" stroke="#334155" stroke-width="3" />
  <text x="50%" y="46%" text-anchor="middle" fill="#475569" font-family="system-ui, sans-serif" font-size="40" font-weight="600">
    Conspit MAX 01
  </text>
  <text x="50%" y="54%" text-anchor="middle" fill="#334155" font-family="system-ui, sans-serif" font-size="18">
    Placeholder image — replace by uploading a real device photo
  </text>
</svg>`.trim()

const PLACEHOLDER_IMAGE_URL = `data:image/svg+xml;utf8,${encodeURIComponent(PLACEHOLDER_IMAGE_SVG)}`

export const CONSPIT_MAX_01_TEMPLATE: HardwareTemplate = {
  id: 'example-conspit-max-01',
  meta: {
    manufacturer: 'Conspit',
    model: 'MAX 01',
    description: 'Example template shipped with SuperMapper to demonstrate the template engine.',
  },
  imageUrl: PLACEHOLDER_IMAGE_URL,
  imageWidth: IMAGE_WIDTH,
  imageHeight: IMAGE_HEIGHT,
  version: 1,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  controls: [
    {
      id: 'ctrl-left-rotary',
      type: 'rotary-encoder',
      label: 'Left Rotary Encoder',
      position: { x: 12, y: 40 },
      size: { width: 8, height: 14 },
      rotation: 0,
      style: { shape: 'circle', fill: '#22d3ee', stroke: '#0e7490', opacity: 0.55 },
      notes: 'Push-click rotary, detented.',
      defaultBinding: 'Brake Bias Adjustment',
    },
    {
      id: 'ctrl-right-rotary',
      type: 'rotary-encoder',
      label: 'Right Rotary Encoder',
      position: { x: 80, y: 40 },
      size: { width: 8, height: 14 },
      rotation: 0,
      style: { shape: 'circle', fill: '#22d3ee', stroke: '#0e7490', opacity: 0.55 },
      notes: 'Push-click rotary, detented.',
      defaultBinding: 'Traction Control Adjustment',
    },
    {
      id: 'ctrl-left-paddle',
      type: 'paddle',
      label: 'Left Paddle',
      position: { x: 4, y: 12 },
      size: { width: 14, height: 8 },
      rotation: -8,
      style: { shape: 'rect', fill: '#f97316', stroke: '#9a3412', opacity: 0.55 },
      defaultBinding: 'Clutch / Shift Down',
    },
    {
      id: 'ctrl-right-paddle',
      type: 'paddle',
      label: 'Right Paddle',
      position: { x: 82, y: 12 },
      size: { width: 14, height: 8 },
      rotation: 8,
      style: { shape: 'rect', fill: '#f97316', stroke: '#9a3412', opacity: 0.55 },
      defaultBinding: 'Shift Up',
    },
    {
      id: 'ctrl-button-1',
      type: 'button',
      label: 'Button 1',
      position: { x: 38, y: 24 },
      size: { width: 5, height: 6 },
      rotation: 0,
      style: { shape: 'rect', fill: '#a3e635', stroke: '#3f6212', opacity: 0.55 },
      defaultBinding: '',
    },
    {
      id: 'ctrl-button-2',
      type: 'button',
      label: 'Button 2',
      position: { x: 46, y: 24 },
      size: { width: 5, height: 6 },
      rotation: 0,
      style: { shape: 'rect', fill: '#a3e635', stroke: '#3f6212', opacity: 0.55 },
      defaultBinding: '',
    },
    {
      id: 'ctrl-button-3',
      type: 'button',
      label: 'Button 3',
      position: { x: 54, y: 24 },
      size: { width: 5, height: 6 },
      rotation: 0,
      style: { shape: 'rect', fill: '#a3e635', stroke: '#3f6212', opacity: 0.55 },
      defaultBinding: '',
    },
    {
      id: 'ctrl-button-4',
      type: 'button',
      label: 'Button 4',
      position: { x: 62, y: 24 },
      size: { width: 5, height: 6 },
      rotation: 0,
      style: { shape: 'rect', fill: '#a3e635', stroke: '#3f6212', opacity: 0.55 },
      defaultBinding: '',
    },
    {
      id: 'ctrl-toggle-1',
      type: 'toggle-switch',
      label: 'Toggle Switch',
      position: { x: 46, y: 60 },
      size: { width: 4, height: 10 },
      rotation: 0,
      style: { shape: 'rect', fill: '#e879f9', stroke: '#86198f', opacity: 0.55 },
      defaultBinding: 'Ignition',
    },
    {
      id: 'ctrl-joystick-1',
      type: 'joystick',
      label: 'D-Pad Hat',
      position: { x: 60, y: 58 },
      size: { width: 9, height: 9 },
      rotation: 0,
      style: { shape: 'circle', fill: '#60a5fa', stroke: '#1d4ed8', opacity: 0.55 },
      defaultBinding: 'Menu Navigation',
    },
  ],
}
