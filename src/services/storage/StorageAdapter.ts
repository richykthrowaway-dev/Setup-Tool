import type { HardwareTemplate, UserProfile } from '../../types/models'

/**
 * Persistence boundary for the app. The prototype ships a localStorage
 * implementation; a production build swaps in a Supabase/Prisma-backed
 * adapter without touching any calling code.
 */
export interface StorageAdapter {
  listTemplates(): Promise<HardwareTemplate[]>
  getTemplate(id: string): Promise<HardwareTemplate | undefined>
  /**
   * Persists the template and returns the canonical saved record. Remote
   * adapters may rewrite fields (e.g. uploading a data: URL image to object
   * storage and returning its hosted URL), so callers must use the
   * returned value rather than assume the input was stored verbatim.
   */
  saveTemplate(template: HardwareTemplate): Promise<HardwareTemplate>
  deleteTemplate(id: string): Promise<void>

  listProfiles(hardwareTemplateId?: string): Promise<UserProfile[]>
  getProfile(id: string): Promise<UserProfile | undefined>
  saveProfile(profile: UserProfile): Promise<void>
  deleteProfile(id: string): Promise<void>
}
