# SuperMapper

A universal, web-based hardware mapping platform for sim racing gear. Upload a
photo of any device — wheel, button box, shifter, pedals, dash — and turn it
into an interactive template by placing clickable control overlays on top of
the image. Templates are hardware-agnostic and reusable; software bindings
are stored separately per user profile, so one physical device can back many
profiles (different games, cars, tracks, or users).

## Two modes

- **Template Creator** — upload an image, add controls from the toolbar,
  drag/resize/rotate them into place, edit their metadata, and save/export
  the resulting `HardwareTemplate` as JSON.
- **User Configuration** — pick a saved template, create or load a profile,
  click a control, and assign a software binding (function, category, notes).

## Data model

- `HardwareTemplate` — physical layout of a device: metadata, image, and an
  array of `ControlObject`s. Positions/sizes are stored as percentages of the
  source image so layouts scale responsively.
- `ControlObject` — one physical input (button, rotary encoder, toggle,
  paddle, joystick, slider, or custom).
- `UserProfile` — a named configuration of a template (game/vehicle/track)
  containing an array of `Binding`s.
- `Binding` — one control's software assignment within a profile.

Templates never reference profiles; profiles reference a template and its
controls by id only. See `src/types/models.ts`.

The Conspit MAX 01 (`src/data/templates/conspitMax01.ts`) is a demo fixture
only, proving the engine works generically — it is not hardcoded into any
logic.

## Architecture

- `src/types` — data models + zod schemas for validating imported JSON.
- `src/lib` — id generation, factories, small hooks.
- `src/store` — Zustand stores (`templateStore`, `profileStore`,
  `libraryStore`) — one per concern, no monolithic global store.
- `src/services/storage` — `StorageAdapter` interface with a localStorage
  implementation for prototyping; swap the adapter to move to a real backend
  (Postgres/Supabase/Prisma + object storage) without touching callers.
- `src/services/io` — portable JSON import/export for templates and profiles.
- `src/components/canvas` — the reusable Konva-based canvas engine
  (`HardwareCanvas`, `ControlShape`) shared by both modes.
- `src/components/creator` / `src/components/configurator` — mode-specific
  UI built on top of the shared canvas and stores.

## Stack

React + TypeScript + Vite, Tailwind CSS, Konva / react-konva, Zustand, Zod.

## Development

```bash
npm install
npm run dev
```
