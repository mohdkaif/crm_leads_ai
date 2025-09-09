import connectDB from '../../utils/mongodb'
import Lead from '../../models/Lead'
import Activity from '../../models/Activity'
import { aiService } from '../../utils/ai'

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

    const { leadId } = await readBody(event)

    if (!leadId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Lead ID is required'
      })
    }

    // Get lead and activities
    const lead = await Lead.findById(leadId)
    if (!lead) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Lead not found'
      })
    }

    // Check permissions for sales role
    if (user.role === 'sales' && lead.assignedTo.toString() !== user._id.toString()) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied'
      })
    }

    const activities = await Activity.find({ leadId })
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })

    // Generate AI insights
    const insights = await aiService.generateInsights(lead, activities)

    // Update lead with AI insights
    lead.aiScore = insights.score
    lead.aiInsights = {
      sentiment: insights.sentiment.sentiment,
      engagement: insights.engagement,
      urgency: insights.urgency,
      recommendations: insights.recommendations
    }

    await lead.save()

    // Create AI insight activity
    const activity = new Activity({
      type: 'ai_insight',
      title: 'AI Analysis Completed',
      description: `Lead scored ${insights.score}/100. Sentiment: ${insights.sentiment.sentiment}. Engagement: ${insights.engagement}.`,
      leadId: lead._id,
      createdBy: user._id,
      metadata: {
        aiScore: insights.score,
        sentiment: insights.sentiment,
        engagement: insights.engagement,
        urgency: insights.urgency,
        recommendations: insights.recommendations,
        nextActions: insights.nextActions,
        riskFactors: insights.riskFactors
      }
    })

    await activity.save()

    return {
      success: true,
      data: {
        leadId: lead._id,
        insights: {
          score: insights.score,
          sentiment: insights.sentiment,
          engagement: insights.engagement,
          urgency: insights.urgency,
          recommendations: insights.recommendations,
          nextActions: insights.nextActions,
          riskFactors: insights.riskFactors
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
