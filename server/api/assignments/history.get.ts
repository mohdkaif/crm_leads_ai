import connectDB from '../../utils/mongodb'
import LeadAssignment from '../../models/LeadAssignment'
import Lead from '../../models/Lead'
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

    const query = getQuery(event)
    const { 
      page = 1, 
      limit = 10, 
      leadId = '',
      assignedTo = '',
      assignmentType = '',
      status = '',
      dateFrom = '',
      dateTo = '',
      sortBy = 'assignedAt',
      sortOrder = 'desc'
    } = query

    // Build filter query
    const filter: any = {}

    if (leadId) {
      filter.leadId = leadId
    }

    if (assignedTo) {
      filter.assignedTo = assignedTo
    }

    if (assignmentType) {
      filter.assignmentType = assignmentType
    }

    if (status) {
      filter.status = status
    }

    if (dateFrom || dateTo) {
      filter.assignedAt = {}
      if (dateFrom) {
        filter.assignedAt.$gte = new Date(dateFrom as string)
      }
      if (dateTo) {
        filter.assignedAt.$lte = new Date(dateTo as string)
      }
    }

    // Calculate pagination
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

    // Get assignments with pagination
    const assignments = await LeadAssignment.find(filter)
      .populate('leadId', 'firstName lastName company email status source')
      .populate('assignedTo', 'firstName lastName email role')
      .populate('assignedBy', 'firstName lastName email')
      .populate('transferredTo', 'firstName lastName email')
      .populate('transferredBy', 'firstName lastName email')
      .sort({ [sortBy as string]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit as string))

    // Get total count
    const totalAssignments = await LeadAssignment.countDocuments(filter)

    // Get statistics
    const stats = await LeadAssignment.aggregate([
      {
        $group: {
          _id: null,
          totalAssignments: { $sum: 1 },
          activeAssignments: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          transferredAssignments: {
            $sum: { $cond: [{ $eq: ['$status', 'transferred'] }, 1, 0] }
          },
          completedAssignments: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          manualAssignments: {
            $sum: { $cond: [{ $eq: ['$assignmentType', 'manual'] }, 1, 0] }
          },
          automaticAssignments: {
            $sum: { $cond: [{ $eq: ['$assignmentType', 'automatic'] }, 1, 0] }
          },
          ruleBasedAssignments: {
            $sum: { $cond: [{ $eq: ['$assignmentType', 'rule_based'] }, 1, 0] }
          }
        }
      }
    ])

    const assignmentStats = stats[0] || {
      totalAssignments: 0,
      activeAssignments: 0,
      transferredAssignments: 0,
      completedAssignments: 0,
      manualAssignments: 0,
      automaticAssignments: 0,
      ruleBasedAssignments: 0
    }

    // Get user performance stats
    const userStats = await LeadAssignment.aggregate([
      {
        $match: {
          status: 'active',
          assignedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        }
      },
      {
        $group: {
          _id: '$assignedTo',
          assignmentCount: { $sum: 1 },
          avgScore: { $avg: '$metadata.assignmentScore' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          userId: '$_id',
          userName: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
          userEmail: '$user.email',
          assignmentCount: 1,
          avgScore: { $round: ['$avgScore', 2] }
        }
      },
      {
        $sort: { assignmentCount: -1 }
      },
      {
        $limit: 10
      }
    ])

    return {
      success: true,
      data: {
        assignments,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: totalAssignments,
          totalPages: Math.ceil(totalAssignments / parseInt(limit as string)),
          hasNextPage: skip + parseInt(limit as string) < totalAssignments,
          hasPrevPage: parseInt(page as string) > 1
        },
        stats: assignmentStats,
        userStats
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
