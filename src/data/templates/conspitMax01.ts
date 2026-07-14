import type { HardwareTemplate } from '../../types/models'

// This is a demo fixture only — proof that the engine works, not a
// hardcoded "MAX 01 mode". Any hardware image can produce an equivalent
// HardwareTemplate through the Template Creator.
//
// The control layout and image below come from an actual Conspit MAX 01
// product photo, uploaded through the app's "Upload your MAX 01 photo"
// flow (Template Creator empty state) and refined from there.
//
// Labels are deliberately neutral (position/type only, e.g. "Rotary 3
// (lower left)") rather than named after whatever function label sticker
// happened to be on the photographed unit — those stickers were applied
// by a previous owner, not the manufacturer, and don't reflect a verified
// control layout. defaultBinding is left blank for the same reason: we
// don't want to suggest a specific software function we can't vouch for.

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
      id: '775e818d-a3a3-40aa-b418-7c4975422d92',
      type: 'rotary-encoder',
      label: 'Rotary 1 (top left)',
      position: {
        x: 17.29,
        y: 17.2
      },
      size: {
        width: 4,
        height: 4
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
      defaultBinding: ''
    },
    {
      id: '657ea92c-ea0c-4a0d-a541-f73ee4f3c995',
      type: 'rotary-encoder',
      label: 'Rotary 2 (top right)',
      position: {
        x: 79.42,
        y: 17.77
      },
      size: {
        width: 4,
        height: 4
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
      defaultBinding: ''
    },
    {
      id: '6620bcd1-d080-4cce-a6ad-5655f710c7c6',
      type: 'button',
      label: 'Button 1 (upper left)',
      position: {
        x: 24.78,
        y: 21.03
      },
      size: {
        width: 4,
        height: 4
      },
      rotation: 0,
      labelRotation: 0,
      style: {
        shape: 'circle',
        fill: '#4ade80',
        stroke: '#15803d',
        opacity: 0.22
      },
      defaultBinding: ''
    },
    {
      id: '6a71a61c-2fde-4201-85be-a9cbc20b94d0',
      type: 'button',
      label: 'Button 2 (upper right)',
      position: {
        x: 72.2,
        y: 21.61
      },
      size: {
        width: 4,
        height: 4
      },
      rotation: 0,
      labelRotation: 0,
      style: {
        shape: 'circle',
        fill: '#facc15',
        stroke: '#a16207',
        opacity: 0.22
      },
      defaultBinding: ''
    },
    {
      id: '1ddce6b8-4702-4cb0-9a54-a388faee8078',
      type: 'paddle',
      label: 'Rotary Paddle (left)',
      position: {
        x: 9.23,
        y: 21.13
      },
      size: {
        width: 3,
        height: 10
      },
      rotation: -80,
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
      id: 'bef8657d-a2a7-4cb2-9147-24f36283d34a',
      type: 'rotary-encoder',
      label: 'Rotary Paddle (right)',
      position: {
        x: 87.8,
        y: 22.29
      },
      size: {
        width: 3,
        height: 10
      },
      rotation: 80,
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
      id: '5530dcd8-6095-4168-bb1f-974e63876ef0',
      type: 'button',
      label: 'Button 3 (left grip)',
      position: {
        x: 28.16,
        y: 37.16
      },
      size: {
        width: 4,
        height: 4
      },
      rotation: 0,
      labelRotation: 0,
      style: {
        shape: 'circle',
        fill: '#f472b6',
        stroke: '#9d174d',
        opacity: 0.22
      },
      defaultBinding: ''
    },
    {
      id: 'bd0f46c6-db6a-475b-9e09-bfc37facd749',
      type: 'button',
      label: 'Button 4 (right grip)',
      position: {
        x: 68.81,
        y: 38.13
      },
      size: {
        width: 4,
        height: 4
      },
      rotation: 0,
      labelRotation: 0,
      style: {
        shape: 'circle',
        fill: '#f472b6',
        stroke: '#9d174d',
        opacity: 0.22
      },
      defaultBinding: ''
    },
    {
      id: 'e5ae5e13-5e91-4b15-8a4a-52c3610c0d05',
      type: 'funky-switch',
      label: 'Funky Switch (left)',
      position: {
        x: 25.78,
        y: 47.55
      },
      size: {
        width: 3,
        height: 3
      },
      rotation: 0,
      labelRotation: 0,
      style: {
        shape: 'diamond',
        fill: '#fff705',
        stroke: '#92400e',
        opacity: 0.22
      },
      notes: '7-way directional switch (N/NE/E/SE/S/SW/W + center push).',
      defaultBinding: ''
    },
    {
      id: '59ef72c2-418b-463d-bba6-2a1611f9d912',
      type: 'funky-switch',
      label: 'Funky Switch (right)',
      position: {
        x: 71.54,
        y: 47.36
      },
      size: {
        width: 3,
        height: 3
      },
      rotation: 0,
      labelRotation: 0,
      style: {
        shape: 'diamond',
        fill: '#fff705',
        stroke: '#92400e',
        opacity: 0.22
      },
      notes: '7-way directional switch (N/NE/E/SE/S/SW/W + center push).',
      defaultBinding: ''
    },
    {
      id: '1b3c86a3-b9c7-45cd-b3a1-7af9bb51a116',
      type: 'button',
      label: 'Button 5 (large, left)',
      position: {
        x: 27.16,
        y: 55.81
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
      defaultBinding: ''
    },
    {
      id: '2a83be73-df63-4b58-91d0-1e3e47a8f5cb',
      type: 'button',
      label: 'Button 6 (right)',
      position: {
        x: 69.42,
        y: 56.39
      },
      size: {
        width: 4,
        height: 4
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
      id: '52356cf8-3288-4278-b809-86125032abd0',
      type: 'joystick',
      label: 'Thumbstick (left)',
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
        fill: '#2ecc6b',
        stroke: '#6b21a8',
        opacity: 0.22
      },
      defaultBinding: ''
    },
    {
      id: 'd6da7377-926f-4bad-a041-b9baaf84aae7',
      type: 'joystick',
      label: 'Thumbstick (right)',
      position: {
        x: 67.68,
        y: 71
      },
      size: {
        width: 4,
        height: 4
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
      id: '58b3af1c-910d-4477-a0a0-8b4f0452105f',
      type: 'rotary-encoder',
      label: 'Rotary 3 (lower left)',
      position: {
        x: 34.62,
        y: 62.32
      },
      size: {
        width: 4,
        height: 4
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
      id: '4793409a-9250-4674-b687-efa7917564a7',
      type: 'rotary-encoder',
      label: 'Rotary 4 (bottom left)',
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
      id: 'e552d635-31d1-4c42-a395-528b917502d3',
      type: 'rotary-encoder',
      label: 'Rotary 5 (bottom right)',
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
      id: 'a9acd265-50f1-4b20-965d-f6d13174357e',
      type: 'rotary-encoder',
      label: 'Rotary 6 (lower right)',
      position: {
        x: 61.68,
        y: 62.51
      },
      size: {
        width: 4,
        height: 4
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
    }
  ],
}
