import { Router } from 'express'
import { and, eq, like } from 'drizzle-orm'

import { db } from '../config/database'
import { validateParams } from '../middlewares/validateParams'
import { productsTable } from '../db/schema'
import { filteringQuerySchema, type FilteringQuery } from '../schemas/filtering'

export const filteringReferenceRoutes = Router()

const parseOptionalPositiveInt = (value: unknown): number | undefined => {
  if (typeof value !== 'string') return undefined
  if (value.trim().length === 0) return undefined

  const num = Number.parseInt(value, 10)
  if (!Number.isInteger(num) || num < 1) return undefined

  return num
}

const parseOptionalNonEmptyString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const parseOptionalProductStatus = (
  value: unknown,
): 'AVAILABLE' | 'GONE' | undefined => {
  if (value === 'AVAILABLE' || value === 'GONE') return value
  return undefined
}

filteringReferenceRoutes.get('/no-validation', async (req, res) => {
  try {
    // "No validation" in the sense of no schema middleware; we still parse safely to avoid runtime errors.
    const id = parseOptionalPositiveInt(req.query.id)
    const name = parseOptionalNonEmptyString(req.query.name)
    const nameEq = parseOptionalNonEmptyString(req.query.nameEq)
    const status = parseOptionalProductStatus(req.query.status)

    const idFilter = id ? eq(productsTable.id, id) : undefined
    const nameFilter = name ? like(productsTable.name, `%${name}%`) : undefined
    const nameEqFilter = nameEq ? eq(productsTable.name, nameEq) : undefined
    const statusFilter = status ? eq(productsTable.status, status) : undefined

    const query = db
      .select()
      .from(productsTable)
      .where(and(idFilter, statusFilter, nameFilter, nameEqFilter))
      .orderBy(productsTable.id)
      .limit(100000)

    const { sql, params } = query.toSQL()
    console.log('[filtering-reference/no-validation] sql', sql)
    console.log('[filtering-reference/no-validation] params', params)

    const products = await query
    res.json(products)
  } catch (e: any) {
    res.status(500).json({ ok: false, message: e.message })
  }
})

filteringReferenceRoutes.get(
  '/validated',
  validateParams(filteringQuerySchema),
  async (_req, res) => {
    try {
      const { id, name, nameEq, status } = res.locals.validatedParams as FilteringQuery

      const idFilter = id ? eq(productsTable.id, id) : undefined
      const nameFilter = name ? like(productsTable.name, `%${name}%`) : undefined
      const nameEqFilter = nameEq ? eq(productsTable.name, nameEq) : undefined
      const statusFilter = status ? eq(productsTable.status, status) : undefined

      const query = db
        .select()
        .from(productsTable)
        .where(and(idFilter, statusFilter, nameFilter, nameEqFilter))
        .orderBy(productsTable.id)
        .limit(100000)

      const { sql, params } = query.toSQL()
      console.log('[filtering-reference/validated] sql', sql)
      console.log('[filtering-reference/validated] params', params)

      const products = await query
      res.json(products)
    } catch (e: any) {
      res.status(500).json({ ok: false, message: e.message })
    }
  },
)

