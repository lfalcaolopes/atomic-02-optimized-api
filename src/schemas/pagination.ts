import { z } from 'zod'

export const offsetQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(10),
  page: z.coerce.number().int().min(1).default(1),
})

export type OffsetQuery = z.infer<typeof offsetQuerySchema>

export const optimizedOffsetQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
  page: z.coerce.number().int().min(1).default(1),
})

export type OptimizedOffsetQuery = z.infer<typeof optimizedOffsetQuerySchema>

export const cursorQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(10),
  cursor: z.coerce.number().int().min(0).default(0),
})

export type CursorQuery = z.infer<typeof cursorQuerySchema>

export const optimizedCursorQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
  cursor: z.string().trim().min(1).optional(),
})

export type OptimizedCursorQuery = z.infer<typeof optimizedCursorQuerySchema>

export const keysetCursorQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
  cursor: z.string().trim().min(1).optional(),
})

export type KeysetCursorQuery = z.infer<typeof keysetCursorQuerySchema>
