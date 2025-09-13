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

    const leadId = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!leadId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Lead ID is required'
      })
    }

    // Find the lead
    const lead = await Lead.findById(leadId)
    if (!lead) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Lead not found'
      })
    }

    // Check permissions for sales role
    if (user.role === 'sales' && lead.assignedTo.toString() !== user._id.toString()) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied'
      })
    }

    // Track changes for activity log
    const changes: string[] = []
    const oldStatus = lead.status
    const oldPriority = lead.priority

    // Update fields
    if (body.firstName && body.firstName !== lead.firstName) {
      changes.push(`First name changed from "${lead.firstName}" to "${body.firstName}"`)
      lead.firstName = body.firstName
    }

    if (body.lastName && body.lastName !== lead.lastName) {
      changes.push(`Last name changed from "${lead.lastName}" to "${body.lastName}"`)
      lead.lastName = body.lastName
    }

    if (body.email && body.email !== lead.email) {
      // Check if another lead with this email already exists (excluding current lead)
      const existingLead = await Lead.findOne({ 
        email: body.email, 
        _id: { $ne: leadId } 
      })
      if (existingLead) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Lead with this email already exists'
        })
      }
      changes.push(`Email changed from "${lead.email}" to "${body.email}"`)
      lead.email = body.email
    }

    if (body.phone !== undefined && body.phone !== lead.phone) {
      // Check if another lead with this phone already exists (excluding current lead)
      if (body.phone) {
        const existingLead = await Lead.findOne({ 
          phone: body.phone, 
          _id: { $ne: leadId } 
        })
        if (existingLead) {
          throw createError({
            statusCode: 409,
            statusMessage: 'Lead with this phone number already exists'
          })
        }
      }
      changes.push(`Phone changed from "${lead.phone || 'N/A'}" to "${body.phone || 'N/A'}"`)
      lead.phone = body.phone
    }

    if (body.company !== undefined && body.company !== lead.company) {
      changes.push(`Company changed from "${lead.company || 'N/A'}" to "${body.company || 'N/A'}"`)
      lead.company = body.company
    }

    if (body.jobTitle !== undefined && body.jobTitle !== lead.jobTitle) {
      changes.push(`Job title changed from "${lead.jobTitle || 'N/A'}" to "${body.jobTitle || 'N/A'}"`)
      lead.jobTitle = body.jobTitle
    }

    if (body.industry !== undefined && body.industry !== lead.industry) {
      changes.push(`Industry changed from "${lead.industry || 'N/A'}" to "${body.industry || 'N/A'}"`)
      lead.industry = body.industry
    }

    if (body.source && body.source !== lead.source) {
      changes.push(`Source changed from "${lead.source}" to "${body.source}"`)
      lead.source = body.source
    }

    if (body.status && body.status !== lead.status) {
      changes.push(`Status changed from "${lead.status}" to "${body.status}"`)
      lead.status = body.status
    }

    if (body.priority && body.priority !== lead.priority) {
      changes.push(`Priority changed from "${lead.priority}" to "${body.priority}"`)
      lead.priority = body.priority
    }

    if (body.value !== undefined && body.value !== lead.value) {
      changes.push(`Value changed from "${lead.value || 'N/A'}" to "${body.value || 'N/A'}"`)
      lead.value = body.value
    }

    if (body.currency && body.currency !== lead.currency) {
      changes.push(`Currency changed from "${lead.currency}" to "${body.currency}"`)
      lead.currency = body.currency
    }

    if (body.expectedCloseDate !== undefined) {
      const newDate = body.expectedCloseDate ? new Date(body.expectedCloseDate) : null
      const oldDate = lead.expectedCloseDate
      changes.push(`Expected close date changed from "${oldDate || 'N/A'}" to "${newDate || 'N/A'}"`)
      lead.expectedCloseDate = newDate
    }

    if (body.assignedTo && body.assignedTo !== lead.assignedTo.toString()) {
      changes.push(`Assigned to changed`)
      lead.assignedTo = body.assignedTo
    }

    if (body.notes !== undefined && body.notes !== lead.notes) {
      changes.push(`Notes updated`)
      lead.notes = body.notes
    }

    if (body.tags) {
      lead.tags = body.tags
    }

    if (body.customFields) {
      lead.customFields = { ...lead.customFields, ...body.customFields }
    }

    // Update last contact date if status changed to contacted or beyond
    if (body.status && ['contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'].includes(body.status)) {
      lead.lastContactDate = new Date()
    }

    await lead.save()

    // Create activity for significant changes
    if (changes.length > 0) {
      const activity = new Activity({
        type: 'status_change',
        title: 'Lead Updated',
        description: changes.join(', '),
        leadId: lead._id,
        createdBy: user._id,
        metadata: {
          oldStatus,
          newStatus: lead.status,
          oldPriority,
          newPriority: lead.priority
        }
      })

      await activity.save()
    }

    // Populate the updated lead
    await lead.populate('assignedTo', 'firstName lastName email avatar')
    await lead.populate('createdBy', 'firstName lastName email')

    return {
      success: true,
      data: lead,
      message: 'Lead updated successfully'
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
