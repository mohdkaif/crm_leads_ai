// AI Insights helper functions

export function getTopPerformingSources(leads: any[]) {
  const sourceCounts = leads.reduce((acc, lead) => {
    const source = lead.source || 'unknown'
    acc[source] = (acc[source] || 0) + 1
    return acc
  }, {})

  return Object.entries(sourceCounts)
    .map(([source, count]) => ({ source, count, percentage: (count as number / leads.length * 100).toFixed(1) }))
    .sort((a, b) => (b.count as number) - (a.count as number))
    .slice(0, 5)
}

export function calculateLeadQualityScore(leads: any[]) {
  if (leads.length === 0) return 0

  const scores = leads.map(lead => {
    let score = 0
    
    // Company size factor
    if (lead.company) score += 20
    
    // Job title factor
    if (lead.jobTitle) score += 15
    
    // Industry factor
    if (lead.industry) score += 10
    
    // Value factor
    if (lead.value && lead.value > 0) score += 25
    
    // Contact info factor
    if (lead.email) score += 15
    if (lead.phone) score += 15
    
    return Math.min(score, 100)
  })

  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
}

export function generateFollowUpRecommendations(leads: any[], activities: any[]) {
  const recommendations = []
  
  // Find leads without recent activities
  const leadsWithoutActivity = leads.filter(lead => {
    const recentActivities = activities.filter(activity => 
      activity.leadId?.toString() === lead._id.toString() &&
      new Date(activity.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    )
    return recentActivities.length === 0 && lead.status !== 'closed_won' && lead.status !== 'closed_lost'
  })

  leadsWithoutActivity.slice(0, 5).forEach(lead => {
    recommendations.push({
      leadId: lead._id,
      leadName: `${lead.firstName} ${lead.lastName}`,
      company: lead.company,
      priority: lead.priority,
      reason: 'No recent activity',
      suggestedAction: 'Schedule follow-up call',
      urgency: lead.priority === 'urgent' ? 'high' : 'medium'
    })
  })

  return recommendations
}

export function generateConversionPredictions(leads: any[]) {
  const activeLeads = leads.filter(lead => 
    !['closed_won', 'closed_lost'].includes(lead.status)
  )

  return activeLeads.map(lead => {
    let conversionProbability = 0
    
    // Base probability by status
    const statusProbabilities = {
      'new': 10,
      'contacted': 25,
      'qualified': 60,
      'proposal': 80,
      'negotiation': 90
    }
    
    conversionProbability = statusProbabilities[lead.status as keyof typeof statusProbabilities] || 10
    
    // Adjust based on lead value
    if (lead.value && lead.value > 10000) conversionProbability += 10
    if (lead.value && lead.value > 50000) conversionProbability += 15
    
    // Adjust based on priority
    if (lead.priority === 'urgent') conversionProbability += 15
    if (lead.priority === 'high') conversionProbability += 10
    
    return {
      leadId: lead._id,
      leadName: `${lead.firstName} ${lead.lastName}`,
      company: lead.company,
      currentStatus: lead.status,
      conversionProbability: Math.min(conversionProbability, 95),
      estimatedValue: lead.value || 0,
      confidence: conversionProbability > 70 ? 'high' : conversionProbability > 40 ? 'medium' : 'low'
    }
  }).sort((a, b) => b.conversionProbability - a.conversionProbability).slice(0, 10)
}

export function calculateEngagementTrends(activities: any[], days: number) {
  const trends = []
  const now = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    
    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)
    
    const dayActivities = activities.filter(activity => 
      new Date(activity.createdAt) >= date && new Date(activity.createdAt) < nextDate
    )
    
    trends.push({
      date: date.toISOString().split('T')[0],
      activities: dayActivities.length,
      calls: dayActivities.filter(a => a.type === 'call').length,
      emails: dayActivities.filter(a => a.type === 'email').length,
      meetings: dayActivities.filter(a => a.type === 'meeting').length
    })
  }
  
  return trends
}

