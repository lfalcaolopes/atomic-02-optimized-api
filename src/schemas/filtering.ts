import { z } from 'zod'

import { productStatusSchema } from './products'

export const filteringQuerySchema = z.object({
  id: z.coerce.number().int().min(1).optional(),
  name: z.string().optional(),
  nameEq: z.string().optional(),
  status: productStatusSchema.optional(),
})

export type FilteringQuery = z.infer<typeof filteringQuerySchema>
