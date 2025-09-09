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

    const body = await readBody(event)
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      jobTitle,
      website,
      eventName,
      eventType,
      eventDate,
      eventLocation,
      expectedAttendees,
      eventWebsite,
      priority = 'medium',
      source = 'email_outreach',
      assignedTo,
      notes,
      tags = []
    } = body

    // Validate required fields
    if (!firstName || !lastName || !email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'First name, last name, and email are required'
      })
    }

    // Check if email already exists
    const existingOrganizer = await EventOrganizer.findOne({ email })
    if (existingOrganizer) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Event organizer with this email already exists'
      })
    }

    // Create new event organizer
    const newOrganizer = new EventOrganizer({
      firstName,
      lastName,
      email,
      phone,
      company,
      jobTitle,
      website,
      eventName,
      eventType,
      eventDate: eventDate ? new Date(eventDate) : undefined,
      eventLocation,
      expectedAttendees: expectedAttendees ? Number(expectedAttendees) : undefined,
      eventWebsite,
      priority,
      source,
      assignedTo: assignedTo || userId,
      createdBy: userId,
      notes,
      tags,
      status: 'new',
      intent: 'unclear',
      sentiment: 'neutral',
      engagementScore: 0,
      aiScore: 0,
      totalEmailsSent: 0,
      totalRepliesReceived: 0,
      responseRate: 0
    })

    await newOrganizer.save()

    // Populate the response
    const populatedOrganizer = await EventOrganizer.findById(newOrganizer._id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')

    return {
      success: true,
      data: {
        organizer: populatedOrganizer
      },
      message: 'Event organizer created successfully'
    }
  } catch (error) {
    console.error('Create event organizer error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
