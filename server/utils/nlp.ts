import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

export interface IntentAnalysis {
  intent: 'interested' | 'not_interested' | 'need_info' | 'pricing_inquiry' | 'follow_up_needed' | 'unclear'
  confidence: number
  keywords: string[]
  entities: Array<{
    type: string
    value: string
    confidence: number
  }>
}

export interface SentimentAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative'
  confidence: number
  emotions: Array<{
    emotion: string
    score: number
  }>
}

export interface EmailAnalysis {
  intent: IntentAnalysis
  sentiment: SentimentAnalysis
  urgency: 'high' | 'medium' | 'low'
  actionRequired: boolean
  suggestedResponse?: string
  followUpNeeded: boolean
  followUpDelay?: number // in hours
}

// Intent detection keywords and patterns
const INTENT_PATTERNS = {
  interested: [
    'interested', 'yes', 'sounds good', 'definitely', 'absolutely', 'sure',
    'would like to', 'want to', 'love to', 'excited', 'great', 'amazing',
    'perfect', 'exactly what we need', 'this is what we\'re looking for'
  ],
  not_interested: [
    'not interested', 'no thanks', 'not right now', 'not for us', 'pass',
    'decline', 'not a good fit', 'not what we need', 'not relevant',
    'unsubscribe', 'remove me', 'stop', 'don\'t contact'
  ],
  need_info: [
    'tell me more', 'more information', 'details', 'how does it work',
    'what is', 'explain', 'can you explain', 'need to know more',
    'more details', 'information about', 'learn more'
  ],
  pricing_inquiry: [
    'price', 'cost', 'pricing', 'how much', 'fee', 'charge', 'rate',
    'budget', 'expensive', 'cheap', 'affordable', 'value', 'worth',
    'investment', 'roi', 'return on investment'
  ],
  follow_up_needed: [
    'call me', 'call back', 'follow up', 'get back to me', 'contact me',
    'reach out', 'touch base', 'check in', 'update me', 'let me know',
    'keep me posted', 'stay in touch'
  ]
}

// Sentiment analysis keywords
const SENTIMENT_PATTERNS = {
  positive: [
    'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome',
    'love', 'like', 'good', 'perfect', 'exactly', 'yes', 'definitely',
    'absolutely', 'sure', 'excited', 'happy', 'pleased', 'satisfied'
  ],
  negative: [
    'bad', 'terrible', 'awful', 'hate', 'dislike', 'no', 'not', 'never',
    'worst', 'horrible', 'disappointed', 'frustrated', 'angry', 'upset',
    'annoyed', 'irritated', 'unhappy', 'unsatisfied', 'displeased'
  ]
}

export class NLPAnalyzer {
  /**
   * Analyze email content for intent detection
   */
  static async analyzeIntent(content: string): Promise<IntentAnalysis> {
    try {
      // First try rule-based approach
      const ruleBasedResult = this.ruleBasedIntentAnalysis(content)
      
      // If confidence is high enough, return rule-based result
      if (ruleBasedResult.confidence > 0.8) {
        return ruleBasedResult
      }
      
      // Otherwise, use AI for more accurate analysis
      return await this.aiIntentAnalysis(content)
    } catch (error) {
      console.error('Intent analysis error:', error)
      return this.ruleBasedIntentAnalysis(content)
    }
  }

  /**
   * Analyze email content for sentiment
   */
  static async analyzeSentiment(content: string): Promise<SentimentAnalysis> {
    try {
      // First try rule-based approach
      const ruleBasedResult = this.ruleBasedSentimentAnalysis(content)
      
      // If confidence is high enough, return rule-based result
      if (ruleBasedResult.confidence > 0.8) {
        return ruleBasedResult
      }
      
      // Otherwise, use AI for more accurate analysis
      return await this.aiSentimentAnalysis(content)
    } catch (error) {
      console.error('Sentiment analysis error:', error)
      return this.ruleBasedSentimentAnalysis(content)
    }
  }

  /**
   * Complete email analysis
   */
  static async analyzeEmail(content: string, subject?: string): Promise<EmailAnalysis> {
    const fullContent = subject ? `${subject}\n\n${content}` : content
    
    const [intent, sentiment] = await Promise.all([
      this.analyzeIntent(fullContent),
      this.analyzeSentiment(fullContent)
    ])

    const urgency = this.determineUrgency(intent, sentiment, content)
    const actionRequired = this.determineActionRequired(intent, sentiment)
    const followUpNeeded = this.determineFollowUpNeeded(intent, sentiment)
    const followUpDelay = this.calculateFollowUpDelay(intent, urgency)

    return {
      intent,
      sentiment,
      urgency,
      actionRequired,
      followUpNeeded,
      followUpDelay,
      suggestedResponse: actionRequired ? await this.generateSuggestedResponse(intent, sentiment, content) : undefined
    }
  }

  /**
   * Rule-based intent analysis
   */
  private static ruleBasedIntentAnalysis(content: string): IntentAnalysis {
    const lowerContent = content.toLowerCase()
    const scores: Record<string, number> = {}
    
    // Calculate scores for each intent
    Object.entries(INTENT_PATTERNS).forEach(([intent, keywords]) => {
      scores[intent] = 0
      keywords.forEach(keyword => {
        if (lowerContent.includes(keyword)) {
          scores[intent] += 1
        }
      })
    })

    // Find the intent with highest score
    const maxScore = Math.max(...Object.values(scores))
    const maxIntent = Object.keys(scores).find(key => scores[key] === maxScore) || 'unclear'
    
    // Calculate confidence based on score and content length
    const confidence = maxScore > 0 ? Math.min(0.9, maxScore / (content.split(' ').length / 10)) : 0.1

    // Extract keywords
    const keywords = Object.entries(INTENT_PATTERNS[maxIntent] || [])
      .filter(([_, patternKeywords]) => 
        patternKeywords.some(keyword => lowerContent.includes(keyword))
      )
      .map(([_, patternKeywords]) => 
        patternKeywords.find(keyword => lowerContent.includes(keyword))
      )
      .filter(Boolean) as string[]

    return {
      intent: maxIntent as any,
      confidence,
      keywords,
      entities: []
    }
  }

