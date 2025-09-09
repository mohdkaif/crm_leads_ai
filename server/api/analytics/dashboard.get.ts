import connectDB from '../../utils/mongodb'
import Analytics from '../../models/Analytics'
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

    // Get current date range (last 30 days)
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)

    // Get leads data
    const leads = await Lead.find({ 
      $or: [
        { assignedTo: userId },
        { createdBy: userId }
      ]
    })
    const recentLeads = await Lead.find({ 
      $or: [
        { assignedTo: userId },
        { createdBy: userId }
      ],
      createdAt: { $gte: startDate, $lte: endDate } 
    })

    // Get activities data
    const activities = await Activity.find({ 
      $or: [
        { createdBy: userId },
        { assignedTo: userId }
      ]
    })
    const recentActivities = await Activity.find({ 
      $or: [
        { createdBy: userId },
        { assignedTo: userId }
      ],
      createdAt: { $gte: startDate, $lte: endDate } 
    })

    // Calculate metrics
    const totalLeads = leads.length
    const newLeads = recentLeads.length
    const convertedLeads = leads.filter(lead => lead.status === 'converted').length
    const totalValue = leads.reduce((sum, lead) => sum + (lead.value || 0), 0)
    const averageDealSize = totalLeads > 0 ? totalValue / totalLeads : 0
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0
    const activitiesCompleted = activities.filter(activity => activity.status === 'completed').length
    const followUpsScheduled = activities.filter(activity => activity.type === 'follow_up').length

    // Lead sources breakdown
    const sourceBreakdown = {}
    leads.forEach(lead => {
      const source = lead.source || 'unknown'
      if (!sourceBreakdown[source]) {
        sourceBreakdown[source] = { count: 0, value: 0 }
      }
      sourceBreakdown[source].count++
      sourceBreakdown[source].value += lead.value || 0
    })

    const leadSources = Object.entries(sourceBreakdown).map(([source, data]) => ({
      source,
      count: data.count,
      value: data.value
    }))

    // Lead status breakdown
    const statusBreakdown = {}
    leads.forEach(lead => {
      const status = lead.status || 'new'
      statusBreakdown[status] = (statusBreakdown[status] || 0) + 1
    })

    const leadStatuses = Object.entries(statusBreakdown).map(([status, count]) => ({
      status,
      count
    }))

    // Monthly trends (last 6 months)
    const monthlyTrends = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      
      const monthLeads = await Lead.find({
        userId,
        createdAt: { $gte: monthStart, $lte: monthEnd }
      })
      
      const monthConversions = monthLeads.filter(lead => lead.status === 'converted').length
      const monthValue = monthLeads.reduce((sum, lead) => sum + (lead.value || 0), 0)
      
      monthlyTrends.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        leads: monthLeads.length,
        conversions: monthConversions,
        value: monthValue
      })
    }

    // Recent activities
    const recentActivitiesList = await Activity.find({ userId })
      .populate('leadId', 'firstName lastName company')
      .sort({ createdAt: -1 })
      .limit(10)

    return {
      success: true,
      data: {
        metrics: {
          totalLeads,
          newLeads,
          convertedLeads,
          totalValue,
          averageDealSize,
          conversionRate,
          activitiesCompleted,
          followUpsScheduled
        },
        leadSources,
        leadStatuses,
        monthlyTrends,
        recentActivities: recentActivitiesList
      }
    }
  } catch (error) {
    console.error('Analytics error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})