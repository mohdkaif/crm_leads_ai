import connectDB from '../../utils/mongodb'
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

    // Get user's custom templates
    const currentUser = await User.findById(user._id)
    if (!currentUser) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    const customTemplates = currentUser.settings?.emailTemplates || []

    // Default system templates
    const systemTemplates = [
      {
        id: 'follow_up',
        name: 'Follow-up Email',
        description: 'Professional follow-up after initial contact',
        category: 'Follow-up',
        isSystem: true,
        subject: 'Following up on our conversation - {{company}}',
        html: `
          <p>Hi {{leadName}},</p>
          <p>I hope this email finds you well. I wanted to follow up on our recent conversation regarding {{company}}'s needs.</p>
          <p>As we discussed, I believe our solution could provide significant value to your organization. I'd love to schedule a brief call to discuss this further and answer any questions you might have.</p>
          <p>Would you be available for a 15-minute call this week? I can work around your schedule.</p>
          <p>Best regards,<br>{{senderName}}</p>
        `,
        variables: ['leadName', 'company', 'senderName']
      },
      {
        id: 'introduction',
        name: 'Introduction Email',
        description: 'Initial outreach to new leads',
        category: 'Outreach',
        isSystem: true,
        subject: 'Introduction from {{senderName}} - {{company}}',
        html: `
          <p>Hi {{leadName}},</p>
          <p>I hope this email finds you well. I'm reaching out from {{company}} because I believe we can help your organization achieve its goals more effectively.</p>
          <p>I'd love to learn more about your current challenges and see if there's a way we can support your team's success.</p>
          <p>Would you be open to a brief 15-minute conversation? I can work around your schedule and promise to make it valuable for you.</p>
          <p>Best regards,<br>{{senderName}}</p>
        `,
        variables: ['leadName', 'company', 'senderName']
      },
      {
        id: 'proposal',
        name: 'Proposal Email',
        description: 'Send proposals and next steps',
        category: 'Proposal',
        isSystem: true,
        subject: 'Proposal for {{company}} - Next Steps',
        html: `
          <p>Hi {{leadName}},</p>
          <p>Thank you for taking the time to discuss {{company}}'s needs with me. Based on our conversation, I'm excited to present a proposal that I believe will deliver significant value to your organization.</p>
          <p>I'm confident this solution will help {{company}} achieve its goals. I'm available to answer any questions and discuss the next steps.</p>
          <p>Best regards,<br>{{senderName}}</p>
        `,
        variables: ['leadName', 'company', 'senderName']
      },
      {
        id: 'meeting_reminder',
        name: 'Meeting Reminder',
        description: 'Remind leads about scheduled meetings',
        category: 'Meeting',
        isSystem: true,
        subject: 'Meeting Reminder - {{company}}',
        html: `
          <p>Hi {{leadName}},</p>
          <p>This is a friendly reminder about our scheduled meeting for {{company}}.</p>
          <p>Meeting Details:<br>
          Date: {{meetingDate}}<br>
          Time: {{meetingTime}}<br>
          Location: {{meetingLocation}}</p>
          <p>Looking forward to our conversation!</p>
          <p>Best regards,<br>{{senderName}}</p>
        `,
        variables: ['leadName', 'company', 'senderName', 'meetingDate', 'meetingTime', 'meetingLocation']
      },
      {
        id: 'thank_you',
        name: 'Thank You Email',
        description: 'Thank leads for their time and interest',
        category: 'Follow-up',
        isSystem: true,
        subject: 'Thank you for your time - {{company}}',
        html: `
          <p>Hi {{leadName}},</p>
          <p>Thank you for taking the time to speak with me about {{company}}'s needs. I really enjoyed our conversation and learning more about your goals.</p>
          <p>As promised, I'll follow up with the information we discussed. Please don't hesitate to reach out if you have any questions in the meantime.</p>
          <p>Best regards,<br>{{senderName}}</p>
        `,
        variables: ['leadName', 'company', 'senderName']
      }
    ]

    return {
      success: true,
      data: {
        systemTemplates,
        customTemplates,
        categories: ['Follow-up', 'Outreach', 'Proposal', 'Meeting', 'Thank You', 'Custom']
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
