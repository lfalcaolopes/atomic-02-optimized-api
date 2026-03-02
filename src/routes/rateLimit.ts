import { Router } from 'express'
import { RateLimitMiddleware } from '../middlewares/rateLimit'
import { RateLimitFixedTimeIp } from '../rateLimitAlgorithms/rateLimitFixedTimeByIp'
import { RateLimitFixedTime } from '../rateLimitAlgorithms/rateLimitFixedTime'

export const rateLimitRoutes = Router()

const rateLimitFixedTimeIp = new RateLimitFixedTimeIp()
const rateLimitFixedTime = new RateLimitFixedTime()

rateLimitRoutes.get('/fixed-window', RateLimitMiddleware(rateLimitFixedTime), async (_req, res) => {
  res.status(200).json({ result: 'ok', date: new Date().toISOString() })
})

rateLimitRoutes.get(
  '/fixed-window/ip',
  RateLimitMiddleware(rateLimitFixedTimeIp),
  async (_req, res) => {
    res.status(200).json({ result: 'ok', date: new Date().toISOString() })
  },
)
