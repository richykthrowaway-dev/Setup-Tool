import type { HardwareTemplate, UserProfile } from '../../types/models'
import { hardwareTemplateSchema, userProfileSchema } from '../../types/schema'

const FILE_FORMAT_VERSION = 1

interface PortableFile<TKind extends string, TData> {
  kind: TKind
  fileFormatVersion: number
  data: TData
}

function downloadJson(filename: string, payload: unknown): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function slugify(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export function exportHardwareTemplate(template: HardwareTemplate): void {
  const file: PortableFile<'hardware-template', HardwareTemplate> = {
    kind: 'hardware-template',
    fileFormatVersion: FILE_FORMAT_VERSION,
    data: template,
  }
  downloadJson(`${slugify(template.meta.model) || 'template'}.supermapper-template.json`, file)
}

export function exportUserProfile(profile: UserProfile): void {
  const file: PortableFile<'user-profile', UserProfile> = {
    kind: 'user-profile',
    fileFormatVersion: FILE_FORMAT_VERSION,
    data: profile,
  }
  downloadJson(`${slugify(profile.name) || 'profile'}.supermapper-profile.json`, file)
}

export class ImportValidationError extends Error {}

async function readFileText(file: File): Promise<string> {
  return file.text()
}

export async function importHardwareTemplate(file: File): Promise<HardwareTemplate> {
  const text = await readFileText(file)
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new ImportValidationError('File is not valid JSON.')
  }

  const data =
    typeof parsed === 'object' && parsed !== null && 'data' in parsed
      ? (parsed as PortableFile<string, unknown>).data
      : parsed

  const result = hardwareTemplateSchema.safeParse(data)
  if (!result.success) {
    throw new ImportValidationError(
      `Not a valid hardware template: ${result.error.issues[0]?.message ?? 'unknown error'}`,
    )
  }
  return result.data as HardwareTemplate
}

export async function importUserProfile(file: File): Promise<UserProfile> {
  const text = await readFileText(file)
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new ImportValidationError('File is not valid JSON.')
  }

  const data =
    typeof parsed === 'object' && parsed !== null && 'data' in parsed
      ? (parsed as PortableFile<string, unknown>).data
      : parsed

  const result = userProfileSchema.safeParse(data)
  if (!result.success) {
    throw new ImportValidationError(
      `Not a valid user profile: ${result.error.issues[0]?.message ?? 'unknown error'}`,
    )
  }
  return result.data as UserProfile
}
