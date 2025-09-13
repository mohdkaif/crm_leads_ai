import connectDB from '../../utils/mongodb'
import User from '../../models/User'

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

    // Get user settings
    const userData = await User.findById(user._id).select('settings')
    
    const defaultSettings = {
      email: true,
      leadAssignment: true,
      followUpReminders: true,
      statusChanges: false,
      weeklyReports: true,
      monthlyReports: false,
      systemUpdates: true,
      marketingEmails: false
    }

    const settings = userData?.settings?.notifications || defaultSettings

    return {
      success: true,
      data: settings
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
