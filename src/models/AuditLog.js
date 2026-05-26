import mongoose from 'mongoose'

const auditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    actor: { type: String, required: true },
    target: { type: String, required: true },
    ip: { type: String, default: '127.0.0.1' },
  },
  { timestamps: true }
)

export const AuditLog = mongoose.model('AuditLog', auditLogSchema)
