import { LocalStorageAdapter } from './localStorageAdapter'
import type { StorageAdapter } from './StorageAdapter'

// Single point of composition: change this line to point the whole app at a
// different backend (e.g. a Supabase-backed adapter) later.
export const storage: StorageAdapter = new LocalStorageAdapter()

export type { StorageAdapter } from './StorageAdapter'
