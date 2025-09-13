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

    const body = await readBody(event)
    const { 
      email, 
      leadAssignment, 
      followUpReminders, 
      statusChanges, 
      weeklyReports, 
      monthlyReports, 
      systemUpdates, 
      marketingEmails 
    } = body

    // Validate boolean values
    const validateBoolean = (value: any, fieldName: string) => {
      if (typeof value !== 'boolean') {
        throw createError({
          statusCode: 400,
          statusMessage: `${fieldName} must be a boolean value`
        })
      }
    }

    validateBoolean(email, 'Email notifications')
    validateBoolean(leadAssignment, 'Lead assignment notifications')
    validateBoolean(followUpReminders, 'Follow-up reminders')
    validateBoolean(statusChanges, 'Status change notifications')
    validateBoolean(weeklyReports, 'Weekly reports')
    validateBoolean(monthlyReports, 'Monthly reports')
    validateBoolean(systemUpdates, 'System updates')
    validateBoolean(marketingEmails, 'Marketing emails')

    // Update user settings
    await User.findByIdAndUpdate(user._id, {
      $set: {
        'settings.notifications': {
          email,
          leadAssignment,
          followUpReminders,
          statusChanges,
          weeklyReports,
          monthlyReports,
          systemUpdates,
          marketingEmails
        }
      }
    })

    return {
      success: true,
      message: 'Notification settings updated successfully',
      data: {
        email,
        leadAssignment,
        followUpReminders,
        statusChanges,
        weeklyReports,
        monthlyReports,
        systemUpdates,
        marketingEmails
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
