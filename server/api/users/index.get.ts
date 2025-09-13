import connectDB from '../../utils/mongodb'
import User from '../../models/User'
import { hasPermission } from '../../utils/rbac'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    
    // Get user from auth middleware context
    const currentUser = event.context.user
    if (!currentUser) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    // Check if user has permission to read users
    if (!hasPermission(currentUser.role, 'users', 'read')) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Insufficient permissions'
      })
    }

    const query = getQuery(event)
    const { 
      page = 1, 
      limit = 10, 
      search,
      role,
      status 
    } = query

    // Build filter object
    const filter: any = {}
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }
    
    if (role) filter.role = role
    if (status) filter.status = status

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit)

    // Get users with pagination
    const users = await User.find(filter)
      .select('-password') // Exclude password from response
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))

    // Get total count for pagination
    const total = await User.countDocuments(filter)

    // Get summary statistics
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          inactive: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } },
          admins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
          sales_managers: { $sum: { $cond: [{ $eq: ['$role', 'sales_manager'] }, 1, 0] } },
          account_managers: { $sum: { $cond: [{ $eq: ['$role', 'account_manager'] }, 1, 0] } },
          sales_reps: { $sum: { $cond: [{ $eq: ['$role', 'sales_rep'] }, 1, 0] } },
          customer_success: { $sum: { $cond: [{ $eq: ['$role', 'customer_success'] }, 1, 0] } },
          marketing: { $sum: { $cond: [{ $eq: ['$role', 'marketing'] }, 1, 0] } },
          support: { $sum: { $cond: [{ $eq: ['$role', 'support'] }, 1, 0] } },
          viewers: { $sum: { $cond: [{ $eq: ['$role', 'viewer'] }, 1, 0] } }
        }
      }
    ])

    const summary = stats[0] || { 
      total: 0, 
      active: 0, 
      inactive: 0, 
      admins: 0, 
      sales_managers: 0, 
      account_managers: 0, 
      sales_reps: 0, 
      customer_success: 0, 
      marketing: 0, 
      support: 0, 
      viewers: 0 
    }

    return {
      success: true,
      data: {
        users,
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
    console.error('Users error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})