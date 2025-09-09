interface LeadScoringFactors {
  emailQuality: number
  companySize: number
  industry: number
  source: number
  engagement: number
  responseTime: number
  budget: number
  timeline: number
}

interface SentimentAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative'
  confidence: number
  emotions: string[]
}

interface AIInsights {
  score: number
  sentiment: SentimentAnalysis
  engagement: 'high' | 'medium' | 'low'
  urgency: 'high' | 'medium' | 'low'
  recommendations: string[]
  nextActions: string[]
  riskFactors: string[]
}

export class AIService {
  private static instance: AIService

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  /**
   * Calculate AI lead score based on various factors
   */
  async calculateLeadScore(lead: any, activities: any[] = []): Promise<number> {
    const factors: LeadScoringFactors = {
      emailQuality: this.calculateEmailQuality(lead.email),
      companySize: this.calculateCompanySize(lead.company),
      industry: this.calculateIndustryScore(lead.industry),
      source: this.calculateSourceScore(lead.source),
      engagement: this.calculateEngagementScore(activities),
      responseTime: this.calculateResponseTime(activities),
      budget: this.calculateBudgetScore(lead.value),
      timeline: this.calculateTimelineScore(lead.expectedCloseDate)
    }

    // Weighted scoring
    const weights = {
      emailQuality: 0.15,
      companySize: 0.10,
      industry: 0.10,
      source: 0.10,
      engagement: 0.20,
      responseTime: 0.15,
      budget: 0.10,
      timeline: 0.10
    }

    let totalScore = 0
    for (const [factor, score] of Object.entries(factors)) {
      totalScore += score * weights[factor as keyof LeadScoringFactors]
    }

    return Math.round(Math.max(0, Math.min(100, totalScore)))
  }

  /**
   * Analyze sentiment from lead notes and activities
   */
  async analyzeSentiment(lead: any, activities: any[]): Promise<SentimentAnalysis> {
    const text = [
      lead.notes || '',
      ...activities.map(a => a.description || '')
    ].join(' ').toLowerCase()

    // Simple keyword-based sentiment analysis
    const positiveWords = [
      'interested', 'excited', 'great', 'excellent', 'perfect', 'love', 'amazing',
      'fantastic', 'wonderful', 'impressed', 'satisfied', 'happy', 'pleased'
    ]

    const negativeWords = [
      'not interested', 'not good', 'bad', 'terrible', 'awful', 'hate', 'disappointed',
      'frustrated', 'angry', 'upset', 'concerned', 'worried', 'unhappy'
    ]

    const positiveCount = positiveWords.reduce((count, word) => 
      count + (text.includes(word) ? 1 : 0), 0
    )

    const negativeCount = negativeWords.reduce((count, word) => 
      count + (text.includes(word) ? 1 : 0), 0
    )

    let sentiment: 'positive' | 'neutral' | 'negative'
    let confidence: number

    if (positiveCount > negativeCount) {
      sentiment = 'positive'
      confidence = Math.min(0.9, 0.5 + (positiveCount - negativeCount) * 0.1)
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative'
      confidence = Math.min(0.9, 0.5 + (negativeCount - positiveCount) * 0.1)
    } else {
      sentiment = 'neutral'
      confidence = 0.5
    }

    // Extract emotions
    const emotions: string[] = []
    if (text.includes('excited') || text.includes('thrilled')) emotions.push('excitement')
    if (text.includes('concerned') || text.includes('worried')) emotions.push('concern')
    if (text.includes('frustrated') || text.includes('annoyed')) emotions.push('frustration')
    if (text.includes('satisfied') || text.includes('pleased')) emotions.push('satisfaction')

    return {
      sentiment,
      confidence,
      emotions
    }
  }

