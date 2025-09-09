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

    // Validate required fields
    if (!type || !title || !description || !leadId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Type, title, description, and leadId are required'
      })
    }

    // Verify lead exists
    const lead = await Lead.findById(leadId)
    if (!lead) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Lead not found'
      })
    }

    // Create new activity
    const activity = new Activity({
      type,
      title,
      description,
      leadId,
      createdBy: user._id,
      assignedTo: assignedTo || user._id,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority,
      metadata
    })

    await activity.save()

    // Update lead's next follow-up date if this is a follow-up activity
    if (type === 'call' || type === 'meeting' || type === 'email') {
      if (dueDate) {
        lead.nextFollowUpDate = new Date(dueDate)
        await lead.save()
      }
    }

    // Populate the activity with user details
    await activity.populate('createdBy', 'firstName lastName email')
    await activity.populate('assignedTo', 'firstName lastName email')

    return {
      success: true,
      data: activity,
      message: 'Activity created successfully'
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})