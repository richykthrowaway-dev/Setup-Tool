-- SuperMapper core schema.
--
-- Controls and bindings are stored as jsonb on their parent row rather than
-- as separate tables: the app always reads/writes a template's controls (or
-- a profile's bindings) as one unit, they're versioned together, and they
-- round-trip directly to the frontend's HardwareTemplate/UserProfile JSON
-- shape with no mapping layer. If per-control queries or cross-template
-- control search become a requirement later, split `controls` into its own
-- table at that point.

create extension if not exists "pgcrypto";

create table public.hardware_templates (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users (id) on delete cascade,
  manufacturer text not null default '',
  model text not null default '',
  description text,
  image_url text not null default '',
  image_width integer not null default 0,
  image_height integer not null default 0,
  controls jsonb not null default '[]'::jsonb,
  version integer not null default 1,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index hardware_templates_creator_id_idx on public.hardware_templates (creator_id);
create index hardware_templates_is_public_idx on public.hardware_templates (is_public) where is_public;

create table public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  hardware_template_id uuid not null references public.hardware_templates (id) on delete cascade,
  name text not null default '',
  game text,
  vehicle text,
  track text,
  bindings jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index user_profiles_user_id_idx on public.user_profiles (user_id);
create index user_profiles_hardware_template_id_idx on public.user_profiles (hardware_template_id);

alter table public.hardware_templates enable row level security;
alter table public.user_profiles enable row level security;

-- Templates: owner has full access; everyone can read public templates.
create policy "templates_select_own_or_public"
  on public.hardware_templates for select
  using (creator_id = auth.uid() or is_public);

create policy "templates_insert_own"
  on public.hardware_templates for insert
  with check (creator_id = auth.uid());

create policy "templates_update_own"
  on public.hardware_templates for update
  using (creator_id = auth.uid());

create policy "templates_delete_own"
  on public.hardware_templates for delete
  using (creator_id = auth.uid());

-- Profiles: strictly owner-only. A profile is a personal configuration of a
-- (possibly public) template, never shared by the RLS layer itself.
create policy "profiles_select_own"
  on public.user_profiles for select
  using (user_id = auth.uid());

create policy "profiles_insert_own"
  on public.user_profiles for insert
  with check (user_id = auth.uid());

create policy "profiles_update_own"
  on public.user_profiles for update
  using (user_id = auth.uid());

create policy "profiles_delete_own"
  on public.user_profiles for delete
  using (user_id = auth.uid());

-- Object storage bucket for hardware template images. Public read (template
-- images need to render for anyone viewing a public template); writes are
-- restricted to the uploading user's own folder, keyed by
-- `${auth.uid()}/${templateId}/...`.
insert into storage.buckets (id, name, public)
values ('hardware-template-images', 'hardware-template-images', true)
on conflict (id) do nothing;

create policy "template_images_public_read"
  on storage.objects for select
  using (bucket_id = 'hardware-template-images');

create policy "template_images_owner_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'hardware-template-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "template_images_owner_update"
  on storage.objects for update
  using (
    bucket_id = 'hardware-template-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "template_images_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'hardware-template-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
