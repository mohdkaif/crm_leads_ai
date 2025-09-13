import connectDB from '../../utils/mongodb'
import Activity from '../../models/Activity'
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

    // Get query parameters
    const query = getQuery(event)
    const {
      page = '1',
      limit = '10',
      type,
      priority,
      status,
      leadId,
      assignedTo,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query

    // Build filter object
    const filter: any = {}

    // Filter by type
    if (type && type !== 'all') {
      filter.type = type
    }

    // Filter by priority
    if (priority && priority !== 'all') {
      filter.priority = priority
    }

    // Filter by completion status
    if (status === 'completed') {
      filter.isCompleted = true
    } else if (status === 'pending') {
      filter.isCompleted = false
    }

    // Filter by lead
    if (leadId) {
      filter.leadId = leadId
    }

    // Filter by assigned user
    if (assignedTo) {
      filter.assignedTo = assignedTo
    }

    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    // Pagination
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    // Sort options
    const sortOptions: any = {}
    sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1

    // Get activities with populated fields
    const activities = await Activity.find(filter)
      .populate('leadId', 'firstName lastName company email')
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean()

    // Get total count for pagination
    const total = await Activity.countDocuments(filter)

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum)
    const hasNextPage = pageNum < totalPages
    const hasPrevPage = pageNum > 1

    // Get activity statistics
    const stats = await getActivityStats(user._id)

    return {
      success: true,
      data: activities,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      stats
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})

// Helper function to get activity statistics
async function getActivityStats(userId: string) {
  const today = new Date()
  const startOfDay = new Date(today.setHours(0, 0, 0, 0))
  const endOfDay = new Date(today.setHours(23, 59, 59, 999))

  const [
    totalActivities,
    completedToday,
    pendingActivities,
    overdueActivities,
    activitiesByType,
    activitiesByPriority
  ] = await Promise.all([
    // Total activities
    Activity.countDocuments({ createdBy: userId }),
    
    // Completed today
    Activity.countDocuments({
      createdBy: userId,
      isCompleted: true,
      completedAt: { $gte: startOfDay, $lte: endOfDay }
    }),
    
    // Pending activities
    Activity.countDocuments({
      createdBy: userId,
      isCompleted: false
    }),
    
    // Overdue activities
    Activity.countDocuments({
      createdBy: userId,
      isCompleted: false,
      dueDate: { $lt: new Date() }
    }),
    
    // Activities by type
    Activity.aggregate([
      { $match: { createdBy: userId } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    
    // Activities by priority
    Activity.aggregate([
      { $match: { createdBy: userId } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])
  ])

  return {
    totalActivities,
    completedToday,
    pendingActivities,
    overdueActivities,
    activitiesByType,
    activitiesByPriority
  }
}