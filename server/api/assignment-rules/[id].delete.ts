import connectDB from '../../utils/mongodb'
import AssignmentRule from '../../models/AssignmentRule'

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

    // Check if user has permission to delete assignment rules
    if (!['admin', 'manager'].includes(user.role)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Admin or Manager access required'
      })
    }

    const ruleId = getRouterParam(event, 'id')
    if (!ruleId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Rule ID is required'
      })
    }

    // Find the rule
    const rule = await AssignmentRule.findById(ruleId)
    if (!rule) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Assignment rule not found'
      })
    }

    // Delete the rule
    await AssignmentRule.findByIdAndDelete(ruleId)

    return {
      success: true,
      message: 'Assignment rule deleted successfully'
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
