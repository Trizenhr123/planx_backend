import mongoose from 'mongoose'

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
    collaboratorCount: { type: Number, default: 1 },
    projectCount: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    adminEmail: { type: String, required: true, lowercase: true, trim: true },
    inviteStatus: { type: String, enum: ['sent', 'pending', 'failed'], default: 'pending' },
    inviteSentAt: { type: Date },
  },
  { timestamps: true }
)

export const Organization = mongoose.model('Organization', organizationSchema)
