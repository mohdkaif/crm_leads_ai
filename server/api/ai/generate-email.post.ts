import connectDB from '../../utils/mongodb'
import Lead from '../../models/Lead'
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
    const { leadId, emailType = 'followUp', customMessage, sendEmail = false } = body

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

    // Generate AI-powered email content
    const emailContent = await generateAIEmail({
      lead,
      user: currentUser,
      emailType,
      customMessage
    })

    // Send email if requested
    if (sendEmail && lead.email) {
      const emailResult = await sendTemplateEmail(lead.email, emailType, {
        leadName: `${lead.firstName} ${lead.lastName}`,
        company: lead.company,
        senderName: `${currentUser.firstName} ${currentUser.lastName}`,
        customMessage: emailContent.customMessage
      })

      if (!emailResult.success) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to send email'
        })
      }
    }

    return {
      success: true,
      data: {
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        lead: {
          id: lead._id,
          name: `${lead.firstName} ${lead.lastName}`,
          company: lead.company,
          email: lead.email
        },
        sent: sendEmail && lead.email
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})

// AI-powered email generation
async function generateAIEmail({ lead, user, emailType, customMessage }: any) {
  // This is a simplified AI email generation
  // In production, you would integrate with OpenAI or similar service
  
  const leadName = `${lead.firstName} ${lead.lastName}`
  const company = lead.company || 'your company'
  const senderName = `${user.firstName} ${user.lastName}`
  
  // Generate personalized content based on lead data
  const personalization = generatePersonalization(lead)
  const urgency = determineUrgency(lead)
  const valueProposition = generateValueProposition(lead)
  
  let subject = ''
  let html = ''
  let text = ''
  
  switch (emailType) {
    case 'followUp':
      subject = `Following up on our conversation - ${company}`
      html = generateFollowUpHTML(leadName, company, senderName, personalization, urgency, customMessage)
      text = generateFollowUpText(leadName, company, senderName, personalization, urgency, customMessage)
      break
      
    case 'introduction':
      subject = `Introduction from ${senderName} - ${company}`
      html = generateIntroductionHTML(leadName, company, senderName, personalization, valueProposition)
      text = generateIntroductionText(leadName, company, senderName, personalization, valueProposition)
      break
      
    case 'proposal':
      subject = `Proposal for ${company} - Next Steps`
      html = generateProposalHTML(leadName, company, senderName, personalization, valueProposition)
      text = generateProposalText(leadName, company, senderName, personalization, valueProposition)
      break
      
    default:
      subject = `Message from ${senderName} - ${company}`
      html = generateGenericHTML(leadName, company, senderName, personalization, customMessage)
      text = generateGenericText(leadName, company, senderName, personalization, customMessage)
  }
  
  return {
    subject,
    html,
    text,
    customMessage: personalization
  }
}

function generatePersonalization(lead: any) {
  const insights = []
  
  if (lead.industry) {
    insights.push(`I noticed ${lead.company} operates in the ${lead.industry} industry`)
  }
  
  if (lead.value && lead.value > 10000) {
    insights.push(`I see you're working with a significant budget of $${lead.value.toLocaleString()}`)
  }
  
  if (lead.priority === 'high' || lead.priority === 'urgent') {
    insights.push(`I understand this is a high-priority initiative for your team`)
  }
  
  if (lead.status === 'qualified') {
    insights.push(`Based on our previous conversation, it sounds like you're ready to move forward`)
  }
  
  return insights.join('. ') + '.'
}

function determineUrgency(lead: any) {
  if (lead.priority === 'urgent') return 'urgent'
  if (lead.priority === 'high') return 'high'
  if (lead.status === 'qualified') return 'medium'
  return 'low'
}

function generateValueProposition(lead: any) {
  const propositions = [
    'Our solution can help streamline your processes and increase efficiency',
    'We specialize in helping companies like yours achieve their goals faster',
    'Our platform is designed specifically for your industry needs',
    'We can help you save time and resources while improving results'
  ]
  
  return propositions[Math.floor(Math.random() * propositions.length)]
}

