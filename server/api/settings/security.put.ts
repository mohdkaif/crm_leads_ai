import connectDB from '../../utils/mongodb'
import User from '../../models/User'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const user = event.context.user
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    const body = await readBody(event)
    const { currentPassword, newPassword, confirmPassword, twoFactor } = body

    // Get user data
    const userData = await User.findById(user._id)
    if (!userData) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    // Validate password change if provided
    if (newPassword) {
      if (!currentPassword) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Current password is required to change password'
        })
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userData.password)
      if (!isCurrentPasswordValid) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Current password is incorrect'
        })
      }

      // Validate new password
      if (newPassword.length < 8) {
        throw createError({
          statusCode: 400,
          statusMessage: 'New password must be at least 8 characters long'
        })
      }

      if (newPassword !== confirmPassword) {
        throw createError({
          statusCode: 400,
          statusMessage: 'New password and confirmation do not match'
        })
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12)
      
      // Update password
      await User.findByIdAndUpdate(user._id, {
        password: hashedPassword
      })
    }

    // Update two-factor authentication setting
    if (typeof twoFactor === 'boolean') {
      await User.findByIdAndUpdate(user._id, {
        $set: {
          'settings.security.twoFactor': twoFactor
        }
      })
    }

    return {
      success: true,
      message: newPassword ? 'Password updated successfully' : 'Security settings updated successfully'
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
