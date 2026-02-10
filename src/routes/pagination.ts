import { Router } from 'express'
import { and, asc, count, eq, gt, or } from 'drizzle-orm'

import { db } from '../config/database'

import { productsTable } from '../db/schema'

import { validateParams } from '../middlewares/validateParams'

import {
  type CursorQuery,
  cursorQuerySchema,
  type KeysetCursorQuery,
  keysetCursorQuerySchema,
  type OptimizedCursorQuery,
  type OptimizedOffsetQuery,
  optimizedCursorQuerySchema,
  optimizedOffsetQuerySchema,
  type OffsetQuery,
  offsetQuerySchema,
} from '../schemas/pagination'

export const paginationRoutes = Router()

const encodeCursor = (id: number): string => {
  return Buffer.from(JSON.stringify({ id }), 'utf8').toString('base64url')
}

const decodeCursor = (cursor: string): number | null => {
  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf8')
    const parsed = JSON.parse(decoded) as { id?: unknown }

    if (typeof parsed.id !== 'number' || !Number.isInteger(parsed.id) || parsed.id < 0) {
      return null
    }

    return parsed.id
  } catch {
    return null
  }
}

type KeysetCursor = {
  createdAt: Date
  id: number
}

const encodeKeysetCursor = (cursor: KeysetCursor): string => {
  return Buffer.from(
    JSON.stringify({
      createdAt: cursor.createdAt.toISOString(),
      id: cursor.id,
    }),
    'utf8',
  ).toString('base64url')
}

const decodeKeysetCursor = (cursor: string): KeysetCursor | null => {
  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf8')
    const parsed = JSON.parse(decoded) as { createdAt?: unknown; id?: unknown }

    if (typeof parsed.createdAt !== 'string') {
      return null
    }

    if (typeof parsed.id !== 'number' || !Number.isInteger(parsed.id) || parsed.id < 0) {
      return null
    }

    const createdAt = new Date(parsed.createdAt)
    if (Number.isNaN(createdAt.getTime())) {
      return null
    }

    return { createdAt, id: parsed.id }
  } catch {
    return null
  }
}

paginationRoutes.get('/', async (_req, res) => {
  try {
    const products = await db.select().from(productsTable)

    res.json(products)
  } catch (e: any) {
    res.status(500).json({ ok: false, message: e.message })
  }
})

paginationRoutes.get('/offset', validateParams(offsetQuerySchema), async (_req, res) => {
  try {
    const { limit, page } = res.locals.validatedParams as OffsetQuery

    const offset = (page - 1) * limit

    const products = await db
      .select()
      .from(productsTable)
      .orderBy(asc(productsTable.id))
      .limit(limit)
      .offset(offset)

    res.json(products)
  } catch (e: any) {
    res.status(500).json({ ok: false, message: e.message })
  }
})

paginationRoutes.get(
  '/offset/optimized',
  validateParams(optimizedOffsetQuerySchema),
  async (_req, res) => {
    try {
      const { limit, page } = res.locals.validatedParams as OptimizedOffsetQuery

      const offset = (page - 1) * limit

      const [products, countRows] = await Promise.all([
        db.select().from(productsTable).orderBy(asc(productsTable.id)).limit(limit).offset(offset),
        db.select({ total: count(productsTable.id) }).from(productsTable),
      ])

      const total = Number(countRows[0]?.total ?? 0)
      const totalPages = total === 0 ? 0 : Math.ceil(total / limit)

      res.json({
        data: products,
        pagination: {
          type: 'offset',
          page,
          limit,
          total,
          totalPages,
          hasPreviousPage: page > 1,
          hasNextPage: page < totalPages,
        },
      })
    } catch (e: any) {
      res.status(500).json({ ok: false, message: e.message })
    }
  },
)

paginationRoutes.get('/cursor', validateParams(cursorQuerySchema), async (_req, res) => {
  try {
    const { limit, cursor } = res.locals.validatedParams as CursorQuery

    const products = await db
      .select()
      .from(productsTable)
      .orderBy(productsTable.id)
      .where(gt(productsTable.id, cursor))
      .limit(limit)

    res.json(products)
  } catch (e: any) {
    res.status(500).json({ ok: false, message: e.message })
  }
})

paginationRoutes.get(
  '/cursor/optimized',
  validateParams(optimizedCursorQuerySchema),
  async (_req, res) => {
    try {
      const { limit, cursor } = res.locals.validatedParams as OptimizedCursorQuery

      const decodedCursor = cursor ? decodeCursor(cursor) : 0
      if (decodedCursor === null) {
        return res.status(400).json({
          error: 'Validation failed',
          details: {
            cursor: ['Cursor must be a valid opaque pagination token'],
          },
        })
      }

      const rows = await db
        .select()
        .from(productsTable)
        .where(gt(productsTable.id, decodedCursor))
        .orderBy(asc(productsTable.id))
        .limit(limit + 1)

      const hasNextPage = rows.length > limit
      const data = hasNextPage ? rows.slice(0, limit) : rows
      const nextCursor =
        hasNextPage && data.length > 0 ? encodeCursor(data[data.length - 1]!.id) : null

      res.json({
        data,
        pagination: {
          type: 'cursor',
          limit,
          hasNextPage,
          nextCursor,
          currentCursor: cursor ?? null,
        },
      })
    } catch (e: any) {
      res.status(500).json({ ok: false, message: e.message })
    }
  },
)

paginationRoutes.get(
  '/cursor/keyset-optimized',
  validateParams(keysetCursorQuerySchema),
  async (_req, res) => {
    try {
      const { limit, cursor } = res.locals.validatedParams as KeysetCursorQuery

      const decodedCursor = cursor ? decodeKeysetCursor(cursor) : null
      if (cursor && decodedCursor === null) {
        return res.status(400).json({
          error: 'Validation failed',
          details: {
            cursor: ['Cursor must be a valid opaque keyset token'],
          },
        })
      }

      console.log(decodedCursor)

      const rows = decodedCursor
        ? await db
            .select()
            .from(productsTable)
            .where(
              or(
                gt(productsTable.createdAt, decodedCursor.createdAt),
                and(
                  eq(productsTable.createdAt, decodedCursor.createdAt),
                  gt(productsTable.id, decodedCursor.id),
                ),
              ),
            )
            .orderBy(asc(productsTable.createdAt), asc(productsTable.id))
            .limit(limit + 1)
        : await db
            .select()
            .from(productsTable)
            .orderBy(asc(productsTable.createdAt), asc(productsTable.id))
            .limit(limit + 1)

      const hasNextPage = rows.length > limit
      const data = hasNextPage ? rows.slice(0, limit) : rows

      const nextCursor =
        hasNextPage && data.length > 0
          ? encodeKeysetCursor({
              createdAt: data[data.length - 1]!.createdAt,
              id: data[data.length - 1]!.id,
            })
          : null

      res.json({
        data,
        pagination: {
          type: 'cursor-keyset',
          limit,
          hasNextPage,
          nextCursor,
          currentCursor: cursor ?? null,
          sort: ['createdAt', 'id'],
        },
      })
    } catch (e: any) {
      res.status(500).json({ ok: false, message: e.message })
    }
  },
)
