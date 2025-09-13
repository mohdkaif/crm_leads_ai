import connectDB from '../../utils/mongodb'
import Activity from '../../models/Activity'

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

    const activityId = getRouterParam(event, 'id')
    if (!activityId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Activity ID is required'
      })
    }

    // Find the activity with populated fields
    const activity = await Activity.findById(activityId)
      .populate('leadId', 'firstName lastName company email phone')
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')

    if (!activity) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Activity not found'
      })
    }

    return {
      success: true,
      data: activity
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
