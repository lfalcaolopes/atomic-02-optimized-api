import { Router } from 'express'

export const routes = Router()

routes.get('/health', (_req, res) => {
  res.json({ ok: true, ts: Date.now() })
})

routes.get('/error', (_req, _res) => {
  throw new Error('This is a test error')
})
