import connectDB from '../../utils/mongodb'
import User from '../../models/User'
import { verify2FACode } from '../../utils/email'
import { generateToken } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const body = await readBody(event)
    const { email, code } = body

    if (!email || !code) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email and code are required'
      })
    }

    // Verify 2FA code
    const isValid = verify2FACode(email, code)
    if (!isValid) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid or expired 2FA code'
      })
    }

    // Get user
    const user = await User.findOne({ email })
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    // Generate JWT token
    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role
    })

    // Update user's 2FA status
    user.settings = user.settings || {}
    user.settings.security = user.settings.security || {}
    user.settings.security.twoFactor = true
    await user.save()

    return {
      success: true,
      message: '2FA verification successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        settings: user.settings
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