  /**
   * Generate AI insights for a lead
   */
  async generateInsights(lead: any, activities: any[] = []): Promise<AIInsights> {
    const score = await this.calculateLeadScore(lead, activities)
    const sentiment = await this.analyzeSentiment(lead, activities)
    
    // Calculate engagement level
    const activityCount = activities.length
    const recentActivity = activities.filter(a => 
      new Date(a.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length

    let engagement: 'high' | 'medium' | 'low'
    if (activityCount >= 5 && recentActivity >= 2) {
      engagement = 'high'
    } else if (activityCount >= 2 || recentActivity >= 1) {
      engagement = 'medium'
    } else {
      engagement = 'low'
    }

    // Calculate urgency
    let urgency: 'high' | 'medium' | 'low' = 'medium'
    if (lead.priority === 'urgent' || lead.priority === 'high') {
      urgency = 'high'
    } else if (lead.priority === 'low') {
      urgency = 'low'
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(lead, activities, score, sentiment, engagement)
    
    // Generate next actions
    const nextActions = this.generateNextActions(lead, activities, score, sentiment, engagement)
    
    // Identify risk factors
    const riskFactors = this.identifyRiskFactors(lead, activities, score, sentiment)

    return {
      score,
      sentiment,
      engagement,
      urgency,
      recommendations,
      nextActions,
      riskFactors
    }
  }

  private calculateEmailQuality(email: string): number {
    if (!email) return 0
    
    const domain = email.split('@')[1]?.toLowerCase()
    if (!domain) return 0

    // Corporate email domains get higher scores
    const corporateDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']
    if (corporateDomains.includes(domain)) return 30

    // Company domains get higher scores
    return 80
  }

  private calculateCompanySize(company: string): number {
    if (!company) return 0

    const companyLower = company.toLowerCase()
    
    // Large companies
    if (companyLower.includes('inc') || companyLower.includes('corp') || 
        companyLower.includes('ltd') || companyLower.includes('llc')) {
      return 80
    }

    // Medium companies
    if (companyLower.includes('group') || companyLower.includes('solutions') ||
        companyLower.includes('systems') || companyLower.includes('services')) {
      return 60
    }

    return 40
  }

  private calculateIndustryScore(industry: string): number {
    if (!industry) return 50

    const industryLower = industry.toLowerCase()
    
    // High-value industries
    const highValueIndustries = ['technology', 'finance', 'healthcare', 'manufacturing']
    if (highValueIndustries.some(ind => industryLower.includes(ind))) {
      return 80
    }

    // Medium-value industries
    const mediumValueIndustries = ['retail', 'education', 'consulting', 'real estate']
    if (mediumValueIndustries.some(ind => industryLower.includes(ind))) {
      return 60
    }

    return 40
  }

  private calculateSourceScore(source: string): number {
    const sourceScores: Record<string, number> = {
      'referral': 90,
      'website': 70,
      'social_media': 60,
      'email': 50,
      'event': 80,
      'cold_call': 30,
      'other': 40
    }

    return sourceScores[source] || 40
  }

  private calculateEngagementScore(activities: any[]): number {
    if (activities.length === 0) return 0

    const recentActivities = activities.filter(a => 
      new Date(a.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    )

    const score = Math.min(100, activities.length * 10 + recentActivities.length * 5)
    return score
  }

  private calculateResponseTime(activities: any[]): number {
    if (activities.length < 2) return 50

    const responseActivities = activities
      .filter(a => a.type === 'email' || a.type === 'call')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

    if (responseActivities.length < 2) return 50

    let totalResponseTime = 0
    let responseCount = 0

    for (let i = 1; i < responseActivities.length; i++) {
      const timeDiff = new Date(responseActivities[i].createdAt).getTime() - 
                      new Date(responseActivities[i - 1].createdAt).getTime()
      const hours = timeDiff / (1000 * 60 * 60)
      
      if (hours <= 24) { // Within 24 hours
        totalResponseTime += hours
        responseCount++
      }
    }

    if (responseCount === 0) return 50

    const avgResponseTime = totalResponseTime / responseCount
    return Math.max(0, 100 - avgResponseTime * 2) // Lower response time = higher score
  }

  private calculateBudgetScore(value: number): number {
    if (!value || value <= 0) return 0

    if (value >= 100000) return 100
    if (value >= 50000) return 80
    if (value >= 10000) return 60
    if (value >= 1000) return 40
    return 20
  }

  private calculateTimelineScore(expectedCloseDate: Date): number {
    if (!expectedCloseDate) return 50

    const now = new Date()
    const daysUntilClose = Math.ceil((expectedCloseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilClose < 0) return 0 // Past due
    if (daysUntilClose <= 30) return 90 // Within 30 days
    if (daysUntilClose <= 90) return 70 // Within 90 days
    if (daysUntilClose <= 180) return 50 // Within 6 months
    return 30 // More than 6 months
  }

  private generateRecommendations(lead: any, activities: any[], score: number, sentiment: SentimentAnalysis, engagement: string): string[] {
    const recommendations: string[] = []

    if (score < 30) {
      recommendations.push('Consider qualifying this lead further before investing more time')
      recommendations.push('Focus on understanding their budget and timeline')
    }

    if (sentiment.sentiment === 'negative') {
      recommendations.push('Address concerns mentioned in previous interactions')
      recommendations.push('Consider offering additional value or incentives')
    }

    if (engagement === 'low') {
      recommendations.push('Increase engagement with more frequent follow-ups')
      recommendations.push('Try different communication channels (phone, email, social media)')
    }

    if (lead.priority === 'urgent' && activities.length < 3) {
      recommendations.push('Prioritize immediate follow-up for this urgent lead')
    }

    if (lead.source === 'cold_call' && activities.length === 0) {
      recommendations.push('Schedule a follow-up call within 24-48 hours')
    }

    if (lead.expectedCloseDate && new Date(lead.expectedCloseDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) {
      recommendations.push('Accelerate the sales process - close date is approaching')
    }

    return recommendations
  }

  private generateNextActions(lead: any, activities: any[], score: number, sentiment: SentimentAnalysis, engagement: string): string[] {
    const actions: string[] = []

    const lastActivity = activities[0]
    const daysSinceLastActivity = lastActivity ? 
      Math.ceil((new Date().getTime() - new Date(lastActivity.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 999

    if (daysSinceLastActivity > 7) {
      actions.push('Schedule immediate follow-up call or email')
    }

    if (lead.status === 'new' && activities.length === 0) {
      actions.push('Make initial contact within 24 hours')
    }

    if (lead.status === 'contacted' && score > 70) {
      actions.push('Send detailed proposal or demo')
    }

    if (lead.status === 'qualified' && engagement === 'high') {
      actions.push('Schedule product demonstration')
    }

    if (sentiment.sentiment === 'positive' && lead.status !== 'closed_won') {
      actions.push('Move to next stage in sales process')
    }

    return actions
  }

  private identifyRiskFactors(lead: any, activities: any[], score: number, sentiment: SentimentAnalysis): string[] {
    const risks: string[] = []

    if (score < 20) {
      risks.push('Low lead score indicates poor qualification')
    }

    if (sentiment.sentiment === 'negative') {
      risks.push('Negative sentiment detected in communications')
    }

    if (lead.expectedCloseDate && new Date(lead.expectedCloseDate) < new Date()) {
      risks.push('Expected close date has passed')
    }

    if (activities.length === 0 && lead.status !== 'new') {
      risks.push('No recent activity recorded')
    }

    if (lead.priority === 'urgent' && activities.length < 2) {
      risks.push('Urgent lead with insufficient follow-up')
    }

    return risks
  }
}

export const aiService = AIService.getInstance()