function generateFollowUpHTML(leadName: string, company: string, senderName: string, personalization: string, urgency: string, customMessage?: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Follow-up Email</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 40px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef; }
        .personalization { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; font-style: italic; }
        .cta { background: #007bff; color: white; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0; }
        .signature { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>📧 Follow-up from ${senderName}</h2>
        </div>
        <div class="content">
          <p>Hi ${leadName},</p>
          
          <p>I hope this email finds you well. I wanted to follow up on our recent conversation regarding ${company}'s needs.</p>
          
          <div class="personalization">
            <strong>Personalized Insight:</strong> ${personalization}
          </div>
          
          ${customMessage ? `<p>${customMessage}</p>` : `
          <p>As we discussed, I believe our solution could provide significant value to your organization. ${urgency === 'urgent' ? 'Given the urgency of your project, I\'d like to schedule a call as soon as possible.' : 'I\'d love to schedule a brief call to discuss this further and answer any questions you might have.'}</p>
          
          <div class="cta">
            <strong>Next Steps:</strong><br>
            ${urgency === 'urgent' ? 'Schedule a call this week' : 'Schedule a 15-minute call at your convenience'}
          </div>
          `}
          
          <p>Please let me know if you have any questions or if there's anything else I can help you with.</p>
          
          <div class="signature">
            <p>Best regards,<br>
            ${senderName}<br>
            CRM Leads AI Team</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateFollowUpText(leadName: string, company: string, senderName: string, personalization: string, urgency: string, customMessage?: string) {
  return `Hi ${leadName},\n\nI hope this email finds you well. I wanted to follow up on our recent conversation regarding ${company}'s needs.\n\nPersonalized Insight: ${personalization}\n\n${customMessage || `As we discussed, I believe our solution could provide significant value to your organization. ${urgency === 'urgent' ? 'Given the urgency of your project, I\'d like to schedule a call as soon as possible.' : 'I\'d love to schedule a brief call to discuss this further.'}\n\nNext Steps: ${urgency === 'urgent' ? 'Schedule a call this week' : 'Schedule a 15-minute call at your convenience'}`}\n\nBest regards,\n${senderName}\nCRM Leads AI Team`
}

function generateIntroductionHTML(leadName: string, company: string, senderName: string, personalization: string, valueProposition: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Introduction Email</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 40px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef; }
        .value-prop { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .cta { background: #28a745; color: white; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>👋 Introduction from ${senderName}</h2>
        </div>
        <div class="content">
          <p>Hi ${leadName},</p>
          
          <p>I hope this email finds you well. I'm reaching out from CRM Leads AI because I believe we can help ${company} achieve its goals more effectively.</p>
          
          <div class="value-prop">
            <strong>Why I'm reaching out:</strong><br>
            ${personalization}<br><br>
            <strong>How we can help:</strong><br>
            ${valueProposition}
          </div>
          
          <p>I'd love to learn more about your current challenges and see if there's a way we can support your team's success.</p>
          
          <div class="cta">
            <strong>Would you be open to a brief 15-minute conversation?</strong><br>
            I can work around your schedule and promise to make it valuable for you.
          </div>
          
          <p>Looking forward to connecting!</p>
          
          <p>Best regards,<br>
          ${senderName}<br>
          CRM Leads AI Team</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateIntroductionText(leadName: string, company: string, senderName: string, personalization: string, valueProposition: string) {
  return `Hi ${leadName},\n\nI hope this email finds you well. I'm reaching out from CRM Leads AI because I believe we can help ${company} achieve its goals more effectively.\n\nWhy I'm reaching out:\n${personalization}\n\nHow we can help:\n${valueProposition}\n\nI'd love to learn more about your current challenges and see if there's a way we can support your team's success.\n\nWould you be open to a brief 15-minute conversation? I can work around your schedule and promise to make it valuable for you.\n\nLooking forward to connecting!\n\nBest regards,\n${senderName}\nCRM Leads AI Team`
}

function generateProposalHTML(leadName: string, company: string, senderName: string, personalization: string, valueProposition: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Proposal Email</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 40px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef; }
        .proposal { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .next-steps { background: #007bff; color: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>📋 Proposal for ${company}</h2>
        </div>
        <div class="content">
          <p>Hi ${leadName},</p>
          
          <p>Thank you for taking the time to discuss ${company}'s needs with me. Based on our conversation, I'm excited to present a proposal that I believe will deliver significant value to your organization.</p>
          
          <div class="proposal">
            <strong>Our Understanding:</strong><br>
            ${personalization}<br><br>
            <strong>Proposed Solution:</strong><br>
            ${valueProposition}<br><br>
            <strong>Expected Outcomes:</strong><br>
            • Improved efficiency and productivity<br>
            • Better lead management and conversion<br>
            • Enhanced team collaboration<br>
            • Measurable ROI within 90 days
          </div>
          
          <div class="next-steps">
            <strong>Next Steps:</strong><br>
            1. Review the attached proposal document<br>
            2. Schedule a follow-up call to discuss details<br>
            3. Finalize terms and timeline<br>
            4. Begin implementation
          </div>
          
          <p>I'm confident this solution will help ${company} achieve its goals. I'm available to answer any questions and discuss the next steps.</p>
          
          <p>Best regards,<br>
          ${senderName}<br>
          CRM Leads AI Team</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateProposalText(leadName: string, company: string, senderName: string, personalization: string, valueProposition: string) {
  return `Hi ${leadName},\n\nThank you for taking the time to discuss ${company}'s needs with me. Based on our conversation, I'm excited to present a proposal that I believe will deliver significant value to your organization.\n\nOur Understanding:\n${personalization}\n\nProposed Solution:\n${valueProposition}\n\nExpected Outcomes:\n• Improved efficiency and productivity\n• Better lead management and conversion\n• Enhanced team collaboration\n• Measurable ROI within 90 days\n\nNext Steps:\n1. Review the attached proposal document\n2. Schedule a follow-up call to discuss details\n3. Finalize terms and timeline\n4. Begin implementation\n\nI'm confident this solution will help ${company} achieve its goals. I'm available to answer any questions and discuss the next steps.\n\nBest regards,\n${senderName}\nCRM Leads AI Team`
}

function generateGenericHTML(leadName: string, company: string, senderName: string, personalization: string, customMessage?: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Message from ${senderName}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 40px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>📧 Message from ${senderName}</h2>
        </div>
        <div class="content">
          <p>Hi ${leadName},</p>
          
          <p>${customMessage || `I hope this email finds you well. I wanted to reach out regarding ${company} and see how we might be able to help.`}</p>
          
          <p>${personalization}</p>
          
          <p>Please let me know if you have any questions or if there's anything else I can help you with.</p>
          
          <p>Best regards,<br>
          ${senderName}<br>
          CRM Leads AI Team</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateGenericText(leadName: string, company: string, senderName: string, personalization: string, customMessage?: string) {
  return `Hi ${leadName},\n\n${customMessage || `I hope this email finds you well. I wanted to reach out regarding ${company} and see how we might be able to help.`}\n\n${personalization}\n\nPlease let me know if you have any questions or if there's anything else I can help you with.\n\nBest regards,\n${senderName}\nCRM Leads AI Team`
}
