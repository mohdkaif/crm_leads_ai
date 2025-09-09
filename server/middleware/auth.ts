import { verifyToken } from '../utils/jwt'
import User from '../models/User'

export default defineEventHandler(async (event) => {
  // Only apply auth middleware to API routes
  if (!event.node.req.url?.startsWith('/api/')) {
    return
  }

  // Skip auth middleware for auth routes (login, register, forgot-password)
  if (event.node.req.url?.startsWith('/api/auth/')) {
    return
  }

  // Skip auth middleware for test routes
  if (event.node.req.url?.startsWith('/api/test-')) {
    return
  }

  const token = getCookie(event, 'auth-token') || getHeader(event, 'authorization')?.replace('Bearer ', '')

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Access token required'
    })
  }

  const payload = verifyToken(token)
  if (!payload) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired token'
    })
  }


  const user = await User.findById(payload.userId).select('-password')
  if (!user || user.status !== 'active') {
    throw createError({
      statusCode: 401,
      statusMessage: 'User not found or inactive'
    })
  }

  event.context.user = user
  event.context.userId = user._id
  event.context.userRole = user.role
})
