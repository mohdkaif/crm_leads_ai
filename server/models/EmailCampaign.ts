import mongoose, { Document, Schema } from 'mongoose'

export interface IEmailCampaign extends Document {
  _id: string
  name: string
  description?: string
  
  // Campaign Configuration
  subject: string
  template: string
  personalizationFields: string[]
  
  // Targeting
  targetCriteria: {
    eventTypes?: string[]
    companySizes?: string[]
    locations?: string[]
    industries?: string[]
    customFilters?: Record<string, any>
  }
  
  // Scheduling
  scheduledAt?: Date
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled'
  
  // Performance Metrics
  metrics: {
    totalSent: number
    totalDelivered: number
    totalOpened: number
    totalReplied: number
    totalClicked: number
    openRate: number
    replyRate: number
    clickRate: number
    conversionRate: number
  }
  
  // AI Configuration
  aiSettings: {
    usePersonalization: boolean
    useSentimentAnalysis: boolean
    useIntentDetection: boolean
    autoFollowUp: boolean
    followUpDelay: number // in hours
    maxFollowUps: number
  }
  
  // Follow-up Configuration
  followUpTemplates: Array<{
    delay: number // in hours
    template: string
    subject: string
    conditions: {
      minEngagementScore?: number
      intent?: string[]
      sentiment?: string[]
    }
  }>
  
  // Assignment
  createdBy: mongoose.Types.ObjectId
  assignedTo?: mongoose.Types.ObjectId
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

const EmailCampaignSchema = new Schema<IEmailCampaign>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  
  // Campaign Configuration
  subject: {
    type: String,
    required: true,
    trim: true
  },
  template: {
    type: String,
    required: true
  },
  personalizationFields: [{
    type: String,
    trim: true
  }],
  
  // Targeting
  targetCriteria: {
    eventTypes: [{
      type: String,
      enum: ['conference', 'workshop', 'seminar', 'exhibition', 'networking', 'other']
    }],
    companySizes: [{
      type: String,
      enum: ['startup', 'small', 'medium', 'large', 'enterprise']
    }],
    locations: [String],
    industries: [String],
    customFilters: {
      type: Map,
      of: Schema.Types.Mixed
    }
  },
  
  // Scheduling
  scheduledAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'running', 'paused', 'completed', 'cancelled'],
    default: 'draft'
  },
  
  // Performance Metrics
  metrics: {
    totalSent: {
      type: Number,
      default: 0,
      min: 0
    },
    totalDelivered: {
      type: Number,
      default: 0,
      min: 0
    },
    totalOpened: {
      type: Number,
      default: 0,
      min: 0
    },
    totalReplied: {
      type: Number,
      default: 0,
      min: 0
    },
    totalClicked: {
      type: Number,
      default: 0,
      min: 0
    },
    openRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    replyRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    clickRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    conversionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  
  // AI Configuration
  aiSettings: {
    usePersonalization: {
      type: Boolean,
      default: true
    },
    useSentimentAnalysis: {
      type: Boolean,
      default: true
    },
    useIntentDetection: {
      type: Boolean,
      default: true
    },
    autoFollowUp: {
      type: Boolean,
      default: true
    },
    followUpDelay: {
      type: Number,
      default: 24, // 24 hours
      min: 1
    },
    maxFollowUps: {
      type: Number,
      default: 3,
      min: 0,
      max: 10
    }
  },
  
  // Follow-up Configuration
  followUpTemplates: [{
    delay: {
      type: Number,
      required: true,
      min: 1
    },
    template: {
      type: String,
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    conditions: {
      minEngagementScore: {
        type: Number,
        min: 0,
        max: 100
      },
      intent: [{
        type: String,
        enum: ['interested', 'not_interested', 'need_info', 'pricing_inquiry', 'follow_up_needed', 'unclear']
      }],
      sentiment: [{
        type: String,
        enum: ['positive', 'neutral', 'negative']
      }]
    }
  }],
  
  // Assignment
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
})

// Indexes
EmailCampaignSchema.index({ status: 1 })
EmailCampaignSchema.index({ createdBy: 1 })
EmailCampaignSchema.index({ scheduledAt: 1 })
EmailCampaignSchema.index({ createdAt: -1 })

// Method to update metrics
EmailCampaignSchema.methods.updateMetrics = function() {
  const metrics = this.metrics
  
  if (metrics.totalSent > 0) {
    metrics.openRate = (metrics.totalOpened / metrics.totalSent) * 100
    metrics.replyRate = (metrics.totalReplied / metrics.totalSent) * 100
    metrics.clickRate = (metrics.totalClicked / metrics.totalSent) * 100
  }
  
  return this.save()
}

// Method to check if campaign should send follow-up
EmailCampaignSchema.methods.shouldSendFollowUp = function(organizer: any, followUpIndex: number) {
  if (followUpIndex >= this.followUpTemplates.length) {
    return false
  }
  
  const followUp = this.followUpTemplates[followUpIndex]
  const conditions = followUp.conditions
  
  // Check engagement score
  if (conditions.minEngagementScore && organizer.engagementScore < conditions.minEngagementScore) {
    return false
  }
  
  // Check intent
  if (conditions.intent && conditions.intent.length > 0 && !conditions.intent.includes(organizer.intent)) {
    return false
  }
  
  // Check sentiment
  if (conditions.sentiment && conditions.sentiment.length > 0 && !conditions.sentiment.includes(organizer.sentiment)) {
    return false
  }
  
  return true
}

export default mongoose.models.EmailCampaign || mongoose.model<IEmailCampaign>('EmailCampaign', EmailCampaignSchema)
