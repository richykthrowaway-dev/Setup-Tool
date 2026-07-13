import { z } from 'zod'
import { CONTROL_SHAPES, CONTROL_TYPES } from './models'

// Runtime validation for imported JSON. Keep in sync with the hand-written
// types in models.ts.

const normalizedPositionSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
})

const normalizedSizeSchema = z.object({
  width: z.number().positive().max(100),
  height: z.number().positive().max(100),
})

const controlStyleSchema = z.object({
  shape: z.enum(CONTROL_SHAPES),
  fill: z.string(),
  stroke: z.string(),
  opacity: z.number().min(0).max(1),
})

export const controlObjectSchema = z.object({
  id: z.string(),
  type: z.enum(CONTROL_TYPES),
  label: z.string(),
  position: normalizedPositionSchema,
  size: normalizedSizeSchema,
  rotation: z.number(),
  style: controlStyleSchema,
  notes: z.string().optional(),
  defaultBinding: z.string().optional(),
})

export const hardwareTemplateSchema = z.object({
  id: z.string(),
  meta: z.object({
    manufacturer: z.string(),
    model: z.string(),
    description: z.string().optional(),
  }),
  imageUrl: z.string(),
  imageWidth: z.number().positive(),
  imageHeight: z.number().positive(),
  controls: z.array(controlObjectSchema),
  version: z.number().int().positive(),
  creatorId: z.string().optional(),
  isPublic: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const bindingSchema = z.object({
  id: z.string(),
  controlId: z.string(),
  assignedFunction: z.string(),
  notes: z.string().optional(),
  category: z.string().optional(),
})

export const userProfileSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  hardwareTemplateId: z.string(),
  name: z.string(),
  game: z.string().optional(),
  vehicle: z.string().optional(),
  track: z.string().optional(),
  bindings: z.array(bindingSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
})
