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
    const body = await readBody(event)

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

    // Check permissions - users can update their own activities
    if (user.role === 'sales' && activity.createdBy.toString() !== user._id.toString()) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied'
      })
    }

    // Update fields
    if (body.title) activity.title = body.title
    if (body.description) activity.description = body.description
    if (body.assignedTo) activity.assignedTo = body.assignedTo
    if (body.dueDate !== undefined) {
      activity.dueDate = body.dueDate ? new Date(body.dueDate) : null
    }
    if (body.priority) activity.priority = body.priority
    if (body.metadata) activity.metadata = { ...activity.metadata, ...body.metadata }

    // Handle completion
    if (body.isCompleted !== undefined) {
      activity.isCompleted = body.isCompleted
      if (body.isCompleted && !activity.completedAt) {
        activity.completedAt = new Date()
      } else if (!body.isCompleted) {
        activity.completedAt = undefined
      }
    }

    await activity.save()

    // Populate the updated activity
    await activity.populate('createdBy', 'firstName lastName email avatar')
    await activity.populate('assignedTo', 'firstName lastName email avatar')
    await activity.populate('leadId', 'firstName lastName company')

    return {
      success: true,
      data: activity,
      message: 'Activity updated successfully'
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
