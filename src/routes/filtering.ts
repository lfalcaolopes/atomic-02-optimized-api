import { Router } from 'express'
import { db, pool } from '../config/database'
import { productsTable } from '../db/schema'
import { and, eq, like } from 'drizzle-orm'
import { filteringQuerySchema } from '../schemas/filtering'
import { validateParams } from '../middlewares/validateParams'

export const filteringRoutes = Router()

filteringRoutes.get('/no-validation', async (req, res) => {
  try {
    const id = req.query.id
    const name = req.query.name as string
    const nameEq = req.query.nameEq as string
    const status = req.query.status as 'AVAILABLE' | 'GONE'

    console.log('params', { id, status, name, nameEq })

    const idFilter = id ? eq(productsTable.id, Number(id)) : undefined
    const nameFilter = name ? like(productsTable.name, name) : undefined
    const nameEqFilter = nameEq ? eq(productsTable.name, nameEq) : undefined
    const statusFilter = status ? eq(productsTable.status, status) : undefined

    const query = db
      .select()
      .from(productsTable)
      .where(and(idFilter, statusFilter, nameFilter, nameEqFilter))
      .orderBy(productsTable.id)
      .limit(100000)

    const { sql, params } = query.toSQL()

    console.log('[filtering/no-validation] sql', sql)
    console.log('[filtering/no-validation] params', params)

    const products = await query

    res.json(products)
  } catch (e: any) {
    res.status(500).json({ ok: false, message: e.message })
  }
})

filteringRoutes.get('/validated', validateParams(filteringQuerySchema), async (_req, res) => {
  try {
    const { id, name, nameEq, status } = res.locals.validatedParams

    console.log('params', { id, status, name, nameEq })

    const idFilter = id ? eq(productsTable.id, id) : undefined
    const nameFilter = name ? like(productsTable.name, name) : undefined
    const nameEqFilter = nameEq ? eq(productsTable.name, nameEq) : undefined
    const statusFilter = status ? eq(productsTable.status, status) : undefined

    const query = db
      .select()
      .from(productsTable)
      .where(and(idFilter, statusFilter, nameFilter, nameEqFilter))
      .orderBy(productsTable.id)
      .limit(100000)

    const { sql, params } = query.toSQL()

    console.log('[filtering/no-validation] sql', sql)
    console.log('[filtering/no-validation] params', params)

    const products = await query

    res.json(products)
  } catch (e: any) {
    res.status(500).json({ ok: false, message: e.message })
  }
})

filteringRoutes.get('/unsafe-lab', async (req, res) => {
  try {
    const id = req.query.id as string | undefined
    const name = req.query.name as string | undefined
    const nameEq = req.query.nameEq as string | undefined
    const status = req.query.status as string | undefined

    const whereParts: string[] = []

    // Intentionally unsafe by design for SQLi lab: direct string concatenation.
    if (id) whereParts.push(`id = ${id}`)
    if (name) whereParts.push(`name like '${name}'`)
    if (nameEq) whereParts.push(`name = '${nameEq}'`)
    if (status) whereParts.push(`status = '${status}'`)

    const whereClause = whereParts.length > 0 ? ` where ${whereParts.join(' and ')}` : ''
    const sql = `select "id", "created_at", "name", "price", "status" from "products"${whereClause} order by "id" limit 10000`

    console.log('[filtering/unsafe-lab] sql', sql)

    const result = await pool.query(sql)

    res.json({
      data: result.rows,
    })
  } catch (e: any) {
    res.status(500).json({ ok: false, message: e.message })
  }
})
