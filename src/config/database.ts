import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from '../db/schema'
import { env } from './env'

const poolConfig = process.env.DATABASE_URL
  ? { connectionString: env.DATABASE_URL }
  : {
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
    }

export const pool = new Pool(poolConfig)
export const db = drizzle({
  client: pool,
  schema,
})

export const checkDatabaseConnection = async () => {
  await pool.query('SELECT 1')
}
