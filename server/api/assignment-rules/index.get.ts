import connectDB from '../../utils/mongodb'
import AssignmentRule from '../../models/AssignmentRule'
import User from '../../models/User'

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

    // Check if user has permission to view assignment rules
    if (!['admin', 'manager'].includes(user.role)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Admin or Manager access required'
      })
    }

    const query = getQuery(event)
    const { 
      page = 1, 
      limit = 10, 
      search = '',
      isActive = '',
      sortBy = 'priority',
      sortOrder = 'desc'
    } = query

    // Build filter query
    const filter: any = {}

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    if (isActive !== '') {
      filter.isActive = isActive === 'true'
    }

    // Calculate pagination
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

    // Get assignment rules with pagination
    const rules = await AssignmentRule.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .populate('assignment.userId', 'firstName lastName email role')
      .populate('fallback.userId', 'firstName lastName email role')
      .sort({ [sortBy as string]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit as string))

    // Get total count
    const totalRules = await AssignmentRule.countDocuments(filter)

    // Get statistics
    const stats = await AssignmentRule.aggregate([
      {
        $group: {
          _id: null,
          totalRules: { $sum: 1 },
          activeRules: {
            $sum: { $cond: ['$isActive', 1, 0] }
          },
          inactiveRules: {
            $sum: { $cond: ['$isActive', 0, 1] }
          }
        }
      }
    ])

    const ruleStats = stats[0] || {
      totalRules: 0,
      activeRules: 0,
      inactiveRules: 0
    }

    return {
      success: true,
      data: {
        rules,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: totalRules,
          totalPages: Math.ceil(totalRules / parseInt(limit as string)),
          hasNextPage: skip + parseInt(limit as string) < totalRules,
          hasPrevPage: parseInt(page as string) > 1
        },
        stats: ruleStats
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
