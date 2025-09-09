import connectDB from '../../utils/mongodb'
import EventOrganizer from '../../models/EventOrganizer'
import NLPAnalyzer from '../../utils/nlp'

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

    const body = await readBody(event)
    const { organizerId, emailContent, subject, direction = 'inbound' } = body

    if (!organizerId || !emailContent) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Organizer ID and email content are required'
      })
    }

    // Get the organizer
    const organizer = await EventOrganizer.findById(organizerId)
    if (!organizer) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Event organizer not found'
      })
    }

    // Check if user has access to this organizer
    if (organizer.assignedTo.toString() !== userId && organizer.createdBy.toString() !== userId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied'
      })
    }

    // Analyze the email content
    const analysis = await NLPAnalyzer.analyzeEmail(emailContent, subject)

    // Update organizer with analysis results
    organizer.intent = analysis.intent.intent
    organizer.sentiment = analysis.sentiment.sentiment
    organizer.confidence = analysis.intent.confidence

    // Update AI insights
    organizer.aiInsights = {
      engagementLevel: analysis.urgency === 'high' ? 'high' : analysis.urgency === 'medium' ? 'medium' : 'low',
      urgencyLevel: analysis.urgency,
      conversionProbability: analysis.intent.intent === 'interested' ? 80 : 
                           analysis.intent.intent === 'need_info' ? 60 :
                           analysis.intent.intent === 'pricing_inquiry' ? 70 : 20,
      recommendedActions: analysis.actionRequired ? ['Respond immediately', 'Schedule follow-up'] : ['Monitor engagement'],
      keyTopics: analysis.intent.keywords,
      painPoints: analysis.sentiment.sentiment === 'negative' ? ['Dissatisfaction detected'] : []
    }

    // Update engagement score
    organizer.updateEngagementScore()

    // Add email to thread history
    const threadId = `${organizerId}_${Date.now()}`
    organizer.emailThreads.push({
      threadId,
      subject: subject || 'No subject',
      direction,
      content: emailContent,
      timestamp: new Date(),
      sentiment: analysis.sentiment.sentiment,
      intent: analysis.intent.intent,
      keywords: analysis.intent.keywords
    })

    // Update email counts
    if (direction === 'outbound') {
      organizer.totalEmailsSent += 1
    } else {
      organizer.totalRepliesReceived += 1
    }

    // Update last contact date
    organizer.lastContactDate = new Date()

    // Set next follow-up date if needed
    if (analysis.followUpNeeded && analysis.followUpDelay) {
      const followUpDate = new Date()
      followUpDate.setHours(followUpDate.getHours() + analysis.followUpDelay)
      organizer.nextFollowUpDate = followUpDate
    }

    // Update status based on intent
    if (analysis.intent.intent === 'interested') {
      organizer.status = 'interested'
      organizer.priority = 'high'
    } else if (analysis.intent.intent === 'not_interested') {
      organizer.status = 'not_interested'
      organizer.priority = 'low'
    } else if (analysis.intent.intent === 'need_info' || analysis.intent.intent === 'pricing_inquiry') {
      organizer.status = 'contacted'
      organizer.priority = 'high'
    }

    await organizer.save()

    return {
      success: true,
      data: {
        analysis,
        organizer: {
          _id: organizer._id,
          intent: organizer.intent,
          sentiment: organizer.sentiment,
          confidence: organizer.confidence,
          engagementScore: organizer.engagementScore,
          aiInsights: organizer.aiInsights,
          nextFollowUpDate: organizer.nextFollowUpDate,
          status: organizer.status,
          priority: organizer.priority
        }
      },
      message: 'Email analyzed successfully'
    }
  } catch (error) {
    console.error('Analyze email error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
