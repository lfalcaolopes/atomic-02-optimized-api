import { Router } from 'express'
import { pool } from '../config/database'
import { paginationRoutes } from './pagination'
import { userRoutes } from './users'
import { filteringRoutes } from './filtering'
import { filteringReferenceRoutes } from './filtering.reference'
import { paginationOptimizedReferenceRoutes } from './pagination.optimized.reference'

export const routes = Router()

routes.use('/pagination', paginationRoutes)
routes.use('/pagination-reference', paginationOptimizedReferenceRoutes)
routes.use('/users', userRoutes)
routes.use('/filtering', filteringRoutes)
routes.use('/filtering-reference', filteringReferenceRoutes)

routes.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ ok: true, db: 'up', ts: Date.now() })
  } catch {
    res.status(503).json({ ok: false, db: 'down', ts: Date.now() })
  }
})

routes.get('/error', (_req, _res) => {
  throw new Error('This is a test error')
})
