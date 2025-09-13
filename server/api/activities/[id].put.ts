import connectDB from '../../utils/mongodb'
import Activity from '../../models/Activity'
import Lead from '../../models/Lead'

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

    const body = await readBody(event)
    const {
      type,
      title,
      description,
      leadId,
      assignedTo,
      dueDate,
      priority,
      isCompleted,
      metadata
    } = body

    // Find the activity
    const activity = await Activity.findById(activityId)
    if (!activity) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Activity not found'
      })
    }

    // Check if user has permission to update this activity
    if (activity.createdBy.toString() !== user._id.toString() && 
        activity.assignedTo?.toString() !== user._id.toString()) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You do not have permission to update this activity'
      })
    }

    // Update fields
    if (type !== undefined) {
      const validTypes = ['call', 'email', 'meeting', 'note', 'task', 'status_change', 'file_upload', 'ai_insight']
      if (!validTypes.includes(type)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid activity type'
        })
      }
      activity.type = type
    }

    if (title !== undefined) {
      activity.title = title
    }

    if (description !== undefined) {
      activity.description = description
    }

    if (leadId !== undefined) {
      // Check if lead exists
      const lead = await Lead.findById(leadId)
      if (!lead) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Lead not found'
        })
      }
      activity.leadId = leadId
    }

    if (assignedTo !== undefined) {
      activity.assignedTo = assignedTo
    }

    if (dueDate !== undefined) {
      activity.dueDate = dueDate ? new Date(dueDate) : undefined
    }

    if (priority !== undefined) {
      const validPriorities = ['low', 'medium', 'high', 'urgent']
      if (!validPriorities.includes(priority)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid priority level'
        })
      }
      activity.priority = priority
    }

    if (isCompleted !== undefined) {
      activity.isCompleted = isCompleted
      if (isCompleted && !activity.completedAt) {
        activity.completedAt = new Date()
      } else if (!isCompleted) {
        activity.completedAt = undefined
      }
    }

    if (metadata !== undefined) {
      activity.metadata = { ...activity.metadata, ...metadata }
    }

    await activity.save()

    // Populate the activity with related data
    await activity.populate([
      { path: 'leadId', select: 'firstName lastName company email' },
      { path: 'createdBy', select: 'firstName lastName email' },
      { path: 'assignedTo', select: 'firstName lastName email' }
    ])

    return {
      success: true,
      message: 'Activity updated successfully',
      data: activity
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})