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

    // Check if user has permission to update assignment rules
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

    const body = await readBody(event)
    const {
      name,
      description,
      isActive,
      priority,
      conditions,
      assignment,
      fallback
    } = body

    // Find the rule
    const rule = await AssignmentRule.findById(ruleId)
    if (!rule) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Assignment rule not found'
      })
    }

    // Check if rule name already exists (excluding current rule)
    if (name && name !== rule.name) {
      const existingRule = await AssignmentRule.findOne({ 
        name, 
        _id: { $ne: ruleId } 
      })
      if (existingRule) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Assignment rule with this name already exists'
        })
      }
    }

    // Validate assignment type specific requirements
    if (assignment?.type === 'specific_user' && !assignment.userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required for specific_user assignment type'
      })
    }

    if (assignment?.type === 'skill_based' && (!assignment.skillRequirements || assignment.skillRequirements.length === 0)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Skill requirements are required for skill_based assignment type'
      })
    }

    // Update the rule
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (isActive !== undefined) updateData.isActive = isActive
    if (priority !== undefined) updateData.priority = priority
    if (conditions !== undefined) updateData.conditions = conditions
    if (assignment !== undefined) updateData.assignment = assignment
    if (fallback !== undefined) updateData.fallback = fallback

    const updatedRule = await AssignmentRule.findByIdAndUpdate(
      ruleId,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'createdBy', select: 'firstName lastName email' },
      { path: 'assignment.userId', select: 'firstName lastName email role' },
      { path: 'fallback.userId', select: 'firstName lastName email role' }
    ])

    return {
      success: true,
      message: 'Assignment rule updated successfully',
      data: updatedRule
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
