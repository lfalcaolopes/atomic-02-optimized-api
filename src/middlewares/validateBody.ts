import type { RequestHandler } from 'express'
import { treeifyError, type ZodType } from 'zod'

export const validateBody = (schema: ZodType): RequestHandler => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: treeifyError(result.error),
      })
    }

    req.body = result.data
    next()
  }
}
