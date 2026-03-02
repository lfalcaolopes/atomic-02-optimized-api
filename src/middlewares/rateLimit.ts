import type { RequestHandler } from 'express'

export const RateLimitMiddleware = (rateLimiter: {
  consume: (ip: string | undefined) => number
}): RequestHandler => {
  return (req, res, next) => {
    const tokens = rateLimiter.consume(req.ip)

    if (tokens < 0) {
      return res.status(500).json({ message: 'limit exceeded' })
    }

    next()
  }
}
