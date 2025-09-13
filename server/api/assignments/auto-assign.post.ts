import { autoAssignLead } from '../../utils/assignment'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    const body = await readBody(event)
    const { leadId } = body

    if (!leadId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Lead ID is required'
      })
    }

    const result = await autoAssignLead(leadId, user._id)

    if (!result.success) {
      throw createError({
        statusCode: 400,
        statusMessage: result.error
      })
    }

    return {
      success: true,
      message: 'Lead assigned successfully',
      data: result
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
