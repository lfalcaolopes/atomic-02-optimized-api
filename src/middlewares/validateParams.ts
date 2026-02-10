import type { RequestHandler } from 'express'
import { treeifyError, type ZodType } from 'zod'

export const validateParams = (schema: ZodType): RequestHandler => {
  return (req, res, next) => {
    const result = schema.safeParse(req.query)

    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: treeifyError(result.error),
      })
    }

    res.locals.validatedParams = result.data
    next()
  }
}
