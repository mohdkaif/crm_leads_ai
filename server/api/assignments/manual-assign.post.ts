import { manualAssignLead } from '../../utils/assignment'

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
    const { leadId, userId, notes } = body

    if (!leadId || !userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Lead ID and User ID are required'
      })
    }

    const result = await manualAssignLead(leadId, userId, user._id, notes)

    if (!result.success) {
      throw createError({
        statusCode: 400,
        statusMessage: result.error
      })
    }

    return {
      success: true,
      message: 'Lead assigned manually',
      data: result
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
