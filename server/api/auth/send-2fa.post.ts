import connectDB from '../../utils/mongodb'
import User from '../../models/User'
import { generate2FACode, store2FACode, sendTemplateEmail } from '../../utils/email'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const body = await readBody(event)
    const { email } = body

    if (!email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email is required'
      })
    }

    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    // Generate 2FA code
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
        statusMessage: 'Failed to send 2FA email'
      })
    }

    return {
      success: true,
      message: '2FA code sent successfully'
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
