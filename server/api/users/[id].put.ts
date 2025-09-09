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
    
    // Get user from database
    const currentUser = await User.findById(decoded.userId).select('-password')
    if (!currentUser) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not found'
      })
    }

    // Check if user has admin role
    if (currentUser.role !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Admin access required'
      })
    }

    const userId = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { firstName, lastName, email, role, department, jobTitle, phone, status } = body

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    // Check if user exists
    const userToUpdate = await User.findById(userId)
    if (!userToUpdate) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== userToUpdate.email) {
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

    // Prepare update data
    const updateData: any = {
      firstName: firstName || userToUpdate.firstName,
      lastName: lastName || userToUpdate.lastName,
      email: email || userToUpdate.email,
      role: role || userToUpdate.role,
      department: department || userToUpdate.department,
      jobTitle: jobTitle || userToUpdate.jobTitle,
      phone: phone || userToUpdate.phone,
      status: status || userToUpdate.status,
      updatedAt: new Date()
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, select: '-password' }
    )

    return {
      success: true,
      user: updatedUser,
      message: 'User updated successfully'
    }
  } catch (error) {
    console.error('Update user error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})