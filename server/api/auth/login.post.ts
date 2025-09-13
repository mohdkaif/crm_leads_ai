import connectDB from '../../utils/mongodb'
import User from '../../models/User'
import { generateToken, generateRefreshToken } from '../../utils/jwt'
import { generate2FACode, store2FACode, sendTemplateEmail } from '../../utils/email'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const { email, password } = await readBody(event)

    if (!email || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email and password are required'
      })
    }


    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid credentials'
      })
    }

    if (user.status !== 'active') {
      throw createError({
        statusCode: 401,
        statusMessage: 'Account is deactivated'
      })
    }

    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid credentials'
      })
    }

    // Check if 2FA is enabled
    const is2FAEnabled = user.settings?.security?.twoFactor || false
    
    if (is2FAEnabled) {
      // Generate and send 2FA code
      const code = generate2FACode()
      store2FACode(email, code)
      
      // Send 2FA email
      const emailResult = await sendTemplateEmail(email, 'twoFactorAuth', {
        code,
        name: `${user.firstName} ${user.lastName}`
      })
      
      if (!emailResult.success) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to send 2FA code'
        })
      }
      
      return {
        success: true,
        requires2FA: true,
        message: '2FA code sent to your email',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      }
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    const token = generateToken(user)
    const refreshToken = generateRefreshToken(user)

    // Set cookies
    setCookie(event, 'auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    setCookie(event, 'refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    })

    return {
      success: true,
      requires2FA: false,
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
        settings: user.settings
      },
      token
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
