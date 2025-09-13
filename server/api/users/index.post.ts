import connectDB from '../../utils/mongodb'
import User from '../../models/User'
import bcrypt from 'bcryptjs'
import { hasPermission } from '../../utils/rbac'

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
    
    // Get user from database
    const currentUser = await User.findById(decoded.userId).select('-password')
    if (!currentUser) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not found'
      })
    }

    // Check if user has permission to create users
    if (!hasPermission(currentUser.role, 'users', 'create')) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Insufficient permissions'
      })
    }

    const body = await readBody(event)
    const { firstName, lastName, email, password, role, department, jobTitle, phone } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !role) {
      throw createError({
        statusCode: 400,
        statusMessage: 'First name, last name, email, password, and role are required'
      })
    }

    // Validate role
    const validRoles = ['admin', 'sales_manager', 'account_manager', 'sales_rep', 'customer_success', 'marketing', 'support', 'viewer']
    if (!validRoles.includes(role)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid role. Must be one of: admin, sales_manager, account_manager, sales_rep, customer_success, marketing, support, viewer'
      })
    }

    // Check if user can assign this role (sales managers can't create admins)
    if (currentUser.role === 'sales_manager' && role === 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Sales managers cannot create admin users'
      })
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email already exists'
      })
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      department: department || '',
      jobTitle: jobTitle || '',
      phone: phone || '',
      status: 'active',
      createdBy: currentUser._id
    })

    await newUser.save()

    // Return user without password
    const userResponse = await User.findById(newUser._id).select('-password')

    return {
      success: true,
      user: userResponse,
      message: 'User created successfully'
    }
  } catch (error) {
    console.error('Create user error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})