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
    const { companyName, defaultCurrency, timeZone, dateFormat, language, theme } = body

    // Validate required fields
    if (!companyName || !defaultCurrency || !timeZone || !dateFormat) {
      throw createError({
        statusCode: 400,
        statusMessage: 'All required fields must be provided'
      })
    }

    // Validate currency
    const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY']
    if (!validCurrencies.includes(defaultCurrency)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid currency selected'
      })
    }

    // Validate timezone
    const validTimeZones = [
      'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 
      'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo'
    ]
    if (!validTimeZones.includes(timeZone)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid timezone selected'
      })
    }

    // Validate date format
    const validDateFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']
    if (!validDateFormats.includes(dateFormat)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid date format selected'
      })
    }

    // Update user settings
    await User.findByIdAndUpdate(user._id, {
      $set: {
        'settings.general': {
          companyName,
          defaultCurrency,
          timeZone,
          dateFormat,
          language: language || 'en',
          theme: theme || 'light'
        }
      }
    })

    return {
      success: true,
      message: 'General settings updated successfully',
      data: {
        companyName,
        defaultCurrency,
        timeZone,
        dateFormat,
        language: language || 'en',
        theme: theme || 'light'
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
