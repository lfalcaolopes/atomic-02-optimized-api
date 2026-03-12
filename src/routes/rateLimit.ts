import { Router } from 'express'
import { RateLimitMiddleware } from '../middlewares/rateLimit'
import { RateLimitFixedTimeIp } from '../rateLimitAlgorithms/rateLimitFixedTimeByIp'
import { RateLimitFixedTime } from '../rateLimitAlgorithms/rateLimitFixedTime'
import { RateLimitSlidingWindow } from '../rateLimitAlgorithms/rateLimitSlidingWindow'
import { RateLimitSlidingWindowByIp } from '../rateLimitAlgorithms/rateLimitSlidingWindowByIp'

export const rateLimitRoutes = Router()

const rateLimitFixedTimeIp = new RateLimitFixedTimeIp()
const rateLimitFixedTime = new RateLimitFixedTime()
const rateLimitSlidingWindow = new RateLimitSlidingWindow()
const rateLimitSlidingWindowByIp = new RateLimitSlidingWindowByIp()

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

rateLimitRoutes.get(
  '/sliding-window',
  RateLimitMiddleware(rateLimitSlidingWindow),
  async (_req, res) => {
    res.status(200).json({ result: 'ok', date: new Date().toISOString() })
  },
)

rateLimitRoutes.get(
  '/sliding-window/ip',
  RateLimitMiddleware(rateLimitSlidingWindowByIp),
  async (_req, res) => {
    res.status(200).json({ result: 'ok', date: new Date().toISOString() })
  },
)
