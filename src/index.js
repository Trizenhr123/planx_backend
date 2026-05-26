import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDb } from './config/db.js'
import { organizationsRouter } from './routes/organizations.js'
import { auditLogsRouter } from './routes/auditLogs.js'

const app = express()
const PORT = Number(process.env.PORT) || 4000

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173'
app.use(cors({ origin: corsOrigin, credentials: true }))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'planx-backend' })
})

app.use('/api/organizations', organizationsRouter)
app.use('/api/audit-logs', auditLogsRouter)

app.use((err, _req, res, _next) => {
  console.error(err)
  const status = err.status || 500
  res.status(status).json({
    error: typeof err.message === 'string' ? err.message : 'Internal server error',
  })
})

async function start() {
  await connectDb()
  app.listen(PORT, () => {
    console.log(`PlanX backend listening on http://localhost:${PORT}`)
  })
}

start().catch((err) => {
  console.error('Failed to start backend:', err)
  process.exit(1)
})
