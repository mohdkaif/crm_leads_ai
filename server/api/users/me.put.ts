import connectDB from '../../utils/mongodb'
import User from '../../models/User'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    
    // Get token from Authorization header
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Access token required'
      })
    }
    
    const token = authHeader.substring(7)
    
    // Verify JWT token
    const jwt = await import('../../utils/jwt')
    const decoded = jwt.verifyToken(token)
    
    if (!decoded) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token'
      })
    }
    
    const userId = decoded.userId

    const body = await readBody(event)
    const { firstName, lastName, email, phone, department, jobTitle, bio } = body

    // Check if email is being changed and if it's already taken
    if (email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: userId } 
      })
      
      if (existingUser) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Email already exists'
        })
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        email,
        phone,
        department,
        jobTitle,
        bio,
        updatedAt: new Date()
      },
      { new: true, select: '-password' }
    )

    if (!updatedUser) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    return {
      success: true,
      user: updatedUser
    }
  } catch (error) {
    console.error('Update profile error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
