import { transferAssignment } from '../../utils/assignment'

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
    const { assignmentId, newUserId, reason } = body

    if (!assignmentId || !newUserId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Assignment ID and New User ID are required'
      })
    }

    const result = await transferAssignment(assignmentId, newUserId, user._id, reason)

    if (!result.success) {
      throw createError({
        statusCode: 400,
        statusMessage: result.error
      })
    }

    return {
      success: true,
      message: 'Assignment transferred successfully',
      data: result
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
