import type { HardwareTemplate, UserProfile } from '../../types/models'
import type { StorageAdapter } from './StorageAdapter'

const TEMPLATES_KEY = 'supermapper:templates'
const PROFILES_KEY = 'supermapper:profiles'

function readList<T>(key: string): T[] {
  const raw = localStorage.getItem(key)
  if (!raw) return []
  try {
    return JSON.parse(raw) as T[]
  } catch {
    return []
  }
}

function writeList<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items))
}

/** Prototype persistence backend. Swap for a remote adapter to go multi-user. */
export class LocalStorageAdapter implements StorageAdapter {
  async listTemplates(): Promise<HardwareTemplate[]> {
    return readList<HardwareTemplate>(TEMPLATES_KEY)
  }

  async getTemplate(id: string): Promise<HardwareTemplate | undefined> {
    return readList<HardwareTemplate>(TEMPLATES_KEY).find((t) => t.id === id)
  }

  async saveTemplate(template: HardwareTemplate): Promise<HardwareTemplate> {
    const templates = readList<HardwareTemplate>(TEMPLATES_KEY)
    const index = templates.findIndex((t) => t.id === template.id)
    if (index >= 0) {
      templates[index] = template
    } else {
      templates.push(template)
    }
    writeList(TEMPLATES_KEY, templates)
    return template
  }

  async deleteTemplate(id: string): Promise<void> {
    writeList(
      TEMPLATES_KEY,
      readList<HardwareTemplate>(TEMPLATES_KEY).filter((t) => t.id !== id),
    )
  }

  async listProfiles(hardwareTemplateId?: string): Promise<UserProfile[]> {
    const profiles = readList<UserProfile>(PROFILES_KEY)
    return hardwareTemplateId
      ? profiles.filter((p) => p.hardwareTemplateId === hardwareTemplateId)
      : profiles
  }

  async getProfile(id: string): Promise<UserProfile | undefined> {
    return readList<UserProfile>(PROFILES_KEY).find((p) => p.id === id)
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    const profiles = readList<UserProfile>(PROFILES_KEY)
    const index = profiles.findIndex((p) => p.id === profile.id)
    if (index >= 0) {
      profiles[index] = profile
    } else {
      profiles.push(profile)
    }
    writeList(PROFILES_KEY, profiles)
  }

  async deleteProfile(id: string): Promise<void> {
    writeList(
      PROFILES_KEY,
      readList<UserProfile>(PROFILES_KEY).filter((p) => p.id !== id),
    )
  }
}
