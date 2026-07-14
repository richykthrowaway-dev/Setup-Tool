import type { HardwareTemplate } from '../../types/models'

// This is a demo fixture only — proof that the engine works, not a
// hardcoded "MAX 01 mode". Any hardware image can produce an equivalent
// HardwareTemplate through the Template Creator.
//
// The control layout and image below come from an actual Conspit MAX 01
// product photo, uploaded through the app's "Upload your MAX 01 photo"
// flow (Template Creator empty state) and refined from there.

export const CONSPIT_MAX_01_TEMPLATE: HardwareTemplate = {
  id: 'example-conspit-max-01',
  meta: {
    manufacturer: 'Conspit',
    model: 'MAX 01',
    description: 'Example template shipped with SuperMapper — control layout mapped from a real product photo.',
  },
  imageUrl: '/examples/conspit-max-01.webp',
  imageWidth: 1500,
  imageHeight: 1000,
  version: 1,
  isPublic: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  controls: [
    {
      id: 'fc2fbe88-f5ec-4380-9687-dba3d90ff875',
      type: 'rotary-encoder',
      label: 'DRS',
      position: {
        x: 16.26,
        y: 16.23
      },
      size: {
        width: 5,
        height: 5
      },
      rotation: 0,
      labelRotation: 0,
      style: {
        shape: 'circle',
        fill: '#22d3ee',
        stroke: '#0e7490',
        opacity: 0.22
      },
      notes: 'Push-click rotary.',
      defaultBinding: 'DRS Activation'
    },
    {
      id: 'd0a0b266-c97d-4932-84d6-893775b5e5d9',
      type: 'rotary-encoder',
      label: 'P',
      position: {
        x: 78.9,
        y: 17.19
      },
      size: {
        width: 5,
        height: 5
      },
      rotation: 0,
      labelRotation: 0,
      style: {
        shape: 'circle',
        fill: '#fb923c',
        stroke: '#9a3412',
        opacity: 0.22
      },
      notes: 'Push-click rotary.',
      defaultBinding: 'Pit Limiter'
    },
    {
      id: '6822825b-afcd-489c-90b9-1302b8205248',
      type: 'button',
      label: 'N',
      position: {
        x: 24.13,
        y: 20.26
      },
      size: {
        width: 5,
        height: 5
      },
      rotation: 0,
      labelRotation: 0,
      style: {
        shape: 'circle',
        fill: '#4ade80',
        stroke: '#15803d',
        opacity: 0.22
      },
      defaultBinding: 'Neutral'
    },
    {
      id: 'ca773be7-8b07-4dda-9eab-41ce59d15648',
      type: 'button',
      label: 'FCY',
      position: {
        x: 71.55,
        y: 20.84
      },
      size: {
        width: 5,
        height: 5
      },
      rotation: 0,
      labelRotation: 0,
      style: {
        shape: 'circle',
        fill: '#facc15',
        stroke: '#a16207',
        opacity: 0.22
      },
      defaultBinding: 'Full Course Yellow Flag'
    },
    {
      id: 'c60e54f8-896f-4737-a588-b90296ee0ef1',
      type: 'paddle',
      label: 'Left Rotary Paddle',
      position: {
        x: 9.23,
        y: 21.13
      },
      size: {
        width: 3,
        height: 10
      },
      rotation: 0,
      labelRotation: 0,
      style: {
        shape: 'ellipse',
        fill: '#a78bfa',
        stroke: '#5b21b6',
        opacity: 0.22
      },
      notes: 'Knurled rotary paddle mounted on the grip.',
      defaultBinding: ''
    },
    {
      id: 'ea4b139b-2723-42ec-ab27-7ab0aa48b9b2',
      type: 'rotary-encoder',
      label: 'Right Rotary Paddle',
      position: {
        x: 88.32,
        y: 22.87
      },
      size: {
        width: 3,
        height: 10
      },
      rotation: -1,
      labelRotation: 0,
      style: {
        shape: 'ellipse',
        fill: '#a78bfa',
        stroke: '#5b21b6',
        opacity: 0.22
      },
      notes: 'Knurled rotary paddle mounted on the grip.',
      defaultBinding: ''
    },
    {
      id: '0d7eed39-312d-4520-8ad8-0fa284fadccf',
      type: 'button',
      label: 'Radio / PTT',
      position: {
        x: 27,
        y: 37.93
      },
      size: {
        width: 5,
        height: 5
      },
      rotation: 0,
      labelRotation: 0,
      style: {
        shape: 'circle',
        fill: '#f472b6',
        stroke: '#9d174d',
        opacity: 0.22
      },
      defaultBinding: 'Push-to-Talk'
    },
    {
      id: '2856bd70-f247-439a-b535-904b31c416bf',
      type: 'button',
      label: 'Wiper',
      position: {
        x: 68.42,
        y: 38.71
      },
      size: {
        width: 5,
        height: 5
      },
      rotation: 0,
      labelRotation: 0,
      style: {
        shape: 'circle',
        fill: '#f472b6',
        stroke: '#9d174d',
        opacity: 0.22
      },
      defaultBinding: 'Wiper Toggle'
    },
    {
      id: '4cd86e32-66b9-4a99-8fcf-6b6fa144923c',
      type: 'funky-switch',
      label: 'MULTI',
      position: {
        x: 25.13,
        y: 47.16
      },
      size: {
        width: 4,
        height: 4
      },
      rotation: 0,
      labelRotation: 0,
      style: {
        shape: 'rect',
        fill: '#fbbf24',
        stroke: '#92400e',
        opacity: 0.22
      },
      notes: '7-way directional switch (N/NE/E/SE/S/SW/W + center push) for quick multi-function access.',
      defaultBinding: 'Multi-function Adjustment'
    },
    {
      id: '514cc422-a061-421b-8c8b-76fa975ac435',
      type: 'funky-switch',
      label: 'MENU',
      position: {
        x: 72.19,
        y: 48.13
      },
      size: {
        width: 4,
        height: 4
      },
      rotation: 0,
      labelRotation: 0,
      style: {
        shape: 'rect',
        fill: '#fbbf24',
        stroke: '#92400e',
        opacity: 0.22
      },
      notes: '7-way directional switch (N/NE/E/SE/S/SW/W + center push) for dash menu navigation.',
      defaultBinding: 'Menu Navigation'
    },
    {
      id: 'a9785aa6-1b40-4656-82fa-543bd797d7bc',
      type: 'button',
      label: 'OK',
      position: {
        x: 26.39,
        y: 56.58
      },
      size: {
        width: 5,
        height: 5
      },
      rotation: 0,
      labelRotation: 0,
      style: {
        shape: 'circle',
        fill: '#f87171',
        stroke: '#991b1b',
        opacity: 0.22
      },
      defaultBinding: 'Confirm'
    },
    {
      id: 'b0e85b62-3fbf-49b7-ac4f-1dcffebe6426',
      type: 'button',
      label: 'Right Function Button',
      position: {
        x: 68.26,
        y: 56.39
      },
      size: {
        width: 5,
        height: 5
      },
      rotation: 0,
      labelRotation: 0,
      style: {
        shape: 'circle',
        fill: '#22d3ee',
        stroke: '#0e7490',
        opacity: 0.22
      },
      defaultBinding: ''
    },
    {
      id: 'cd39c8c2-33f5-4038-a6a0-6484013d7f71',
      type: 'joystick',
      label: 'Left Thumbstick',
      position: {
        x: 27.74,
        y: 71
      },
      size: {
        width: 5,
        height: 5
      },
      rotation: 0,
      labelRotation: 0,
      style: {
        shape: 'circle',
        fill: '#c084fc',
        stroke: '#6b21a8',
        opacity: 0.22
      },
      defaultBinding: ''
    },
    {
      id: '633d0e61-218e-4085-8001-9d36ef68cc89',
      type: 'joystick',
      label: 'Right Thumbstick',
      position: {
        x: 67.16,
        y: 70.23
      },
      size: {
        width: 5,
        height: 5
      },
      rotation: 0,
      labelRotation: 0,
      style: {
        shape: 'circle',
        fill: '#22d3ee',
        stroke: '#0e7490',
        opacity: 0.22
      },
      defaultBinding: ''
    },
    {
      id: 'b6594d64-1d2e-4c70-b41c-3aa891ff529d',
      type: 'rotary-encoder',
      label: 'MAP',
      position: {
        x: 34.23,
        y: 61.55
      },
      size: {
        width: 5,
        height: 5
      },
      rotation: 0,
      labelRotation: 0,
      style: {
        shape: 'circle',
        fill: '#c084fc',
        stroke: '#6b21a8',
        opacity: 0.22
      },
      defaultBinding: 'Engine Map Select'
    },
    {
      id: 'f4c52b77-9291-40ba-a084-c98c2cfc69e5',
      type: 'rotary-encoder',
      label: 'DELTA (left)',
      position: {
        x: 41.74,
        y: 71.09
      },
      size: {
        width: 5,
        height: 5
      },
      rotation: 0,
      labelRotation: 0,
      style: {
        shape: 'circle',
        fill: '#c084fc',
        stroke: '#c084fc',
        opacity: 0.22
      },
      defaultBinding: ''
    },
    {
      id: 'c20f7a92-b372-46b3-a34a-5c1aa1b1cb92',
      type: 'rotary-encoder',
      label: 'DELTA (right)',
      position: {
        x: 53.39,
        y: 70.7
      },
      size: {
        width: 5,
        height: 5
      },
      rotation: 0,
      labelRotation: 0,
      style: {
        shape: 'circle',
        fill: '#c084fc',
        stroke: '#6b21a8',
        opacity: 0.22
      },
      defaultBinding: ''
    },
    {
      id: 'e9f0d519-274d-4c07-95e6-c4c66f463cbf',
      type: 'rotary-encoder',
      label: 'MODE',
      position: {
        x: 61.03,
        y: 62.32
      },
      size: {
        width: 5,
        height: 5
      },
      rotation: 0,
      labelRotation: 0,
      style: {
        shape: 'circle',
        fill: '#c084fc',
        stroke: '#6b21a8',
        opacity: 0.22
      },
      defaultBinding: 'Dash Mode'
    }
  ],
}
