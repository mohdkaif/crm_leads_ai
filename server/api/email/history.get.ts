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

    const query = getQuery(event)
    const { 
      page = 1, 
      limit = 10, 
      type = 'all', // all, sent, draft
      leadId = '',
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query

    // Build filter query
    const filter: any = {
      type: 'email',
      createdBy: user._id
    }

    if (type === 'sent') {
      filter.metadata = { $exists: true }
      filter['metadata.messageId'] = { $exists: true }
    } else if (type === 'draft') {
      filter.metadata = { $exists: true }
      filter['metadata.isDraft'] = true
    }

    if (leadId) {
      filter.leadId = leadId
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    // Calculate pagination
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

    // Get emails with pagination
    const emails = await Activity.find(filter)
      .populate('leadId', 'firstName lastName company email')
      .populate('createdBy', 'firstName lastName email')
      .sort({ [sortBy as string]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit as string))

    // Get total count
    const totalEmails = await Activity.countDocuments(filter)

    // Get statistics
    const stats = await Activity.aggregate([
      { $match: { type: 'email', createdBy: user._id } },
      {
        $group: {
          _id: null,
          totalEmails: { $sum: 1 },
          sentEmails: {
            $sum: {
              $cond: [
                { $ne: ['$metadata.messageId', null] },
                1,
                0
              ]
            }
          },
          draftEmails: {
            $sum: {
              $cond: [
                { $eq: ['$metadata.isDraft', true] },
                1,
                0
              ]
            }
          }
        }
      }
    ])

    const emailStats = stats[0] || {
      totalEmails: 0,
      sentEmails: 0,
      draftEmails: 0
    }

    return {
      success: true,
      data: {
        emails,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: totalEmails,
          totalPages: Math.ceil(totalEmails / parseInt(limit as string)),
          hasNextPage: skip + parseInt(limit as string) < totalEmails,
          hasPrevPage: parseInt(page as string) > 1
        },
        stats: emailStats
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
