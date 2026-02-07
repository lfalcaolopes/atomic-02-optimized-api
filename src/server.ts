import express from 'express'
import cors from 'cors'
import { checkDatabaseConnection } from './config/database'
import { env } from './config/env'
import { routes } from './routes'
import { errorHandler } from './middlewares/error'
import { requestTimeLog } from './middlewares/requestTimeLog'
import { corsConfig } from './config/cors'

const app = express()

app.use(express.json())
app.use(cors(corsConfig))
app.use(requestTimeLog)
app.use(routes)
app.use(errorHandler)

const startServer = async () => {
  await checkDatabaseConnection()
  console.log('PostgreSQL connection established')

  app.listen(env.PORT, () => {
    console.log(`API running on http://localhost:${env.PORT}`)
  })
}

startServer().catch((error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})