export function identifyPriorityLeads(leads: any[], activities: any[]) {
  return leads
    .filter(lead => !['closed_won', 'closed_lost'].includes(lead.status))
    .map(lead => {
      const leadActivities = activities.filter(activity => 
        activity.leadId?.toString() === lead._id.toString()
      )
      
      let priorityScore = 0
      
      // Value factor
      if (lead.value && lead.value > 50000) priorityScore += 40
      else if (lead.value && lead.value > 10000) priorityScore += 25
      else if (lead.value && lead.value > 0) priorityScore += 10
      
      // Status factor
      if (lead.status === 'negotiation') priorityScore += 30
      else if (lead.status === 'proposal') priorityScore += 20
      else if (lead.status === 'qualified') priorityScore += 15
      
      // Activity factor
      if (leadActivities.length > 5) priorityScore += 15
      else if (leadActivities.length > 2) priorityScore += 10
      
      // Time factor
      const daysSinceCreated = Math.floor((new Date().getTime() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      if (daysSinceCreated > 30) priorityScore += 20
      else if (daysSinceCreated > 14) priorityScore += 10
      
      return {
        leadId: lead._id,
        leadName: `${lead.firstName} ${lead.lastName}`,
        company: lead.company,
        status: lead.status,
        priority: lead.priority,
        value: lead.value || 0,
        priorityScore: Math.min(priorityScore, 100),
        lastActivity: leadActivities.length > 0 ? 
          leadActivities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt : 
          lead.createdAt
      }
    })
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 10)
}

export function calculateSalesVelocity(leads: any[]) {
  const wonLeads = leads.filter(lead => lead.status === 'closed_won')
  
  if (wonLeads.length === 0) return { velocity: 0, averageDays: 0, totalValue: 0 }
  
  const totalDays = wonLeads.reduce((sum, lead) => {
    const days = Math.floor((new Date(lead.updatedAt).getTime() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    return sum + days
  }, 0)
  
  const averageDays = totalDays / wonLeads.length
  const totalValue = wonLeads.reduce((sum, lead) => sum + (lead.value || 0), 0)
  const velocity = totalValue / averageDays // Value per day
  
  return {
    velocity: Math.round(velocity),
    averageDays: Math.round(averageDays),
    totalValue,
    wonLeads: wonLeads.length
  }
}

export function identifyChurnRisk(leads: any[], activities: any[]) {
  const riskLeads = leads
    .filter(lead => !['closed_won', 'closed_lost'].includes(lead.status))
    .map(lead => {
      const leadActivities = activities.filter(activity => 
        activity.leadId?.toString() === lead._id.toString()
      )
      
      const lastActivity = leadActivities.length > 0 ? 
        leadActivities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt : 
        lead.createdAt
      
      const daysSinceActivity = Math.floor((new Date().getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24))
      
      let riskScore = 0
      
      // Time since last activity
      if (daysSinceActivity > 30) riskScore += 40
      else if (daysSinceActivity > 14) riskScore += 25
      else if (daysSinceActivity > 7) riskScore += 10
      
      // Lead age
      const daysSinceCreated = Math.floor((new Date().getTime() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      if (daysSinceCreated > 90) riskScore += 30
      else if (daysSinceCreated > 60) riskScore += 20
      else if (daysSinceCreated > 30) riskScore += 10
      
      // Status stagnation
      if (lead.status === 'new' && daysSinceCreated > 14) riskScore += 20
      if (lead.status === 'contacted' && daysSinceActivity > 7) riskScore += 15
      
      return {
        leadId: lead._id,
        leadName: `${lead.firstName} ${lead.lastName}`,
        company: lead.company,
        status: lead.status,
        riskScore: Math.min(riskScore, 100),
        daysSinceActivity,
        daysSinceCreated,
        lastActivity: lastActivity
      }
    })
    .filter(lead => lead.riskScore > 30)
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 10)
  
  return riskLeads
}

export function calculateLeadGrowth(leads: any[], days: number) {
  const trends = []
  const now = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    
    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)
    
    const dayLeads = leads.filter(lead => 
      new Date(lead.createdAt) >= date && new Date(lead.createdAt) < nextDate
    )
    
    trends.push({
      date: date.toISOString().split('T')[0],
      newLeads: dayLeads.length,
      qualified: dayLeads.filter(lead => lead.status === 'qualified').length,
      converted: dayLeads.filter(lead => lead.status === 'closed_won').length
    })
  }
  
  return trends
}

export function calculateConversionTrends(leads: any[], days: number) {
  const trends = []
  const now = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    
    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)
    
    const dayLeads = leads.filter(lead => 
      new Date(lead.createdAt) >= date && new Date(lead.createdAt) < nextDate
    )
    
    const conversionRate = dayLeads.length > 0 ? 
      (dayLeads.filter(lead => lead.status === 'closed_won').length / dayLeads.length * 100) : 0
    
    trends.push({
      date: date.toISOString().split('T')[0],
      conversionRate: Math.round(conversionRate * 10) / 10,
      totalLeads: dayLeads.length,
      converted: dayLeads.filter(lead => lead.status === 'closed_won').length
    })
  }
  
  return trends
}

