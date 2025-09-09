import jwt from 'jsonwebtoken'
import { IUser } from '../models/User'

export interface JWTPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export function generateToken(user: IUser): string {
  const payload: JWTPayload = {
    userId: user._id,
    email: user.email,
    role: user.role
  }

  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '7d'
  })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
  } catch (error) {
    return null
  }
}

export function generateRefreshToken(user: IUser): string {
  const payload: JWTPayload = {
    userId: user._id,
    email: user.email,
    role: user.role
  }

  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '30d'
  })
}
