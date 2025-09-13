import connectDB from '../../utils/mongodb'
import AssignmentRule from '../../models/AssignmentRule'
import mongoose from 'mongoose'

export default defineEventHandler(async (event) => {
  try {
    console.log('Starting assignment rule creation...')
    await connectDB()
    console.log('Database connected successfully')

    const user = event.context.user
    console.log('User context:', user ? { id: user._id, role: user.role, email: user.email } : 'No user')
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    // Check if user has permission to create assignment rules
    if (!['admin', 'manager'].includes(user.role)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Admin or Manager access required'
      })
    }

    const body = await readBody(event)
    console.log('Assignment rule creation request body:', JSON.stringify(body, null, 2))
    
    const {
      name,
      description,
      isActive = true,
      priority = 1,
      conditions,
      assignment,
      fallback
    } = body

    // Validation
    if (!name || !assignment?.type) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name and assignment type are required'
      })
    }

    // Validate assignment type
    const validAssignmentTypes = ['round_robin', 'least_assigned', 'most_available', 'specific_user', 'skill_based']
    if (!validAssignmentTypes.includes(assignment.type)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid assignment type'
      })
    }

    // Validate assignment type specific requirements
    if (assignment.type === 'specific_user' && (!assignment.userId || assignment.userId.trim() === '')) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required for specific_user assignment type'
      })
    }

    if (assignment.type === 'skill_based' && (!assignment.skillRequirements || assignment.skillRequirements.length === 0)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Skill requirements are required for skill_based assignment type'
      })
    }

    // Validate fallback type if provided
    if (fallback && fallback.type) {
      const validFallbackTypes = ['round_robin', 'least_assigned', 'specific_user']
      if (!validFallbackTypes.includes(fallback.type)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid fallback type'
        })
      }
      
      if (fallback.type === 'specific_user' && (!fallback.userId || fallback.userId.trim() === '')) {
        throw createError({
          statusCode: 400,
          statusMessage: 'User ID is required for specific_user fallback type'
        })
      }
    }

    // Check if rule name already exists
    const existingRule = await AssignmentRule.findOne({ name })
    if (existingRule) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Assignment rule with this name already exists'
      })
    }

    // Clean up assignment data - remove empty userId fields and validate ObjectIds
    const cleanAssignment = { ...assignment }
    if (cleanAssignment.userId !== undefined && cleanAssignment.userId !== null) {
      if (cleanAssignment.userId.trim() === '') {
        delete cleanAssignment.userId
      } else {
        // Validate that userId is a valid ObjectId
        try {
          new mongoose.Types.ObjectId(cleanAssignment.userId)
        } catch (error) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Invalid user ID format in assignment'
          })
        }
      }
    }
    
    const cleanFallback = fallback ? { ...fallback } : undefined
    if (cleanFallback && cleanFallback.userId !== undefined && cleanFallback.userId !== null) {
      if (cleanFallback.userId.trim() === '') {
        delete cleanFallback.userId
      } else {
        // Validate that userId is a valid ObjectId
        try {
          new mongoose.Types.ObjectId(cleanFallback.userId)
        } catch (error) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Invalid user ID format in fallback'
          })
        }
      }
    }

    // Create assignment rule
    console.log('User ID for createdBy:', user._id, typeof user._id)
    console.log('User object:', { id: user._id, role: user.role, email: user.email })
    console.log('Cleaned assignment:', JSON.stringify(cleanAssignment, null, 2))
    console.log('Cleaned fallback:', JSON.stringify(cleanFallback, null, 2))
    
    const assignmentRule = new AssignmentRule({
      name,
      description,
      isActive,
      priority,
      conditions: conditions || {},
      assignment: cleanAssignment,
      fallback: cleanFallback,
      createdBy: user._id
    })

    console.log('Saving assignment rule:', JSON.stringify(assignmentRule, null, 2))
    
    try {
      await assignmentRule.save()
      console.log('Assignment rule saved successfully')
    } catch (saveError) {
      console.error('Error saving assignment rule:', saveError)
      console.error('Save error details:', {
        name: saveError.name,
        message: saveError.message,
        code: saveError.code,
        errors: saveError.errors
      })
      throw saveError
    }

    // Populate the created rule
    const populatePaths = [
      { path: 'createdBy', select: 'firstName lastName email' }
    ]
    
    if (assignmentRule.assignment.userId) {
      populatePaths.push({ path: 'assignment.userId', select: 'firstName lastName email role' })
    }
    
    if (assignmentRule.fallback?.userId) {
      populatePaths.push({ path: 'fallback.userId', select: 'firstName lastName email role' })
    }
    
    try {
      await assignmentRule.populate(populatePaths)
      console.log('Assignment rule populated successfully')
    } catch (populateError) {
      console.error('Error populating assignment rule:', populateError)
      // Don't throw here, just log the error and continue
    }

    return {
      success: true,
      message: 'Assignment rule created successfully',
      data: assignmentRule
    }
  } catch (error: any) {
    console.error('Assignment rule creation error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
      statusMessage: error.statusMessage
    })
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
