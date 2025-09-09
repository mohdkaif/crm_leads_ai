import connectDB from '../../utils/mongodb'
import User from '../../models/User'
import { generateToken, generateRefreshToken } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const { email, password, firstName, lastName, role = 'sales' } = await readBody(event)

    if (!email || !password || !firstName || !lastName) {
      throw createError({
        statusCode: 400,
        statusMessage: 'All required fields must be provided'
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: 'User with this email already exists'
      })
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role
    })

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
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        department: user.department
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
