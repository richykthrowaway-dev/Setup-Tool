export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * Whether the app has real backend credentials configured. When false, the
 * app runs in local-only demo mode (localStorage, no auth) so it still works
 * out of the box before a Supabase project exists.
 */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

export const TEMPLATE_IMAGE_BUCKET = 'hardware-template-images'
