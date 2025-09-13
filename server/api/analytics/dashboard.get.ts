import connectDB from '../../utils/mongodb'
import Lead from '../../models/Lead'
import Activity from '../../models/Activity'
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

    // Get date range (default to last 30 days)
    const query = getQuery(event)
    const days = parseInt(query.days as string) || 30
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get all data
    const [leads, activities, users] = await Promise.all([
      Lead.find({ createdAt: { $gte: startDate } }).lean(),
      Activity.find({ createdAt: { $gte: startDate } }).lean(),
      User.find({ status: 'active' }).lean()
    ])

    // Calculate analytics
    const analytics = {
      // Overview Metrics
      overview: {
        totalLeads: leads.length,
        totalActivities: activities.length,
        activeUsers: users.length,
        totalRevenue: leads
          .filter(lead => lead.status === 'closed_won')
          .reduce((sum, lead) => sum + (lead.value || 0), 0),
        conversionRate: leads.length > 0 ? 
          (leads.filter(lead => lead.status === 'closed_won').length / leads.length * 100).toFixed(1) : 0,
        averageDealSize: leads.filter(lead => lead.status === 'closed_won').length > 0 ?
          leads.filter(lead => lead.status === 'closed_won')
            .reduce((sum, lead) => sum + (lead.value || 0), 0) / 
          leads.filter(lead => lead.status === 'closed_won').length : 0
      },

      // Lead Status Distribution
      leadStatusDistribution: {
        new: leads.filter(lead => lead.status === 'new').length,
        contacted: leads.filter(lead => lead.status === 'contacted').length,
        qualified: leads.filter(lead => lead.status === 'qualified').length,
        proposal: leads.filter(lead => lead.status === 'proposal').length,
        negotiation: leads.filter(lead => lead.status === 'negotiation').length,
        closed_won: leads.filter(lead => lead.status === 'closed_won').length,
        closed_lost: leads.filter(lead => lead.status === 'closed_lost').length
      },

      // Lead Priority Distribution
      leadPriorityDistribution: {
        low: leads.filter(lead => lead.priority === 'low').length,
        medium: leads.filter(lead => lead.priority === 'medium').length,
        high: leads.filter(lead => lead.priority === 'high').length,
        urgent: leads.filter(lead => lead.priority === 'urgent').length
      },

      // Source Performance
      sourcePerformance: getSourcePerformance(leads),

      // Activity Breakdown
      activityBreakdown: {
        calls: activities.filter(activity => activity.type === 'call').length,
        emails: activities.filter(activity => activity.type === 'email').length,
        meetings: activities.filter(activity => activity.type === 'meeting').length,
        notes: activities.filter(activity => activity.type === 'note').length
      },

      // User Performance
      userPerformance: getUserPerformance(leads, activities, users),

      // Time-based Trends
      trends: {
        dailyLeads: getDailyTrends(leads, days, 'createdAt'),
        dailyActivities: getDailyTrends(activities, days, 'createdAt'),
        dailyRevenue: getDailyRevenueTrends(leads, days),
        weeklyConversion: getWeeklyConversionTrends(leads, days)
      },

      // Top Performers
      topPerformers: {
        topLeads: getTopLeads(leads),
        topSources: getTopSources(leads),
        topUsers: getTopUsers(leads, activities, users)
      },

      // Pipeline Health
      pipelineHealth: {
        pipelineValue: calculatePipelineValue(leads),
        averageDealCycle: calculateAverageDealCycle(leads),
        winRate: calculateWinRate(leads),
        lossRate: calculateLossRate(leads)
      }
    }

    return {
      success: true,
      data: analytics
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})

// Helper functions
function getSourcePerformance(leads: any[]) {
  const sourceStats = leads.reduce((acc, lead) => {
    const source = lead.source || 'unknown'
    if (!acc[source]) {
      acc[source] = {
        total: 0,
        converted: 0,
        value: 0
      }
    }
    acc[source].total++
    if (lead.status === 'closed_won') {
      acc[source].converted++
      acc[source].value += lead.value || 0
    }
    return acc
  }, {})

  return Object.entries(sourceStats).map(([source, stats]: [string, any]) => ({
    source,
    total: stats.total,
    converted: stats.converted,
    conversionRate: ((stats.converted / stats.total) * 100).toFixed(1),
    totalValue: stats.value,
    averageValue: stats.converted > 0 ? (stats.value / stats.converted).toFixed(2) : 0
  })).sort((a, b) => b.total - a.total)
}

function getUserPerformance(leads: any[], activities: any[], users: any[]) {
  return users.map(user => {
    const userLeads = leads.filter(lead => lead.assignedTo === user.email)
    const userActivities = activities.filter(activity => activity.userId === user._id.toString())
    const convertedLeads = userLeads.filter(lead => lead.status === 'closed_won')
    const totalValue = convertedLeads.reduce((sum, lead) => sum + (lead.value || 0), 0)

    return {
      userId: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      totalLeads: userLeads.length,
      convertedLeads: convertedLeads.length,
      conversionRate: userLeads.length > 0 ? 
        ((convertedLeads.length / userLeads.length) * 100).toFixed(1) : 0,
      totalValue,
      averageDealSize: convertedLeads.length > 0 ? 
        (totalValue / convertedLeads.length).toFixed(2) : 0,
      totalActivities: userActivities.length,
      activitiesPerLead: userLeads.length > 0 ? 
        (userActivities.length / userLeads.length).toFixed(1) : 0
    }
  }).sort((a, b) => b.totalValue - a.totalValue)
}

