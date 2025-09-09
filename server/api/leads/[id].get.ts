import connectDB from '../../utils/mongodb'
import Lead from '../../models/Lead'
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

    const leadId = getRouterParam(event, 'id')

    if (!leadId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Lead ID is required'
      })
    }

    // Find lead with activities
    const lead = await Lead.findById(leadId)
      .populate('assignedTo', 'firstName lastName email avatar phone department')
      .populate('createdBy', 'firstName lastName email')

    if (!lead) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Lead not found'
      })
    }

    // Check permissions for sales role
    if (user.role === 'sales' && lead.assignedTo._id.toString() !== user._id.toString()) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied'
      })
    }

    // Get lead activities
    const activities = await Activity.find({ leadId })
      .populate('createdBy', 'firstName lastName email avatar')
      .populate('assignedTo', 'firstName lastName email avatar')
      .sort({ createdAt: -1 })

    return {
      success: true,
      data: {
        ...lead.toObject(),
        activities
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