  /**
   * Rule-based sentiment analysis
   */
  private static ruleBasedSentimentAnalysis(content: string): SentimentAnalysis {
    const lowerContent = content.toLowerCase()
    const positiveScore = SENTIMENT_PATTERNS.positive.reduce((score, keyword) => 
      score + (lowerContent.includes(keyword) ? 1 : 0), 0
    )
    const negativeScore = SENTIMENT_PATTERNS.negative.reduce((score, keyword) => 
      score + (lowerContent.includes(keyword) ? 1 : 0), 0
    )

    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral'
    let confidence = 0.5

    if (positiveScore > negativeScore) {
      sentiment = 'positive'
      confidence = Math.min(0.9, 0.5 + (positiveScore - negativeScore) * 0.1)
    } else if (negativeScore > positiveScore) {
      sentiment = 'negative'
      confidence = Math.min(0.9, 0.5 + (negativeScore - positiveScore) * 0.1)
    }

    return {
      sentiment,
      confidence,
      emotions: []
    }
  }

  /**
   * AI-powered intent analysis
   */
  private static async aiIntentAnalysis(content: string): Promise<IntentAnalysis> {
    const prompt = `Analyze the following email content and determine the sender's intent. 
    Classify as one of: interested, not_interested, need_info, pricing_inquiry, follow_up_needed, unclear
    
    Email content: "${content}"
    
    Respond with JSON format:
    {
      "intent": "one of the categories above",
      "confidence": 0.0-1.0,
      "keywords": ["list", "of", "key", "words"],
      "entities": [{"type": "entity_type", "value": "entity_value", "confidence": 0.0-1.0}]
    }`

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')
      return {
        intent: result.intent || 'unclear',
        confidence: result.confidence || 0.5,
        keywords: result.keywords || [],
        entities: result.entities || []
      }
    } catch (error) {
      console.error('AI intent analysis error:', error)
      return this.ruleBasedIntentAnalysis(content)
    }
  }

  /**
   * AI-powered sentiment analysis
   */
  private static async aiSentimentAnalysis(content: string): Promise<SentimentAnalysis> {
    const prompt = `Analyze the sentiment of the following email content.
    Classify as: positive, neutral, or negative
    
    Email content: "${content}"
    
    Respond with JSON format:
    {
      "sentiment": "positive/neutral/negative",
      "confidence": 0.0-1.0,
      "emotions": [{"emotion": "emotion_name", "score": 0.0-1.0}]
    }`

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 300
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')
      return {
        sentiment: result.sentiment || 'neutral',
        confidence: result.confidence || 0.5,
        emotions: result.emotions || []
      }
    } catch (error) {
      console.error('AI sentiment analysis error:', error)
      return this.ruleBasedSentimentAnalysis(content)
    }
  }

  /**
   * Determine urgency level
   */
  private static determineUrgency(intent: IntentAnalysis, sentiment: SentimentAnalysis, content: string): 'high' | 'medium' | 'low' {
    const urgentKeywords = ['urgent', 'asap', 'immediately', 'quickly', 'soon', 'deadline', 'time sensitive']
    const hasUrgentKeywords = urgentKeywords.some(keyword => content.toLowerCase().includes(keyword))
    
    if (hasUrgentKeywords || intent.intent === 'pricing_inquiry' || sentiment.sentiment === 'negative') {
      return 'high'
    }
    
    if (intent.intent === 'interested' || intent.intent === 'follow_up_needed') {
      return 'medium'
    }
    
    return 'low'
  }

  /**
   * Determine if action is required
   */
  private static determineActionRequired(intent: IntentAnalysis, sentiment: SentimentAnalysis): boolean {
    return intent.intent === 'interested' || 
           intent.intent === 'need_info' || 
           intent.intent === 'pricing_inquiry' ||
           intent.intent === 'follow_up_needed' ||
           sentiment.sentiment === 'negative'
  }

  /**
   * Determine if follow-up is needed
   */
  private static determineFollowUpNeeded(intent: IntentAnalysis, sentiment: SentimentAnalysis): boolean {
    return intent.intent === 'interested' || 
           intent.intent === 'need_info' || 
           intent.intent === 'pricing_inquiry' ||
           intent.intent === 'follow_up_needed'
  }

  /**
   * Calculate follow-up delay in hours
   */
  private static calculateFollowUpDelay(intent: IntentAnalysis, urgency: string): number {
    if (urgency === 'high') return 2 // 2 hours
    if (urgency === 'medium') return 24 // 24 hours
    return 72 // 72 hours
  }

  /**
   * Generate suggested response
   */
  private static async generateSuggestedResponse(intent: IntentAnalysis, sentiment: SentimentAnalysis, content: string): Promise<string> {
    const prompt = `Generate a professional email response for an event organizer outreach system.
    
    Original email: "${content}"
    Intent: ${intent.intent}
    Sentiment: ${sentiment.sentiment}
    
    Generate a helpful, professional response that addresses their intent and maintains engagement.
    Keep it concise and actionable.`

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 300
      })

      return response.choices[0].message.content || 'Thank you for your interest. We will get back to you soon.'
    } catch (error) {
      console.error('Response generation error:', error)
      return 'Thank you for your interest. We will get back to you soon.'
    }
  }
}

export default NLPAnalyzer
