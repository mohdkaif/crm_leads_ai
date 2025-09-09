import connectDB from '../../utils/mongodb'
import Lead from '../../models/Lead'
import Activity from '../../models/Activity'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    
    // Get token from Authorization header
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Access token required'
      })
    }
    
    const token = authHeader.substring(7)
    
    // Verify JWT token
    const jwt = await import('../../utils/jwt')
    const decoded = jwt.verifyToken(token)
    
    if (!decoded) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token'
      })
    }
    
    const userId = decoded.userId

    // Get leads data
    const leads = await Lead.find({ 
      $or: [
        { assignedTo: userId },
        { createdBy: userId }
      ]
    })
    const activities = await Activity.find({ 
      $or: [
        { createdBy: userId },
        { assignedTo: userId }
      ]
    })

    // AI-powered insights
    const insights = []

    // Lead conversion insights
    const convertedLeads = leads.filter(lead => lead.status === 'converted')
    const conversionRate = leads.length > 0 ? (convertedLeads.length / leads.length) * 100 : 0
    
    if (conversionRate < 20) {
      insights.push({
        type: 'warning',
        title: 'Low Conversion Rate',
        message: `Your conversion rate is ${conversionRate.toFixed(1)}%. Consider improving your follow-up process.`,
        action: 'Review follow-up strategies',
        priority: 'high'
      })
    } else if (conversionRate > 40) {
      insights.push({
        type: 'success',
        title: 'Excellent Conversion Rate',
        message: `Your conversion rate is ${conversionRate.toFixed(1)}%. Keep up the great work!`,
        action: 'Continue current strategies',
        priority: 'low'
      })
    }

    // Lead source insights
    const sourceBreakdown = {}
    leads.forEach(lead => {
      const source = lead.source || 'unknown'
      sourceBreakdown[source] = (sourceBreakdown[source] || 0) + 1
    })

    const bestSource = Object.entries(sourceBreakdown).reduce((a, b) => 
      sourceBreakdown[a[0]] > sourceBreakdown[b[0]] ? a : b
    )

    if (bestSource) {
      insights.push({
        type: 'info',
        title: 'Best Lead Source',
        message: `${bestSource[0]} is your top-performing lead source with ${bestSource[1]} leads.`,
        action: 'Focus more on this source',
        priority: 'medium'
      })
    }

    // Follow-up insights
    const overdueFollowUps = leads.filter(lead => 
      lead.nextFollowUpDate && new Date(lead.nextFollowUpDate) < new Date() && lead.status !== 'converted'
    )

    if (overdueFollowUps.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Overdue Follow-ups',
        message: `You have ${overdueFollowUps.length} leads with overdue follow-ups.`,
        action: 'Schedule follow-ups immediately',
        priority: 'high'
      })
    }

    // High-value leads insights
    const highValueLeads = leads.filter(lead => lead.value && lead.value > 10000)
    if (highValueLeads.length > 0) {
      insights.push({
        type: 'info',
        title: 'High-Value Opportunities',
        message: `You have ${highValueLeads.length} high-value leads (over $10,000).`,
        action: 'Prioritize these leads',
        priority: 'high'
      })
    }

    // Activity insights
    const recentActivities = activities.filter(activity => 
      new Date(activity.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    )

    if (recentActivities.length < 5) {
      insights.push({
        type: 'warning',
        title: 'Low Activity Level',
        message: 'You have completed only a few activities this week.',
        action: 'Increase your activity level',
        priority: 'medium'
      })
    }

    // Lead age insights
    const oldLeads = leads.filter(lead => {
      const daysSinceCreated = (new Date() - new Date(lead.createdAt)) / (1000 * 60 * 60 * 24)
      return daysSinceCreated > 30 && lead.status !== 'converted'
    })

    if (oldLeads.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Aging Leads',
        message: `You have ${oldLeads.length} leads older than 30 days that haven't converted.`,
        action: 'Review and re-engage these leads',
        priority: 'medium'
      })
    }

    // Recommendations
    const recommendations = []

    // Follow-up frequency recommendation
    const avgFollowUpDays = activities
      .filter(activity => activity.type === 'follow_up')
      .reduce((sum, activity) => {
        const daysDiff = (new Date(activity.scheduledDate) - new Date(activity.createdAt)) / (1000 * 60 * 60 * 24)
        return sum + daysDiff
      }, 0) / activities.filter(activity => activity.type === 'follow_up').length

    if (avgFollowUpDays > 7) {
      recommendations.push({
        title: 'Improve Follow-up Speed',
        description: 'Consider following up with leads within 24-48 hours for better conversion rates.',
        impact: 'high'
      })
    }

    // Lead scoring recommendation
    const unscoredLeads = leads.filter(lead => !lead.aiScore)
    if (unscoredLeads.length > 0) {
      recommendations.push({
        title: 'Implement Lead Scoring',
        description: `You have ${unscoredLeads.length} leads without AI scores. Use AI analysis to prioritize leads.`,
        impact: 'medium'
      })
    }

    return {
      success: true,
      data: {
        insights,
        recommendations,
        summary: {
          totalLeads: leads.length,
          conversionRate,
          activeLeads: leads.filter(lead => lead.status === 'active').length,
          totalValue: leads.reduce((sum, lead) => sum + (lead.value || 0), 0)
        }
      }
    }
  } catch (error) {
    console.error('AI Insights error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
