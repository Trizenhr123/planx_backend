import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'MEMBER', 'VIEWER'],
      required: true,
    },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    department: { type: String, default: '' },
    status: { type: String, enum: ['active', 'inactive', 'invited'], default: 'invited' },
    inviteStatus: { type: String, enum: ['sent', 'pending', 'failed'], default: 'pending' },
    inviteSentAt: { type: Date },
  },
  { timestamps: true }
)

export const User = mongoose.model('User', userSchema)
