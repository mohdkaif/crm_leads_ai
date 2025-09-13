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

    const body = await readBody(event)
    const {
      type,
      title,
      description,
      leadId,
      assignedTo,
      dueDate,
      priority = 'medium',
      metadata = {}
    } = body

    // Validation
    if (!type || !title || !description || !leadId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Type, title, description, and leadId are required'
      })
    }

    // Validate activity type
    const validTypes = ['call', 'email', 'meeting', 'note', 'task', 'status_change', 'file_upload', 'ai_insight']
    if (!validTypes.includes(type)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid activity type'
      })
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high', 'urgent']
    if (!validPriorities.includes(priority)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid priority level'
      })
    }

    // Check if lead exists
    const lead = await Lead.findById(leadId)
    if (!lead) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Lead not found'
      })
    }

    // Create activity
    const activity = new Activity({
      type,
      title,
      description,
      leadId,
      createdBy: user._id,
      assignedTo: assignedTo || user._id,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority,
      metadata,
      isCompleted: false
    })

    await activity.save()

    // Populate the activity with related data
    await activity.populate([
      { path: 'leadId', select: 'firstName lastName company email' },
      { path: 'createdBy', select: 'firstName lastName email' },
      { path: 'assignedTo', select: 'firstName lastName email' }
    ])

    return {
      success: true,
      message: 'Activity created successfully',
      data: activity
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})