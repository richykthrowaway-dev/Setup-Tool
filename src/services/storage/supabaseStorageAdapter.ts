import { TEMPLATE_IMAGE_BUCKET } from '../../lib/config'
import { supabase } from '../../lib/supabaseClient'
import type { ControlObject, HardwareTemplate, UserProfile } from '../../types/models'
import type { StorageAdapter } from './StorageAdapter'

function client() {
  if (!supabase) throw new Error('Supabase is not configured.')
  return supabase
}

async function currentUserId(): Promise<string> {
  const { data, error } = await client().auth.getUser()
  if (error) throw error
  if (!data.user) throw new Error('You must be signed in to do that.')
  return data.user.id
}

interface TemplateRow {
  id: string
  creator_id: string
  manufacturer: string
  model: string
  description: string | null
  image_url: string
  image_width: number
  image_height: number
  controls: ControlObject[]
  version: number
  is_public: boolean
  created_at: string
  updated_at: string
}

function rowToTemplate(row: TemplateRow): HardwareTemplate {
  return {
    id: row.id,
    meta: {
      manufacturer: row.manufacturer,
      model: row.model,
      description: row.description ?? undefined,
    },
    imageUrl: row.image_url,
    imageWidth: row.image_width,
    imageHeight: row.image_height,
    controls: row.controls ?? [],
    version: row.version,
    creatorId: row.creator_id,
    isPublic: row.is_public,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function templateToRow(template: HardwareTemplate, userId: string) {
  return {
    id: template.id,
    creator_id: userId,
    manufacturer: template.meta.manufacturer,
    model: template.meta.model,
    description: template.meta.description ?? null,
    image_url: template.imageUrl,
    image_width: template.imageWidth,
    image_height: template.imageHeight,
    controls: template.controls,
    version: template.version,
    is_public: template.isPublic ?? false,
  }
}

/** Uploads a freshly-picked data: URL image to object storage; leaves already-hosted URLs alone. */
async function resolveImageUrl(template: HardwareTemplate, userId: string): Promise<string> {
  if (!template.imageUrl.startsWith('data:')) return template.imageUrl

  const match = template.imageUrl.match(/^data:([^;]+);base64,(.*)$/)
  if (!match) throw new Error('Unsupported image encoding.')
  const [, contentType, base64] = match
  const extension = contentType.split('/')[1]?.replace('+xml', '') ?? 'png'
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
  const path = `${userId}/${template.id}/source.${extension}`

  const { error: uploadError } = await client()
    .storage.from(TEMPLATE_IMAGE_BUCKET)
    .upload(path, bytes, { contentType, upsert: true })
  if (uploadError) throw uploadError

  const { data } = client().storage.from(TEMPLATE_IMAGE_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

interface ProfileRow {
  id: string
  user_id: string
  hardware_template_id: string
  name: string
  game: string | null
  vehicle: string | null
  track: string | null
  bindings: UserProfile['bindings']
  created_at: string
  updated_at: string
}

function rowToProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    userId: row.user_id,
    hardwareTemplateId: row.hardware_template_id,
    name: row.name,
    game: row.game ?? undefined,
    vehicle: row.vehicle ?? undefined,
    track: row.track ?? undefined,
    bindings: row.bindings ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function profileToRow(profile: UserProfile, userId: string) {
  return {
    id: profile.id,
    user_id: userId,
    hardware_template_id: profile.hardwareTemplateId,
    name: profile.name,
    game: profile.game ?? null,
    vehicle: profile.vehicle ?? null,
    track: profile.track ?? null,
    bindings: profile.bindings,
  }
}

/** Production persistence backend: Postgres (via Supabase) + object storage, scoped by RLS. */
export class SupabaseStorageAdapter implements StorageAdapter {
  async listTemplates(): Promise<HardwareTemplate[]> {
    const { data, error } = await client()
      .from('hardware_templates')
      .select('*')
      .order('updated_at', { ascending: false })
    if (error) throw error
    return (data as TemplateRow[]).map(rowToTemplate)
  }

  async getTemplate(id: string): Promise<HardwareTemplate | undefined> {
    const { data, error } = await client().from('hardware_templates').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data ? rowToTemplate(data as TemplateRow) : undefined
  }

  async saveTemplate(template: HardwareTemplate): Promise<HardwareTemplate> {
    const userId = await currentUserId()
    const imageUrl = await resolveImageUrl(template, userId)
    const row = templateToRow({ ...template, imageUrl }, userId)

    const { data, error } = await client().from('hardware_templates').upsert(row).select().single()
    if (error) throw error
    return rowToTemplate(data as TemplateRow)
  }

  async deleteTemplate(id: string): Promise<void> {
    const { error } = await client().from('hardware_templates').delete().eq('id', id)
    if (error) throw error
  }

  async listProfiles(hardwareTemplateId?: string): Promise<UserProfile[]> {
    let query = client().from('user_profiles').select('*').order('updated_at', { ascending: false })
    if (hardwareTemplateId) query = query.eq('hardware_template_id', hardwareTemplateId)
    const { data, error } = await query
    if (error) throw error
    return (data as ProfileRow[]).map(rowToProfile)
  }

  async getProfile(id: string): Promise<UserProfile | undefined> {
    const { data, error } = await client().from('user_profiles').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data ? rowToProfile(data as ProfileRow) : undefined
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    const userId = await currentUserId()
    const row = profileToRow(profile, userId)
    const { error } = await client().from('user_profiles').upsert(row)
    if (error) throw error
  }

  async deleteProfile(id: string): Promise<void> {
    const { error } = await client().from('user_profiles').delete().eq('id', id)
    if (error) throw error
  }
}
