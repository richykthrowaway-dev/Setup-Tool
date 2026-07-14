# SuperMapper

A universal, web-based hardware mapping platform for sim racing gear. Upload a
photo of any device — wheel, button box, shifter, pedals, dash — and turn it
into an interactive template by placing clickable control overlays on top of
the image. Templates are hardware-agnostic and reusable; software bindings
are stored separately per user profile, so one physical device can back many
profiles (different games, cars, tracks, or users).

It's a real multi-tenant SaaS: accounts, a Postgres database with row-level
security, and cloud image storage — backed by Supabase. It also runs with
zero setup in a **local demo mode** (browser storage only, no login) so you
can develop or try it without a backend.

## Two modes

- **Template Creator** (`/creator/:templateId`) — upload an image, add
  controls from the toolbar, drag/resize/rotate them into place, edit their
  metadata, and save/export the resulting `HardwareTemplate` as JSON.
- **User Configuration** (`/configure/:templateId`) — pick a saved template,
  create or load a profile, click a control, and assign a software binding
  (function, category, notes).

## Data model

- `HardwareTemplate` — physical layout of a device: metadata, image, an
  `isPublic` flag, and an array of `ControlObject`s. Positions/sizes are
  stored as percentages of the source image so layouts scale responsively.
- `ControlObject` — one physical input (button, rotary encoder, toggle,
  paddle, joystick, slider, or custom).
- `UserProfile` — a named configuration of a template (game/vehicle/track)
  containing an array of `Binding`s.
- `Binding` — one control's software assignment within a profile.

Templates never reference profiles; profiles reference a template and its
controls by id only, and are private to the user who owns them (enforced by
Postgres row-level security, not just app logic). See `src/types/models.ts`.

The Conspit MAX 01 (`src/data/templates/conspitMax01.ts`) is a demo fixture
only, proving the engine works generically — it is not hardcoded into any
logic.

## Architecture

- `src/types` — data models + zod schemas for validating imported JSON.
- `src/lib` — id generation, factories, small hooks, `config.ts` (env/backend
  detection), `supabaseClient.ts`.
- `src/store` — Zustand stores: `authStore`, `templateStore`, `profileStore`,
  `libraryStore` — one per concern, no monolithic global store.
- `src/services/storage` — `StorageAdapter` interface with two
  implementations: `localStorageAdapter` (demo mode) and
  `supabaseStorageAdapter` (Postgres + object storage, RLS-scoped per user).
  `src/services/storage/index.ts` picks one based on whether Supabase env
  vars are present — every call site is written against the interface, so no
  UI or store code changed when the backend was added.
- `src/services/io` — portable JSON import/export for templates and profiles.
- `src/lib/coordinates.ts` — pure normalized-%-to-pixel math (position,
  size, drag, resize, click-to-place), extracted out of the canvas component
  specifically so it's unit-testable without a DOM/canvas.
- `src/components/canvas` — the reusable Konva-based canvas engine
  (`HardwareCanvas`, `ControlShape`) shared by both modes.
- `src/components/creator` / `src/components/configurator` — mode-specific
  UI built on top of the shared canvas and stores.
- `src/components/layout` — `AppShell` (nav/header) and `ProtectedRoute`
  (auth gate, no-op in local demo mode).
- `src/pages` — routed pages: landing, login/signup, dashboard (template
  library), and the creator/configurator pages (lazy-loaded — Konva is the
  heaviest dependency and only ships to routes that use the canvas).
- `supabase/migrations/0001_init.sql` — full schema, RLS policies, and
  storage bucket policies for the production backend.

## Stack

React + TypeScript + Vite, React Router, Tailwind CSS, Konva / react-konva,
Zustand, Zod, Supabase (Postgres + Auth + Storage).

## Development

```bash
npm install
npm run dev
```

With no `.env.local`, the app runs in **local demo mode**: no login, data
stored in the browser's localStorage, good for trying the editor or
developing UI without touching the backend.

## Testing

```bash
npm run test        # run once
npm run test:watch  # watch mode
```

Vitest + jsdom. Coverage is on the parts that are pure logic and worth
locking down: coordinate math (`coordinates.test.ts`), factories/forking
(`factories.test.ts`), zod schema validation (`schema.test.ts`), the
localStorage persistence adapter round-trip (`localStorageAdapter.test.ts`),
and gallery search matching (`search.test.ts`). UI flows are covered by
manual/scripted browser testing rather than component tests for now.

## Setting up the real backend (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run `supabase/migrations/0001_init.sql` — it creates
   the `hardware_templates` / `user_profiles` tables, row-level security
   policies, and the `hardware-template-images` storage bucket.
3. In Project Settings → API, copy the Project URL and `anon public` key.
4. Copy `.env.example` to `.env.local` and fill in those two values:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=xxxx
   ```
5. Restart `npm run dev`. The app now requires sign-up/sign-in, templates and
   profiles persist to Postgres scoped to the signed-in user via RLS, and
   uploaded images go to Supabase Storage instead of being embedded as data
   URLs.

By default Supabase requires email confirmation for new accounts; disable
that in Authentication → Providers → Email if you want instant sign-in during
development.

## Deployment

The app is a static SPA (Vite build output in `dist/`) that talks directly to
Supabase — no custom API server to deploy or scale.

```bash
npm run build
```

- **Vercel**: import the repo, framework preset "Vite", set the two
  `VITE_SUPABASE_*` env vars in the project settings. `vercel.json` is
  already configured to rewrite all routes to `index.html` for client-side
  routing.
- **Netlify** (or any static host): `public/_redirects` provides the same
  SPA rewrite. Set the env vars, build command `npm run build`, publish
  directory `dist`.

## Scaling notes

- Multi-tenancy is enforced at the database layer (Postgres RLS), not just in
  the frontend — a compromised or buggy client can't read another user's
  private templates or profiles.
- Community template sharing is partially built: templates have an
  `isPublic` flag and the dashboard already renders a "Community templates"
  section querying public rows. What's not built yet: search/browse/fork
  flows for the public gallery.
- `controls` and `bindings` are stored as `jsonb` rather than normalized
  tables — deliberate, since the app always reads/writes them as a unit (see
  the comment at the top of the migration). Revisit if per-control queries
  become a requirement.
