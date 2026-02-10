import type { InferInsertModel } from 'drizzle-orm'
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod'
import { z } from 'zod'
import { usersTable } from '../db/schema'

export type NewUser = InferInsertModel<typeof usersTable>

export const createUserBodySchema = createInsertSchema(usersTable, {
  name: z.string(),
  email: z.email(),
  subscription: z.string(),
}).pick({
  name: true,
  email: true,
  subscription: true,
})

export const updateUserBodySchema = createUpdateSchema(usersTable, {
  name: z.string().optional(),
  email: z.email().optional(),
  subscription: z.string().optional(),
}).pick({
  name: true,
  email: true,
  subscription: true,
})
