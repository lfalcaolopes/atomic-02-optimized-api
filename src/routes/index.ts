import { Router } from 'express'
import { pool } from '../config/database'
import { paginationRoutes } from './pagination'
import { userRoutes } from './users'

export const routes = Router()

routes.use('/pagination', paginationRoutes)
routes.use('/users', userRoutes)

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
