import { Router } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { signToken } from '../auth/token.js'
import { requireAuth } from '../middleware/auth.js'
import { serializeUser } from '../utils/serializeUser.js'

export const authRouter = Router()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

authRouter.post('/login', async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body)
    const user = await User.findOne({ email: body.email.toLowerCase() })
    if (!user) return res.status(401).json({ error: 'Invalid email or password' })

    const ok = await bcrypt.compare(body.password, user.passwordHash)
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' })

    const token = signToken(user)
    res.json({ token, user: serializeUser(user) })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.flatten() })
    }
    next(err)
  }
})

authRouter.get('/me', requireAuth, async (req, res) => {
  res.json(serializeUser(req.user))
})
