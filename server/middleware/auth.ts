import { verifyToken } from '../utils/jwt'
import User from '../models/User'
import connectDB from '../utils/mongodb'

export default defineEventHandler(async (event) => {
  // Only apply auth middleware to API routes
  if (!event.node.req.url?.startsWith('/api/')) {
    return
  }

  // Skip auth middleware for auth routes (login, register, forgot-password, send-2fa, verify-2fa)
  // But include /api/auth/me which needs authentication
  if (event.node.req.url?.startsWith('/api/auth/') && event.node.req.url !== '/api/auth/me') {
    return
  }

  // Skip auth middleware for test routes
  if (event.node.req.url?.startsWith('/api/test-')) {
    return
  }

  const cookieToken = getCookie(event, 'auth-token')
  const headerToken = getHeader(event, 'authorization')?.replace('Bearer ', '')
  const token = cookieToken || headerToken


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

  // Ensure database connection before querying
  await connectDB()

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
