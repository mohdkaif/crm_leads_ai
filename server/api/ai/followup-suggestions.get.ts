import connectDB from '../../utils/mongodb'
import Lead from '../../models/Lead'

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

    // Get leads that need follow-up
    const leads = await Lead.find({
      $or: [
        { nextFollowUpDate: { $lt: new Date() } }, // Overdue follow-ups
        { nextFollowUpDate: { $exists: false } }, // No follow-up scheduled
        { status: { $in: ['new', 'contacted'] } } // New or contacted leads
      ]
    })
    .populate('assignedTo', 'firstName lastName email')
    .sort({ priority: -1, createdAt: -1 })
    .limit(10)

    // Generate AI suggestions based on lead data
    const suggestions = leads.map(lead => {
      let suggestion = ''
      let priority = 'medium'

      // Determine suggestion based on lead status and data
      if (lead.status === 'new') {
        if (lead.priority === 'high' || lead.priority === 'urgent') {
          suggestion = `Urgent: New high-priority lead. Schedule immediate call to discuss ${lead.company || 'their'} requirements.`
          priority = 'urgent'
        } else {
          suggestion = `Welcome new lead. Send personalized email introducing our services and schedule initial consultation.`
        }
      } else if (lead.status === 'contacted') {
        if (lead.nextFollowUpDate && lead.nextFollowUpDate < new Date()) {
          suggestion = `Overdue follow-up. Lead was contacted but no recent activity. Send follow-up email or call to re-engage.`
          priority = 'high'
        } else {
          suggestion = `Continue nurturing relationship. Send relevant case studies or schedule product demo.`
        }
      } else if (lead.status === 'qualified') {
        suggestion = `Qualified lead ready for proposal. Prepare customized proposal based on their requirements and schedule presentation.`
        priority = 'high'
      } else if (lead.status === 'proposal') {
        suggestion = `Follow up on proposal. Check if they have questions and schedule call to discuss next steps.`
        priority = 'high'
      } else if (lead.status === 'negotiation') {
        suggestion = `Active negotiation in progress. Schedule call to discuss terms and address any concerns.`
        priority = 'urgent'
      }

      // Add AI insights based on lead data
      if (lead.value && lead.value > 50000) {
        suggestion += ' High-value opportunity - prioritize this lead.'
        priority = 'urgent'
      }

      if (lead.industry) {
        suggestion += ` Consider industry-specific case studies for ${lead.industry}.`
      }

      return {
        id: `suggestion_${lead._id}`,
        leadId: lead._id,
        leadName: `${lead.firstName} ${lead.lastName}`,
        company: lead.company,
        priority,
        suggestion,
        status: lead.status,
        value: lead.value,
        lastContact: lead.lastContactDate,
        nextFollowUp: lead.nextFollowUpDate
      }
    })

    // Sort suggestions by priority
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
    suggestions.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])

    return {
      success: true,
      data: suggestions,
      message: 'AI follow-up suggestions generated successfully'
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
