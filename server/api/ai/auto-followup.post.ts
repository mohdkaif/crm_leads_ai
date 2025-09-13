import connectDB from '../../utils/mongodb'
import Lead from '../../models/Lead'
import Activity from '../../models/Activity'
import User from '../../models/User'
import { sendTemplateEmail } from '../../utils/email'

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
    const { leadId, followUpType = 'auto', customMessage } = body

    if (!leadId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Lead ID is required'
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

    // Get user details
    const currentUser = await User.findById(user._id)
    if (!currentUser) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    // Check if lead has email
    if (!lead.email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Lead does not have an email address'
      })
    }

    // Generate AI-powered follow-up content
    const followUpContent = await generateAutoFollowUp({
      lead,
      user: currentUser,
      followUpType,
      customMessage
    })

    // Send the follow-up email
    const emailResult = await sendTemplateEmail(lead.email, 'followUp', {
      leadName: `${lead.firstName} ${lead.lastName}`,
      company: lead.company,
      senderName: `${currentUser.firstName} ${currentUser.lastName}`,
      customMessage: followUpContent.customMessage
    })

    if (!emailResult.success) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to send follow-up email'
      })
    }

    // Create activity record
    const activity = new Activity({
      type: 'email',
      title: 'AI Auto Follow-up Sent',
      description: `AI-generated follow-up email sent to ${lead.firstName} ${lead.lastName}`,
      leadId: lead._id,
      createdBy: user._id,
      assignedTo: user._id,
      priority: 'medium',
      metadata: {
        emailType: 'auto_followup',
        followUpType,
        subject: followUpContent.subject,
        aiGenerated: true
      }
    })

    await activity.save()

    // Update lead last contact date
    lead.lastContactDate = new Date()
    await lead.save()

    return {
      success: true,
      message: 'Auto follow-up sent successfully',
      data: {
        activityId: activity._id,
        subject: followUpContent.subject,
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

// Auto follow-up generation
async function generateAutoFollowUp({ lead, user, followUpType, customMessage }: any) {
  const leadName = `${lead.firstName} ${lead.lastName}`
  const company = lead.company || 'your company'
  const senderName = `${user.firstName} ${user.lastName}`
  
  // Analyze lead history for context
  const leadActivities = await Activity.find({ leadId: lead._id })
    .sort({ createdAt: -1 })
    .limit(5)
  
  // Generate contextual follow-up based on lead status and history
  let followUpStrategy = determineFollowUpStrategy(lead, leadActivities)
  let contextualMessage = generateContextualMessage(lead, leadActivities, followUpStrategy)
  
  // Use custom message if provided, otherwise use contextual message
  const finalMessage = customMessage || contextualMessage
  
  return {
    subject: `Following up on our conversation - ${company}`,
    customMessage: finalMessage
  }
}

function determineFollowUpStrategy(lead: any, activities: any[]) {
  const daysSinceCreated = Math.floor((new Date().getTime() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24))
  const lastActivity = activities[0]
  
  // New lead (no previous contact)
  if (activities.length === 0 || activities.every(a => a.type === 'note')) {
    return 'introduction'
  }
  
  // Recent contact but no response
  if (lastActivity && lastActivity.type === 'email' && daysSinceCreated < 7) {
    return 'gentle_reminder'
  }
  
  // Qualified lead needing push
  if (lead.status === 'qualified' && daysSinceCreated > 3) {
    return 'urgency'
  }
  
  // Stale lead re-engagement
  if (daysSinceCreated > 14) {
    return 're_engagement'
  }
  
  // Default follow-up
  return 'standard'
}

function generateContextualMessage(lead: any, activities: any[], strategy: string) {
  const leadName = `${lead.firstName} ${lead.lastName}`
  const company = lead.company || 'your company'
  
  switch (strategy) {
    case 'introduction':
      return `Hi ${leadName}, I hope this email finds you well. I wanted to reach out regarding ${company} and see how we might be able to help your team achieve its goals. I've been following your company's progress and I believe we have a solution that could provide significant value.`
      
    case 'gentle_reminder':
      return `Hi ${leadName}, I wanted to follow up on my previous email regarding ${company}. I understand you're busy, but I didn't want to miss the opportunity to discuss how we can help your team. I'm happy to work around your schedule for a brief conversation.`
      
    case 'urgency':
      return `Hi ${leadName}, I hope you're doing well. I wanted to follow up on our discussion about ${company}'s needs. Given the timeline we discussed, I wanted to make sure we don't miss the opportunity to move forward. I have some specific recommendations that I believe will help your team succeed.`
      
    case 're_engagement':
      return `Hi ${leadName}, I hope this email finds you well. It's been a while since we last connected regarding ${company}, and I wanted to reach out to see if there have been any changes in your priorities or if there's anything new we can help you with.`
      
    default:
      return `Hi ${leadName}, I hope this email finds you well. I wanted to follow up on our recent conversation regarding ${company} and see if you have any questions or if there's anything else I can help you with.`
  }
}