export function calculateActivityTrends(activities: any[], days: number) {
  const trends = []
  const now = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    
    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)
    
    const dayActivities = activities.filter(activity => 
      new Date(activity.createdAt) >= date && new Date(activity.createdAt) < nextDate
    )
    
    trends.push({
      date: date.toISOString().split('T')[0],
      total: dayActivities.length,
      calls: dayActivities.filter(a => a.type === 'call').length,
      emails: dayActivities.filter(a => a.type === 'email').length,
      meetings: dayActivities.filter(a => a.type === 'meeting').length
    })
  }
  
  return trends
}

export function calculateRevenueTrends(leads: any[], days: number) {
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
      deals: dayLeads.length,
      averageDealSize: dayLeads.length > 0 ? revenue / dayLeads.length : 0
    })
  }
  
  return trends
}

export function generateRecommendations(leads: any[], activities: any[], days: number) {
  const recommendations = []
  
  // Lead quality recommendations
  const lowQualityLeads = leads.filter(lead => {
    let score = 0
    if (lead.company) score += 20
    if (lead.jobTitle) score += 15
    if (lead.industry) score += 10
    if (lead.value && lead.value > 0) score += 25
    if (lead.email) score += 15
    if (lead.phone) score += 15
    return score < 50
  })
  
  if (lowQualityLeads.length > 0) {
    recommendations.push({
      type: 'lead_quality',
      priority: 'medium',
      title: 'Improve Lead Quality',
      description: `${lowQualityLeads.length} leads have incomplete information`,
      action: 'Update lead profiles with missing company, job title, or contact details',
      impact: 'Higher conversion rates and better lead scoring'
    })
  }
  
  // Follow-up recommendations
  const staleLeads = leads.filter(lead => {
    const leadActivities = activities.filter(activity => 
      activity.leadId?.toString() === lead._id.toString()
    )
    const lastActivity = leadActivities.length > 0 ? 
      leadActivities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt : 
      lead.createdAt
    const daysSinceActivity = Math.floor((new Date().getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24))
    return daysSinceActivity > 7 && !['closed_won', 'closed_lost'].includes(lead.status)
  })
  
  if (staleLeads.length > 0) {
    recommendations.push({
      type: 'follow_up',
      priority: 'high',
      title: 'Follow Up on Stale Leads',
      description: `${staleLeads.length} leads haven't been contacted in over a week`,
      action: 'Schedule follow-up calls or send personalized emails',
      impact: 'Prevent lead loss and maintain engagement'
    })
  }
  
  // Activity recommendations
  const avgActivitiesPerLead = leads.length > 0 ? activities.length / leads.length : 0
  if (avgActivitiesPerLead < 2) {
    recommendations.push({
      type: 'activity',
      priority: 'medium',
      title: 'Increase Activity Levels',
      description: `Average ${avgActivitiesPerLead.toFixed(1)} activities per lead`,
      action: 'Schedule more calls, send follow-up emails, and track interactions',
      impact: 'Better lead nurturing and higher conversion rates'
    })
  }
  
  // Source optimization
  const sourcePerformance = getTopPerformingSources(leads)
  if (sourcePerformance.length > 0) {
    const topSource = sourcePerformance[0]
    recommendations.push({
      type: 'source_optimization',
      priority: 'low',
      title: 'Optimize Lead Sources',
      description: `${topSource.source} generates ${topSource.percentage}% of leads`,
      action: `Focus more resources on ${topSource.source} and analyze other sources`,
      impact: 'Better lead quality and higher conversion rates'
    })
  }
  
  return recommendations
}
