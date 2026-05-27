import jwt from 'jsonwebtoken'

const DEFAULT_SECRET = 'planx-dev-secret'
const EXPIRY = '8h'

function getSecret() {
  return process.env.JWT_SECRET || DEFAULT_SECRET
}

export function signToken(user) {
  return jwt.sign(
    {
      sub: String(user._id),
      role: user.role,
      organizationId: user.organizationId ? String(user.organizationId) : undefined,
    },
    getSecret(),
    { expiresIn: EXPIRY },
  )
}

export function verifyToken(token) {
  return jwt.verify(token, getSecret())
}
