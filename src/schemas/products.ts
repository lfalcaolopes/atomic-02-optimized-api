import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import { z } from 'zod'

import { productsTable, productStatusEnum } from '../db/schema'

export type Product = InferSelectModel<typeof productsTable>
export type NewProduct = InferInsertModel<typeof productsTable>

export const productStatusSchema = z.enum(productStatusEnum.enumValues)

const priceInputSchema = z.union([z.number(), z.string()]).transform((value, ctx) => {
  const raw = typeof value === 'string' ? value.trim() : value

  if (typeof raw === 'string' && raw.length === 0) {
    ctx.addIssue({ code: 'custom', message: 'Price is required' })
    return z.NEVER
  }

  const num = typeof raw === 'number' ? raw : Number(raw)

  if (!Number.isFinite(num)) {
    ctx.addIssue({ code: 'custom', message: 'Price must be a valid number' })
    return z.NEVER
  }

  if (num < 0) {
    ctx.addIssue({ code: 'custom', message: 'Price must be greater than or equal to 0' })
    return z.NEVER
  }

  // `numeric(10,2)` => up to 8 digits before decimal, and 2 after.
  const fixed = num.toFixed(2)
  const [intPart = '', decPart = ''] = fixed.split('.')

  if (intPart.replace('-', '').length > 8 || decPart.length !== 2) {
    ctx.addIssue({ code: 'custom', message: 'Price must fit numeric(10,2)' })
    return z.NEVER
  }

  return fixed
})

export const productSchema = createSelectSchema(productsTable, {
  name: z.string(),
  price: z.string(),
  status: productStatusSchema,
})

export const createProductBodySchema = createInsertSchema(productsTable, {
  name: z.string().trim().min(1).max(255),
  price: priceInputSchema,
  status: productStatusSchema,
}).pick({
  name: true,
  price: true,
  status: true,
})

export const updateProductBodySchema = createUpdateSchema(productsTable, {
  name: z.string().trim().min(1).max(255).optional(),
  price: priceInputSchema.optional(),
  status: productStatusSchema.optional(),
}).pick({
  name: true,
  price: true,
  status: true,
})
