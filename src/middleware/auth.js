import { User } from '../models/User.js'
import { verifyToken } from '../auth/token.js'

function getBearerToken(req) {
  const raw = req.headers.authorization
  if (!raw || !raw.startsWith('Bearer ')) return null
  return raw.slice('Bearer '.length).trim()
}

export async function requireAuth(req, res, next) {
  try {
    const token = getBearerToken(req)
    if (!token) return res.status(401).json({ error: 'Authentication required' })

    const payload = verifyToken(token)
    const user = await User.findById(payload.sub)
    if (!user) return res.status(401).json({ error: 'Authentication required' })
    if (user.status === 'inactive') return res.status(403).json({ error: 'User is inactive' })

    req.user = user
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' })
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' })
    next()
  }
}

export function requireOrgScope(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' })
  if (req.user.role === 'SYSTEM_ADMIN') return next()

  const scopeOrgId = req.user.organizationId ? String(req.user.organizationId) : null
  if (!scopeOrgId) return res.status(403).json({ error: 'Organization scope missing' })

  const targetOrgId = req.params.id || req.body.organizationId
  if (targetOrgId && targetOrgId !== scopeOrgId) {
    return res.status(403).json({ error: 'Forbidden for this organization' })
  }
  next()
}
