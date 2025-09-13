import connectDB from '../../utils/mongodb'
import Lead from '../../models/Lead'
import Activity from '../../models/Activity'
import * as aiHelpers from '../../utils/ai-insights'

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

    // Get date range (default to last 30 days)
    const query = getQuery(event)
    const days = parseInt(query.days as string) || 30
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get leads data
    const leads = await Lead.find({
      createdAt: { $gte: startDate }
    }).lean()

    // Get activities data
    const activities = await Activity.find({
      createdAt: { $gte: startDate }
    }).lean()

    // Calculate AI insights
    const insights = {
      // Lead Performance Metrics
      leadMetrics: {
        totalLeads: leads.length,
        newLeads: leads.filter(lead => lead.status === 'new').length,
        qualifiedLeads: leads.filter(lead => lead.status === 'qualified').length,
        convertedLeads: leads.filter(lead => lead.status === 'closed_won').length,
        conversionRate: leads.length > 0 ? 
          (leads.filter(lead => lead.status === 'closed_won').length / leads.length * 100).toFixed(1) : 0,
        averageLeadValue: leads.length > 0 ? 
          leads.reduce((sum, lead) => sum + (lead.value || 0), 0) / leads.length : 0,
        totalValue: leads.reduce((sum, lead) => sum + (lead.value || 0), 0)
      },

      // Activity Insights
      activityInsights: {
        totalActivities: activities.length,
        calls: activities.filter(activity => activity.type === 'call').length,
        emails: activities.filter(activity => activity.type === 'email').length,
        meetings: activities.filter(activity => activity.type === 'meeting').length,
        notes: activities.filter(activity => activity.type === 'note').length,
        averageActivitiesPerLead: leads.length > 0 ? 
          (activities.length / leads.length).toFixed(1) : 0
      },

      // AI-Powered Insights
      aiInsights: {
        topPerformingSources: aiHelpers.getTopPerformingSources(leads),
        leadQualityScore: aiHelpers.calculateLeadQualityScore(leads),
        followUpRecommendations: aiHelpers.generateFollowUpRecommendations(leads, activities),
        conversionPredictions: aiHelpers.generateConversionPredictions(leads),
        engagementTrends: aiHelpers.calculateEngagementTrends(activities, days),
        priorityLeads: aiHelpers.identifyPriorityLeads(leads, activities),
        salesVelocity: aiHelpers.calculateSalesVelocity(leads),
        churnRisk: aiHelpers.identifyChurnRisk(leads, activities)
      },

      // Performance Trends
      trends: {
        leadGrowth: aiHelpers.calculateLeadGrowth(leads, days),
        conversionTrends: aiHelpers.calculateConversionTrends(leads, days),
        activityTrends: aiHelpers.calculateActivityTrends(activities, days),
        revenueTrends: aiHelpers.calculateRevenueTrends(leads, days)
      },

      // Recommendations
      recommendations: aiHelpers.generateRecommendations(leads, activities, days)
    }

    return {
      success: true,
      data: insights
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
