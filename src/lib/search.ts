import type { HardwareTemplate } from '../types/models'

/** Case-insensitive substring match against a template's manufacturer/model/description. */
export function templateMatchesQuery(template: HardwareTemplate, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const haystack = `${template.meta.manufacturer} ${template.meta.model} ${template.meta.description ?? ''}`
    .toLowerCase()
  return haystack.includes(q)
}
