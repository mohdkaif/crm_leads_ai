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

    const body = await readBody(event)
    const { leadId, subject, html, templateId, isDraft = true } = body

    if (!leadId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Lead ID is required'
      })
    }

    if (!subject || !html) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Subject and content are required'
      })
    }

    // Get lead details
    const lead = await Lead.findById(leadId)
    if (!lead) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Lead not found'
      })
    }

    // Create draft activity
    const draftActivity = new Activity({
      type: 'email',
      title: isDraft ? 'Email Draft' : 'Email Sent',
      description: `Email ${isDraft ? 'draft' : 'sent'} to ${lead.firstName} ${lead.lastName}: ${subject}`,
      leadId: lead._id,
      createdBy: user._id,
      assignedTo: user._id,
      priority: 'medium',
      metadata: {
        emailType: 'draft',
        templateId: templateId || null,
        subject,
        html,
        isDraft,
        leadEmail: lead.email,
        leadName: `${lead.firstName} ${lead.lastName}`,
        company: lead.company
      }
    })

    await draftActivity.save()

    return {
      success: true,
      message: isDraft ? 'Draft saved successfully' : 'Email sent successfully',
      data: {
        activityId: draftActivity._id,
        subject,
        lead: {
          id: lead._id,
          name: `${lead.firstName} ${lead.lastName}`,
          company: lead.company,
          email: lead.email
        }
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
