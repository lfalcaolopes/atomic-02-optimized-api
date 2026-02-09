import { Router } from 'express'
import { db } from '../config/database'
import { usersTable } from '../db/schema'
import { validateBody } from '../middlewares/validateBody'
import { createUserBodySchema, updateUserBodySchema } from './users.schema'
import { eq } from 'drizzle-orm'

export const userRoutes = Router()

userRoutes.get('/', async (_req, res) => {
  try {
    const users = await db.select().from(usersTable)

    res.status(200).json(users)
  } catch (e: any) {
    res.status(500).json({ ok: false, message: e.message })
  }
})

userRoutes.post('/', validateBody(createUserBodySchema), async (req, res) => {
  try {
    const body = req.body

    const newUser = await db.insert(usersTable).values(body).returning()

    res.status(200).json(newUser)
  } catch (e: any) {
    res.status(500).json({ ok: false, message: e.message })
  }
})

userRoutes.put('/:id', validateBody(updateUserBodySchema), async (req, res) => {
  try {
    const { id } = req.params
    const body = req.body

    const updatedUser = await db
      .update(usersTable)
      .set(body)
      .where(eq(usersTable.id, Number(id)))
      .returning()

    res.status(200).json(updatedUser)
  } catch (e: any) {
    res.status(500).json({ ok: false, message: e.message })
  }
})

userRoutes.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    await db.delete(usersTable).where(eq(usersTable.id, Number(id)))

    res.status(204).send()
  } catch (e: any) {
    res.status(500).json({ ok: false, message: e.message })
  }
})
