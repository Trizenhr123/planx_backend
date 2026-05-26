import { Router } from 'express'
import { AuditLog } from '../models/AuditLog.js'

export const auditLogsRouter = Router()

auditLogsRouter.get('/', async (_req, res, next) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100)
    res.json(
      logs.map((l) => ({
        id: String(l._id),
        action: l.action,
        actor: l.actor,
        target: l.target,
        timestamp: l.createdAt.toISOString(),
        ip: l.ip,
      }))
    )
  } catch (err) {
    next(err)
  }
})
