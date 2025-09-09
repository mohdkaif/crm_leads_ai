import connectDB from '../../utils/mongodb'
import Activity from '../../models/Activity'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    
    // Get token from Authorization header
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Access token required'
      })
    }
    
    const token = authHeader.substring(7)
    
    // Verify JWT token
    const jwt = await import('../../utils/jwt')
    const decoded = jwt.verifyToken(token)
    
    if (!decoded) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token'
      })
    }
    
    const userId = decoded.userId

    const query = getQuery(event)
    const { 
      page = 1, 
      limit = 10, 
      type, 
      status, 
      leadId,
      startDate,
      endDate 
    } = query

    // Build filter object
    const filter: any = { 
      $or: [
        { createdBy: userId },
        { assignedTo: userId }
      ]
    }
    
    if (type) filter.type = type
    if (status) filter.status = status
    if (leadId) filter.leadId = leadId
    
    if (startDate || endDate) {
      filter.createdAt = {}
      if (startDate) filter.createdAt.$gte = new Date(startDate as string)
      if (endDate) filter.createdAt.$lte = new Date(endDate as string)
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit)

    // Get activities with pagination
    const activities = await Activity.find(filter)
      .populate('leadId', 'firstName lastName company email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))

    // Get total count for pagination
    const total = await Activity.countDocuments(filter)

    // Get summary statistics
    const stats = await Activity.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$status', 'pending'] },
                    { $lt: ['$scheduledDate', new Date()] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ])

    const summary = stats[0] || { total: 0, completed: 0, pending: 0, overdue: 0 }

    return {
      success: true,
      data: {
        activities,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        },
        summary
      }
    }
  } catch (error) {
    console.error('Activities error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})