import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import { connectDb } from './config/db.js'
import { organizationsRouter } from './routes/organizations.js'
import { auditLogsRouter } from './routes/auditLogs.js'
import { authRouter } from './routes/auth.js'
import { User } from './models/User.js'

const app = express()
const PORT = Number(process.env.PORT) || 4000

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173'
app.use(cors({ origin: corsOrigin, credentials: true }))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'planx-backend' })
})

app.use('/api/auth', authRouter)
app.use('/api/organizations', organizationsRouter)
app.use('/api/audit-logs', auditLogsRouter)

app.use((err, _req, res, _next) => {
  console.error(err)
  const status = err.status || 500
  res.status(status).json({
    error: typeof err.message === 'string' ? err.message : 'Internal server error',
  })
})

async function ensureDemoUsers() {
  const demoUsers = [
    { name: 'System Administrator', email: 'demo@trizenventures.com', password: 'demo123', role: 'SYSTEM_ADMIN' },
    { name: 'Company Admin', email: 'admin@trizenventures.com', password: 'admin123', role: 'ADMIN' },
    { name: 'Manager', email: 'supervisor@trizenventures.com', password: 'supervisor123', role: 'MANAGER' },
    { name: 'Employee', email: 'employee@trizenventures.com', password: 'employee123', role: 'MEMBER' },
    { name: 'Viewer', email: 'viewer@trizenventures.com', password: 'viewer123', role: 'VIEWER' },
  ]

  for (const entry of demoUsers) {
    const existing = await User.findOne({ email: entry.email.toLowerCase() })
    if (existing) continue
    const passwordHash = await bcrypt.hash(entry.password, 10)
    await User.create({
      name: entry.name,
      email: entry.email.toLowerCase(),
      passwordHash,
      role: entry.role,
      status: 'active',
      inviteStatus: 'sent',
    })
  }
}

async function start() {
  await connectDb()
  await ensureDemoUsers()

  const server = app.listen(PORT, () => {
    console.log(`PlanX backend listening on http://localhost:${PORT}`)
  })

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(
        `Port ${PORT} is already in use. Stop the other process (e.g. netstat -ano | findstr :${PORT}) or set PORT in .env.`,
      )
      process.exit(1)
    }
    throw err
  })

  const shutdown = () => {
    server.close(() => process.exit(0))
  }
  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
}

start().catch((err) => {
  console.error('Failed to start backend:', err)
  process.exit(1)
})