function getDailyTrends(data: any[], days: number, dateField: string) {
  const trends = []
  const now = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    
    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)
    
    const dayData = data.filter(item => {
      const itemDate = new Date(item[dateField])
      return itemDate >= date && itemDate < nextDate
    })
    
    trends.push({
      date: date.toISOString().split('T')[0],
      count: dayData.length
    })
  }
  
  return trends
}

function getDailyRevenueTrends(leads: any[], days: number) {
  const trends = []
  const now = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    
    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)
    
    const dayLeads = leads.filter(lead => 
      lead.status === 'closed_won' &&
      new Date(lead.updatedAt) >= date && new Date(lead.updatedAt) < nextDate
    )
    
    const revenue = dayLeads.reduce((sum, lead) => sum + (lead.value || 0), 0)
    
    trends.push({
      date: date.toISOString().split('T')[0],
      revenue,
      deals: dayLeads.length
    })
  }
  
  return trends
}

function getWeeklyConversionTrends(leads: any[], days: number) {
  const trends = []
  const now = new Date()
  const weeks = Math.ceil(days / 7)
  
  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(now)
    weekStart.setDate(weekStart.getDate() - (i + 1) * 7)
    weekStart.setHours(0, 0, 0, 0)
    
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)
    
    const weekLeads = leads.filter(lead => {
      const leadDate = new Date(lead.createdAt)
      return leadDate >= weekStart && leadDate < weekEnd
    })
    
    const converted = weekLeads.filter(lead => lead.status === 'closed_won').length
    const conversionRate = weekLeads.length > 0 ? 
      ((converted / weekLeads.length) * 100).toFixed(1) : 0
    
    trends.push({
      week: `Week ${weeks - i}`,
      startDate: weekStart.toISOString().split('T')[0],
      endDate: weekEnd.toISOString().split('T')[0],
      totalLeads: weekLeads.length,
      converted,
      conversionRate: parseFloat(conversionRate)
    })
  }
  
  return trends
}

function getTopLeads(leads: any[]) {
  return leads
    .filter(lead => lead.value && lead.value > 0)
    .sort((a, b) => (b.value || 0) - (a.value || 0))
    .slice(0, 10)
    .map(lead => ({
      id: lead._id,
      name: `${lead.firstName} ${lead.lastName}`,
      company: lead.company,
      value: lead.value,
      status: lead.status,
      priority: lead.priority,
      source: lead.source,
      createdAt: lead.createdAt
    }))
}

function getTopSources(leads: any[]) {
  const sourceCounts = leads.reduce((acc, lead) => {
    const source = lead.source || 'unknown'
    acc[source] = (acc[source] || 0) + 1
    return acc
  }, {})

  return Object.entries(sourceCounts)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => (b.count as number) - (a.count as number))
    .slice(0, 5)
}

function getTopUsers(leads: any[], activities: any[], users: any[]) {
  return users.map(user => {
    const userLeads = leads.filter(lead => lead.assignedTo === user.email)
    const convertedLeads = userLeads.filter(lead => lead.status === 'closed_won')
    const totalValue = convertedLeads.reduce((sum, lead) => sum + (lead.value || 0), 0)

    return {
      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      totalLeads: userLeads.length,
      convertedLeads: convertedLeads.length,
      totalValue,
      conversionRate: userLeads.length > 0 ? 
        ((convertedLeads.length / userLeads.length) * 100).toFixed(1) : 0
    }
  })
  .sort((a, b) => b.totalValue - a.totalValue)
  .slice(0, 5)
}

function calculatePipelineValue(leads: any[]) {
  const activeLeads = leads.filter(lead => 
    !['closed_won', 'closed_lost'].includes(lead.status)
  )
  
  return activeLeads.reduce((sum, lead) => sum + (lead.value || 0), 0)
}

function calculateAverageDealCycle(leads: any[]) {
  const wonLeads = leads.filter(lead => lead.status === 'closed_won')
  
  if (wonLeads.length === 0) return 0
  
  const totalDays = wonLeads.reduce((sum, lead) => {
    const days = Math.floor((new Date(lead.updatedAt).getTime() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    return sum + days
  }, 0)
  
  return Math.round(totalDays / wonLeads.length)
}

function calculateWinRate(leads: any[]) {
  const totalLeads = leads.length
  const wonLeads = leads.filter(lead => lead.status === 'closed_won').length
  
  return totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : 0
}

function calculateLossRate(leads: any[]) {
  const totalLeads = leads.length
  const lostLeads = leads.filter(lead => lead.status === 'closed_lost').length
  
  return totalLeads > 0 ? ((lostLeads / totalLeads) * 100).toFixed(1) : 0
}