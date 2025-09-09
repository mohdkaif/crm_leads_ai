import connectDB from '../../utils/mongodb'
import Lead from '../../models/Lead'
import { hasPermission } from '../../utils/rbac'

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
      status,
      priority,
      assignedTo,
      source,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query

    // Build filter object
    const filter: any = {}

    // Role-based filtering
    if (user.role === 'sales') {
      filter.assignedTo = user._id
    } else if (user.role === 'viewer') {
      // Viewers can see all leads but with limited fields
    }

    // Apply filters
    if (status) filter.status = status
    if (priority) filter.priority = priority
    if (assignedTo) filter.assignedTo = assignedTo
    if (source) filter.source = source

    // Search functionality
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ]
    }

    // Build sort object
    const sort: any = {}
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit)

    // Execute query
    const leads = await Lead.find(filter)
      .populate('assignedTo', 'firstName lastName email avatar')
      .populate('createdBy', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))

    const total = await Lead.countDocuments(filter)

    // Calculate pagination info
    const totalPages = Math.ceil(total / Number(limit))
    const hasNextPage = Number(page) < totalPages
    const hasPrevPage = Number(page) > 1

    return {
      success: true,
      data: leads,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
