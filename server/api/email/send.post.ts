import connectDB from '../../utils/mongodb'
import Lead from '../../models/Lead'
import User from '../../models/User'
import Activity from '../../models/Activity'
import { sendEmail } from '../../utils/email'

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
    const { leadId, templateId, customSubject, customMessage, sendToEmail } = body

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

    // Determine email address
    const emailAddress = sendToEmail || lead.email
    if (!emailAddress) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No email address available for this lead'
      })
    }

    let subject = ''
    let html = ''
    let text = ''

    // If using a template
    if (templateId) {
      const template = await getTemplate(templateId, currentUser)
      if (!template) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Template not found'
        })
      }

      // Replace template variables
      const variables = {
        leadName: `${lead.firstName} ${lead.lastName}`,
        company: lead.company || 'your company',
        senderName: `${currentUser.firstName} ${currentUser.lastName}`,
        leadEmail: lead.email || '',
        leadPhone: lead.phone || '',
        leadIndustry: lead.industry || '',
        leadValue: lead.value ? `$${lead.value.toLocaleString()}` : '',
        leadStatus: lead.status || '',
        leadPriority: lead.priority || '',
        currentDate: new Date().toLocaleDateString(),
        currentTime: new Date().toLocaleTimeString()
      }

      subject = replaceVariables(template.subject, variables)
      html = replaceVariables(template.html, variables)
      text = htmlToText(html)
    } else {
      // Custom email
      subject = customSubject || `Message from ${currentUser.firstName} ${currentUser.lastName}`
      html = generateCustomEmailHTML(lead, currentUser, customMessage)
      text = generateCustomEmailText(lead, currentUser, customMessage)
    }

    // Send email
    const emailResult = await sendEmail(emailAddress, subject, html, text)

    if (!emailResult.success) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to send email'
      })
    }

    // Create activity record
    const activity = new Activity({
      type: 'email',
      title: templateId ? 'Template Email Sent' : 'Custom Email Sent',
      description: `Email sent to ${lead.firstName} ${lead.lastName}: ${subject}`,
      leadId: lead._id,
      createdBy: user._id,
      assignedTo: user._id,
      priority: 'medium',
      metadata: {
        emailType: templateId ? 'template' : 'custom',
        templateId: templateId || null,
        subject,
        emailAddress,
        messageId: emailResult.messageId
      }
    })

    await activity.save()

    // Update lead last contact date
    lead.lastContactDate = new Date()
    await lead.save()

    return {
      success: true,
      message: 'Email sent successfully',
      data: {
        activityId: activity._id,
        subject,
        emailAddress,
        messageId: emailResult.messageId
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Internal server error'
    })
  }
})

// Helper functions
async function getTemplate(templateId: string, user: any) {
  // Check system templates first
  const systemTemplates = [
    {
      id: 'follow_up',
      subject: 'Following up on our conversation - {{company}}',
      html: `
        <p>Hi {{leadName}},</p>
        <p>I hope this email finds you well. I wanted to follow up on our recent conversation regarding {{company}}'s needs.</p>
        <p>As we discussed, I believe our solution could provide significant value to your organization. I'd love to schedule a brief call to discuss this further and answer any questions you might have.</p>
        <p>Would you be available for a 15-minute call this week? I can work around your schedule.</p>
        <p>Best regards,<br>{{senderName}}</p>
      `
    },
    {
      id: 'introduction',
      subject: 'Introduction from {{senderName}} - {{company}}',
      html: `
        <p>Hi {{leadName}},</p>
        <p>I hope this email finds you well. I'm reaching out from {{company}} because I believe we can help your organization achieve its goals more effectively.</p>
        <p>I'd love to learn more about your current challenges and see if there's a way we can support your team's success.</p>
        <p>Would you be open to a brief 15-minute conversation? I can work around your schedule and promise to make it valuable for you.</p>
        <p>Best regards,<br>{{senderName}}</p>
      `
    }
  ]

  const systemTemplate = systemTemplates.find(t => t.id === templateId)
  if (systemTemplate) {
    return systemTemplate
  }

  // Check user's custom templates
  const customTemplate = user.settings?.emailTemplates?.find((t: any) => t.id === templateId)
  return customTemplate
}

function replaceVariables(text: string, variables: Record<string, string>) {
  let result = text
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, value)
  }
  return result
}

function htmlToText(html: string) {
  // Simple HTML to text conversion
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function generateCustomEmailHTML(lead: any, user: any, message: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Message from ${user.firstName} ${user.lastName}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 40px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef; }
        .signature { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>📧 Message from ${user.firstName} ${user.lastName}</h2>
        </div>
        <div class="content">
          <p>Hi ${lead.firstName} ${lead.lastName},</p>
          <p>${message}</p>
          <div class="signature">
            <p>Best regards,<br>
            ${user.firstName} ${user.lastName}<br>
            CRM Leads AI Team</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateCustomEmailText(lead: any, user: any, message: string) {
  return `Hi ${lead.firstName} ${lead.lastName},\n\n${message}\n\nBest regards,\n${user.firstName} ${user.lastName}\nCRM Leads AI Team`
}
