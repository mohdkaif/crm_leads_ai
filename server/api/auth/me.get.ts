import connectDB from '../../utils/mongodb'
import User from '../../models/User'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const token = getCookie(event, 'auth-token') || getHeader(event, 'authorization')?.replace('Bearer ', '')

    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Access token required'
      })
    }

    const { verifyToken } = await import('../../utils/jwt')
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

    return {
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        department: user.department,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
