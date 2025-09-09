import connectDB from '../../utils/mongodb'
import EventOrganizer from '../../models/EventOrganizer'

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
      priority,
      intent,
      sentiment,
      eventType,
      assignedTo,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query

    // Build filter object
    const filter: any = { 
      $or: [
        { assignedTo: userId },
        { createdBy: userId }
      ]
    }
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { eventName: { $regex: search, $options: 'i' } }
      ]
    }
    
    if (status) filter.status = status
    if (priority) filter.priority = priority
    if (intent) filter.intent = intent
    if (sentiment) filter.sentiment = sentiment
    if (eventType) filter.eventType = eventType
    if (assignedTo) filter.assignedTo = assignedTo

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit)

    // Build sort object
    const sort: any = {}
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1

    // Get organizers with pagination
    const organizers = await EventOrganizer.find(filter)
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))

    // Get total count
    const total = await EventOrganizer.countDocuments(filter)

    // Calculate summary statistics
    const summary = await EventOrganizer.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          interested: { $sum: { $cond: [{ $eq: ['$intent', 'interested'] }, 1, 0] } },
          notInterested: { $sum: { $cond: [{ $eq: ['$intent', 'not_interested'] }, 1, 0] } },
          needInfo: { $sum: { $cond: [{ $eq: ['$intent', 'need_info'] }, 1, 0] } },
          pricingInquiry: { $sum: { $cond: [{ $eq: ['$intent', 'pricing_inquiry'] }, 1, 0] } },
          followUpNeeded: { $sum: { $cond: [{ $eq: ['$intent', 'follow_up_needed'] }, 1, 0] } },
          converted: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } },
          highPriority: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
          urgent: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } },
          avgEngagementScore: { $avg: '$engagementScore' },
          avgAiScore: { $avg: '$aiScore' }
        }
      }
    ])

    const summaryData = summary[0] || {
      total: 0,
      interested: 0,
      notInterested: 0,
      needInfo: 0,
      pricingInquiry: 0,
      followUpNeeded: 0,
      converted: 0,
      highPriority: 0,
      urgent: 0,
      avgEngagementScore: 0,
      avgAiScore: 0
    }

    return {
      success: true,
      data: {
        organizers,
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
    console.error('Get event organizers error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
