import env from '#start/env'
import type User from '#models/user'
import jwt from 'jsonwebtoken'

const resolveSecret = (): jwt.Secret => {
  const key = env.get('JWT_SECRET') || env.get('APP_KEY')
  if (!key) {
    throw new Error('JWT secret is not configured')
  }
  return key
}

const resolveExpiry = (): jwt.SignOptions['expiresIn'] => {
  const value = env.get('JWT_EXPIRES_IN', '2h')
  return value as jwt.SignOptions['expiresIn']
}

function isJwtPayload(payload: unknown): payload is JwtPayload {
  if (!payload || typeof payload !== 'object') {
    return false
  }

  const record = payload as Record<string, unknown>
  return (
    typeof record.sub === 'number' &&
    typeof record.role === 'string' &&
    typeof record.email === 'string' &&
    typeof record.name === 'string'
  )
}

export interface JwtPayload {
  sub: number
  role: string
  email: string
  name: string
}

export function signUser(user: User) {
  const payload: JwtPayload = {
    sub: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
  }

  return jwt.sign(payload, resolveSecret(), { expiresIn: resolveExpiry() })
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, resolveSecret())

  if (!decoded || typeof decoded === 'string' || !isJwtPayload(decoded)) {
    throw new Error('Invalid token payload')
  }

  return decoded
}
