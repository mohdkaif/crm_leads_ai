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

    const body = await readBody(event)
    const { name, description, category, subject, html, variables } = body

    if (!name || !subject || !html) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name, subject, and HTML content are required'
      })
    }

    // Get user
    const currentUser = await User.findById(user._id)
    if (!currentUser) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    // Initialize settings if not exists
    if (!currentUser.settings) {
      currentUser.settings = {}
    }
    if (!currentUser.settings.emailTemplates) {
      currentUser.settings.emailTemplates = []
    }

    // Create new template
    const newTemplate = {
      id: `custom_${Date.now()}`,
      name,
      description: description || '',
      category: category || 'Custom',
      isSystem: false,
      subject,
      html,
      variables: variables || [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Add template to user's settings
    currentUser.settings.emailTemplates.push(newTemplate)
    await currentUser.save()

    return {
      success: true,
      message: 'Email template saved successfully',
      data: newTemplate
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
