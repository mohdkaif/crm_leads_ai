import mongoose, { Document, Schema } from 'mongoose'

export interface IEventOrganizer extends Document {
  _id: string
  // Basic Information
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  jobTitle?: string
  website?: string
  
  // Event Information
  eventName?: string
  eventType?: 'conference' | 'workshop' | 'seminar' | 'exhibition' | 'networking' | 'other'
  eventDate?: Date
  eventLocation?: string
  expectedAttendees?: number
  eventWebsite?: string
  
  // Lead Status
  status: 'new' | 'contacted' | 'interested' | 'not_interested' | 'qualified' | 'converted' | 'lost'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  source: 'email_outreach' | 'referral' | 'website' | 'social_media' | 'event' | 'other'
  
  // Engagement Data
  engagementScore: number
  lastContactDate?: Date
  nextFollowUpDate?: Date
  totalEmailsSent: number
  totalRepliesReceived: number
  responseRate: number
  
  // Intent Analysis
  intent: 'interested' | 'not_interested' | 'need_info' | 'pricing_inquiry' | 'follow_up_needed' | 'unclear'
  sentiment: 'positive' | 'neutral' | 'negative'
  confidence: number
  
  // AI Analysis
  aiScore: number
  aiInsights?: {
    engagementLevel: 'high' | 'medium' | 'low'
    urgencyLevel: 'high' | 'medium' | 'low'
    conversionProbability: number
    recommendedActions: string[]
    keyTopics: string[]
    painPoints: string[]
  }
  
  // Communication History
  emailThreads: Array<{
    threadId: string
    subject: string
    direction: 'outbound' | 'inbound'
    content: string
    timestamp: Date
    sentiment?: 'positive' | 'neutral' | 'negative'
    intent?: string
    keywords: string[]
  }>
  
  // Conversion Tracking
  conversionData?: {
    signupLink?: string
    signupDate?: Date
    meetingScheduled?: Date
    meetingCompleted?: Date
    conversionValue?: number
    conversionSource: string
  }
  
  // Assignment
  assignedTo: mongoose.Types.ObjectId
  createdBy: mongoose.Types.ObjectId
  
  // Metadata
  tags: string[]
  notes: string
  customFields: Record<string, any>
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}

const EventOrganizerSchema = new Schema<IEventOrganizer>({
  // Basic Information
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  jobTitle: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  
  // Event Information
  eventName: {
    type: String,
    trim: true
  },
  eventType: {
    type: String,
    enum: ['conference', 'workshop', 'seminar', 'exhibition', 'networking', 'other'],
    default: 'other'
  },
  eventDate: {
    type: Date
  },
  eventLocation: {
    type: String,
    trim: true
  },
  expectedAttendees: {
    type: Number,
    min: 0
  },
  eventWebsite: {
    type: String,
    trim: true
  },
  
  // Lead Status
  status: {
    type: String,
    enum: ['new', 'contacted', 'interested', 'not_interested', 'qualified', 'converted', 'lost'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  source: {
    type: String,
    enum: ['email_outreach', 'referral', 'website', 'social_media', 'event', 'other'],
    default: 'email_outreach'
  },
  
  // Engagement Data
  engagementScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  lastContactDate: {
    type: Date
  },
  nextFollowUpDate: {
    type: Date
  },
  totalEmailsSent: {
    type: Number,
    default: 0,
    min: 0
  },
  totalRepliesReceived: {
    type: Number,
    default: 0,
    min: 0
  },
  responseRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Intent Analysis
  intent: {
    type: String,
    enum: ['interested', 'not_interested', 'need_info', 'pricing_inquiry', 'follow_up_needed', 'unclear'],
    default: 'unclear'
  },
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    default: 'neutral'
  },
  confidence: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // AI Analysis
  aiScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  aiInsights: {
    engagementLevel: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    },
    urgencyLevel: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    },
    conversionProbability: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    recommendedActions: [String],
    keyTopics: [String],
    painPoints: [String]
  },
  
  // Communication History
  emailThreads: [{
    threadId: {
      type: String,
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    direction: {
      type: String,
      enum: ['outbound', 'inbound'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative']
    },
    intent: String,
    keywords: [String]
  }],
  
  // Conversion Tracking
  conversionData: {
    signupLink: String,
    signupDate: Date,
    meetingScheduled: Date,
    meetingCompleted: Date,
    conversionValue: Number,
    conversionSource: String
  },
  
  // Assignment
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Metadata
  tags: [String],
  notes: String,
  customFields: {
    type: Map,
    of: Schema.Types.Mixed
  }
}, {
  timestamps: true
})

// Indexes for performance
// Note: email index is automatically created by unique: true
EventOrganizerSchema.index({ status: 1 })
EventOrganizerSchema.index({ priority: 1 })
EventOrganizerSchema.index({ assignedTo: 1 })
EventOrganizerSchema.index({ createdAt: -1 })
EventOrganizerSchema.index({ nextFollowUpDate: 1 })
EventOrganizerSchema.index({ engagementScore: -1 })
EventOrganizerSchema.index({ aiScore: -1 })

// Virtual for full name
EventOrganizerSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`
})

// Method to update engagement score
EventOrganizerSchema.methods.updateEngagementScore = function() {
  const emailCount = this.totalEmailsSent
  const replyCount = this.totalRepliesReceived
  const responseRate = emailCount > 0 ? (replyCount / emailCount) * 100 : 0
  
  this.responseRate = responseRate
  
  // Calculate engagement score based on multiple factors
  let score = 0
  
  // Response rate factor (40% weight)
  score += (responseRate / 100) * 40
  
  // Recent activity factor (30% weight)
  const daysSinceLastContact = this.lastContactDate ? 
    (Date.now() - this.lastContactDate.getTime()) / (1000 * 60 * 60 * 24) : 30
  score += Math.max(0, (30 - daysSinceLastContact) / 30) * 30
  
  // Intent factor (20% weight)
  const intentScores = {
    'interested': 100,
    'need_info': 80,
    'pricing_inquiry': 70,
    'follow_up_needed': 60,
    'unclear': 30,
    'not_interested': 0
  }
  score += (intentScores[this.intent] || 0) * 0.2
  
  // Sentiment factor (10% weight)
  const sentimentScores = {
    'positive': 100,
    'neutral': 50,
    'negative': 0
  }
  score += (sentimentScores[this.sentiment] || 0) * 0.1
  
  this.engagementScore = Math.round(Math.min(100, Math.max(0, score)))
  return this.engagementScore
}

export default mongoose.models.EventOrganizer || mongoose.model<IEventOrganizer>('EventOrganizer', EventOrganizerSchema)
