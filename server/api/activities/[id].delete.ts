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

    // Find the activity
    const activity = await Activity.findById(activityId)
    if (!activity) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Activity not found'
      })
    }

    // Check if user has permission to delete this activity
    if (activity.createdBy.toString() !== user._id.toString()) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You do not have permission to delete this activity'
      })
    }

    // Delete the activity
    await Activity.findByIdAndDelete(activityId)

    return {
      success: true,
      message: 'Activity deleted successfully'
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
