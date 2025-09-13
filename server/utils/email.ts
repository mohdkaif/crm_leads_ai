import nodemailer from 'nodemailer'

// Email configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  })
}

// Email templates
export const emailTemplates = {
  // 2FA Email
  twoFactorAuth: (code: string, name: string) => ({
    subject: 'Your 2FA Verification Code - CRM Leads AI',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>2FA Verification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .code { background: #007bff; color: white; font-size: 32px; font-weight: bold; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Two-Factor Authentication</h1>
            <p>Secure your account with an additional layer of protection</p>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>You've requested to enable two-factor authentication for your CRM Leads AI account. Use the verification code below to complete the setup:</p>
            
            <div class="code">${code}</div>
            
            <p><strong>Important:</strong></p>
            <ul>
              <li>This code will expire in 10 minutes</li>
              <li>Don't share this code with anyone</li>
              <li>If you didn't request this, please contact support immediately</li>
            </ul>
            
            <p>Once verified, your account will be protected with 2FA and you'll need to use this method for future logins.</p>
          </div>
          <div class="footer">
            <p>This email was sent from CRM Leads AI. If you have any questions, please contact our support team.</p>
            <p>&copy; 2024 CRM Leads AI. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hello ${name}!\n\nYour 2FA verification code is: ${code}\n\nThis code will expire in 10 minutes. Don't share this code with anyone.\n\nIf you didn't request this, please contact support immediately.\n\nBest regards,\nCRM Leads AI Team`
  }),

  // Welcome Email
  welcome: (name: string, company: string) => ({
    subject: `Welcome to CRM Leads AI, ${name}!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to CRM Leads AI</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 40px; border-radius: 0 0 10px 10px; }
          .feature { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #007bff; }
          .button { display: inline-block; background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to CRM Leads AI!</h1>
            <p>Your intelligent lead management solution is ready</p>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>Welcome to CRM Leads AI! We're excited to have ${company} join our platform. Your account has been successfully created and you're ready to start managing your leads with AI-powered insights.</p>
            
            <h3>🚀 What you can do now:</h3>
            <div class="feature">
              <strong>📊 AI-Powered Analytics</strong><br>
              Get intelligent insights about your leads and sales performance
            </div>
            <div class="feature">
              <strong>🤖 Smart Follow-ups</strong><br>
              Automate your follow-up process with AI-generated emails
            </div>
            <div class="feature">
              <strong>📈 Lead Scoring</strong><br>
              Identify high-value leads with our advanced scoring system
            </div>
            <div class="feature">
              <strong>📧 Email Templates</strong><br>
              Use professional templates for all your communications
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="button">Get Started</a>
            </div>
            
            <p>Need help getting started? Check out our <a href="#">documentation</a> or contact our support team.</p>
          </div>
          <div class="footer">
            <p>This email was sent from CRM Leads AI. If you have any questions, please contact our support team.</p>
            <p>&copy; 2024 CRM Leads AI. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hello ${name}!\n\nWelcome to CRM Leads AI! We're excited to have ${company} join our platform.\n\nYour account is ready and you can start:\n- Managing leads with AI insights\n- Automating follow-ups\n- Using smart lead scoring\n- Sending professional emails\n\nGet started: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard\n\nBest regards,\nCRM Leads AI Team`
  }),

  // Follow-up Email Template
  followUp: (leadName: string, company: string, senderName: string, customMessage?: string) => ({
    subject: `Following up on our conversation - ${company}`,
    html: `
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
          .signature { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📧 Follow-up from ${senderName}</h2>
          </div>
          <div class="content">
            <p>Hi ${leadName},</p>
            
            <p>I hope this email finds you well. I wanted to follow up on our recent conversation regarding ${company}'s needs and how we might be able to help.</p>
            
            ${customMessage ? `<p>${customMessage}</p>` : `
            <p>As discussed, I believe our solution could provide significant value to your organization. I'd love to schedule a brief call to discuss this further and answer any questions you might have.</p>
            
            <p>Would you be available for a 15-minute call this week? I can work around your schedule.</p>
            `}
            
            <p>Please let me know if you have any questions or if there's anything else I can help you with.</p>
            
            <div class="signature">
              <p>Best regards,<br>
              ${senderName}<br>
              CRM Leads AI Team</p>
            </div>
          </div>
          <div class="footer">
            <p>This email was sent from CRM Leads AI. If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hi ${leadName},\n\nI hope this email finds you well. I wanted to follow up on our recent conversation regarding ${company}'s needs.\n\n${customMessage || 'As discussed, I believe our solution could provide significant value to your organization. I\'d love to schedule a brief call to discuss this further.\n\nWould you be available for a 15-minute call this week?'}\n\nBest regards,\n${senderName}\nCRM Leads AI Team`
  }),

  // Lead Assignment Email
  leadAssignment: (leadName: string, company: string, assigneeName: string, assignedByName: string) => ({
    subject: `New lead assigned: ${leadName} from ${company}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Lead Assignment</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .lead-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 New Lead Assignment</h1>
            <p>You have a new lead to follow up with</p>
          </div>
          <div class="content">
            <h2>Hello ${assigneeName}!</h2>
            <p>${assignedByName} has assigned you a new lead to follow up with:</p>
            
            <div class="lead-info">
              <h3>📋 Lead Details</h3>
              <p><strong>Name:</strong> ${leadName}</p>
              <p><strong>Company:</strong> ${company}</p>
              <p><strong>Assigned by:</strong> ${assignedByName}</p>
              <p><strong>Assigned on:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <p>Please review the lead details and follow up as soon as possible. The lead is waiting for your response.</p>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/leads" class="button">View Lead Details</a>
            </div>
          </div>
          <div class="footer">
            <p>This email was sent from CRM Leads AI. If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hello ${assigneeName}!\n\n${assignedByName} has assigned you a new lead:\n\nName: ${leadName}\nCompany: ${company}\nAssigned by: ${assignedByName}\nAssigned on: ${new Date().toLocaleDateString()}\n\nPlease review and follow up as soon as possible.\n\nView details: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/leads\n\nBest regards,\nCRM Leads AI Team`
  })
}

// Email sending functions
export const sendEmail = async (to: string, subject: string, html: string, text: string) => {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: `"CRM Leads AI" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text
    }
    
    const result = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: error.message }
  }
}

export const sendTemplateEmail = async (to: string, template: string, data: any) => {
  try {
    const emailTemplate = emailTemplates[template as keyof typeof emailTemplates]
    if (!emailTemplate) {
      throw new Error(`Template ${template} not found`)
    }
    
    const email = emailTemplate(data)
    return await sendEmail(to, email.subject, email.html, email.text)
  } catch (error) {
    console.error('Error sending template email:', error)
    return { success: false, error: error.message }
  }
}

// Generate 2FA code
export const generate2FACode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Store 2FA codes (in production, use Redis or database)
const twoFACodes = new Map<string, { code: string; expires: number }>()

export const store2FACode = (email: string, code: string) => {
  const expires = Date.now() + 10 * 60 * 1000 // 10 minutes
  twoFACodes.set(email, { code, expires })
}

export const verify2FACode = (email: string, code: string) => {
  const stored = twoFACodes.get(email)
  if (!stored) return false
  
  if (Date.now() > stored.expires) {
    twoFACodes.delete(email)
    return false
  }
  
  if (stored.code === code) {
    twoFACodes.delete(email)
    return true
  }
  
  return false
}

// Clean up expired codes
setInterval(() => {
  const now = Date.now()
  for (const [email, data] of twoFACodes.entries()) {
    if (now > data.expires) {
      twoFACodes.delete(email)
    }
  }
}, 5 * 60 * 1000) // Clean up every 5 minutes
