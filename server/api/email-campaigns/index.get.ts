import connectDB from '../../utils/mongodb'
import EmailCampaign from '../../models/EmailCampaign'

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
      search,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query

    // Build filter object
    const filter: any = { 
      $or: [
        { createdBy: userId },
        { assignedTo: userId }
      ]
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ]
    }
    
    if (status) filter.status = status

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit)

    // Build sort object
    const sort: any = {}
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1

    // Get campaigns with pagination
    const campaigns = await EmailCampaign.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))

    // Get total count
    const total = await EmailCampaign.countDocuments(filter)

    // Calculate summary statistics
    const summary = await EmailCampaign.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          draft: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
          scheduled: { $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] } },
          running: { $sum: { $cond: [{ $eq: ['$status', 'running'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          totalSent: { $sum: '$metrics.totalSent' },
          totalDelivered: { $sum: '$metrics.totalDelivered' },
          totalOpened: { $sum: '$metrics.totalOpened' },
          totalReplied: { $sum: '$metrics.totalReplied' },
          avgOpenRate: { $avg: '$metrics.openRate' },
          avgReplyRate: { $avg: '$metrics.replyRate' }
        }
      }
    ])

    const summaryData = summary[0] || {
      total: 0,
      draft: 0,
      scheduled: 0,
      running: 0,
      completed: 0,
      totalSent: 0,
      totalDelivered: 0,
      totalOpened: 0,
      totalReplied: 0,
      avgOpenRate: 0,
      avgReplyRate: 0
    }

    return {
      success: true,
      data: {
        campaigns,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        },
        summary: summaryData
      }
    }
  } catch (error) {
    console.error('Get email campaigns error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
