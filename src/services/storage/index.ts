import { isSupabaseConfigured } from '../../lib/config'
import { LocalStorageAdapter } from './localStorageAdapter'
import { SupabaseStorageAdapter } from './supabaseStorageAdapter'
import type { StorageAdapter } from './StorageAdapter'

// Single point of composition: Supabase backs the app whenever it's
// configured (real multi-user SaaS mode); otherwise the app falls back to
// browser-local storage so it still runs standalone with no backend set up.
export const storage: StorageAdapter = isSupabaseConfigured
  ? new SupabaseStorageAdapter()
  : new LocalStorageAdapter()

export type { StorageAdapter } from './StorageAdapter'
