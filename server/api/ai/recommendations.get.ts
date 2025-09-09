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

    const query = getQuery(event)
    const { limit = 10, priority = 'all' } = query

    // Build filter based on user role
    const leadFilter: any = {}
    if (user.role === 'sales') {
      leadFilter.assignedTo = user._id
    }

    // Add priority filter
    if (priority !== 'all') {
      leadFilter.priority = priority
    }

    // Get leads that need attention
    const leads = await Lead.find(leadFilter)
      .populate('assignedTo', 'firstName lastName email avatar')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 2) // Get more to filter

    const recommendations = []

    for (const lead of leads) {
      const activities = await Activity.find({ leadId: lead._id })
        .sort({ createdAt: -1 })
        .limit(10)

      const insights = await aiService.generateInsights(lead, activities)

      // Only include leads that need attention
      if (insights.score < 50 || 
          insights.urgency === 'high' || 
          insights.engagement === 'low' ||
          insights.riskFactors.length > 0) {
        
        recommendations.push({
          leadId: lead._id,
          leadName: `${lead.firstName} ${lead.lastName}`,
          company: lead.company,
          status: lead.status,
          priority: lead.priority,
          aiScore: insights.score,
          insights: {
            sentiment: insights.sentiment,
            engagement: insights.engagement,
            urgency: insights.urgency,
            recommendations: insights.recommendations.slice(0, 3), // Top 3 recommendations
            nextActions: insights.nextActions.slice(0, 3), // Top 3 next actions
            riskFactors: insights.riskFactors
          },
          lastActivity: activities[0]?.createdAt,
          assignedTo: lead.assignedTo
        })
      }
    }

    // Sort by AI score and urgency
    recommendations.sort((a, b) => {
      if (a.insights.urgency === 'high' && b.insights.urgency !== 'high') return -1
      if (b.insights.urgency === 'high' && a.insights.urgency !== 'high') return 1
      return a.aiScore - b.aiScore
    })

    return {
      success: true,
      data: recommendations.slice(0, Number(limit))
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
