import connectDB from '../../utils/mongodb'
import Lead from '../../models/Lead'
import Activity from '../../models/Activity'

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

    const body = await readBody(event)
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      jobTitle,
      industry,
      source,
      priority = 'medium',
      value,
      currency = 'USD',
      expectedCloseDate,
      assignedTo,
      notes,
      tags = [],
      customFields = {}
    } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !source) {
      throw createError({
        statusCode: 400,
        statusMessage: 'First name, last name, email, and source are required'
      })
    }

    // Check if lead with email already exists
    const existingLeadByEmail = await Lead.findOne({ email })
    if (existingLeadByEmail) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Lead with this email already exists'
      })
    }

    // Check if lead with phone already exists (if phone is provided)
    if (phone) {
      const existingLeadByPhone = await Lead.findOne({ phone })
      if (existingLeadByPhone) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Lead with this phone number already exists'
        })
      }
    }

    // Create new lead
    const lead = new Lead({
      firstName,
      lastName,
      email,
      phone,
      company,
      jobTitle,
      industry,
      source,
      priority,
      value,
      currency,
      expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : undefined,
      assignedTo: assignedTo || user._id,
      createdBy: user._id,
      notes,
      tags,
      customFields
    })

    await lead.save()

    // Create initial activity
    const activity = new Activity({
      type: 'note',
      title: 'Lead Created',
      description: `Lead ${firstName} ${lastName} was created`,
      leadId: lead._id,
      createdBy: user._id
    })

    await activity.save()

    // Populate the lead with user details
    await lead.populate('assignedTo', 'firstName lastName email avatar')
    await lead.populate('createdBy', 'firstName lastName email')

    return {
      success: true,
      data: lead,
      message: 'Lead created successfully'
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
