import mongoose, { Document, Schema } from 'mongoose'

export interface ILead extends Document {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  jobTitle?: string
  industry?: string
  source: 'website' | 'social_media' | 'referral' | 'cold_call' | 'email' | 'event' | 'other'
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost' | 'assigned'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  value?: number
  currency: string
  expectedCloseDate?: Date
  assignedTo: mongoose.Types.ObjectId
  createdBy: mongoose.Types.ObjectId
  lastContactDate?: Date
  nextFollowUpDate?: Date
  notes?: string
  tags: string[]
  customFields: Record<string, any>
  aiScore?: number
  aiInsights?: {
    sentiment?: 'positive' | 'neutral' | 'negative'
    engagement?: 'high' | 'medium' | 'low'
    urgency?: 'high' | 'medium' | 'low'
    recommendations?: string[]
  }
  attachments: Array<{
    filename: string
    originalName: string
    mimeType: string
    size: number
    url: string
    uploadedAt: Date
  }>
  activities: Array<{
    type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'status_change'
    description: string
    createdBy: mongoose.Types.ObjectId
    createdAt: Date
    metadata?: Record<string, any>
  }>
  createdAt: Date
  updatedAt: Date
}

const LeadSchema = new Schema<ILead>({
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
  industry: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    enum: ['website', 'social_media', 'referral', 'cold_call', 'email', 'event', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost', 'assigned'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  value: {
    type: Number,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  expectedCloseDate: {
    type: Date
  },
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
  lastContactDate: {
    type: Date
  },
  nextFollowUpDate: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: 2000
  },
  tags: [{
    type: String,
    trim: true
  }],
  customFields: {
    type: Map,
    of: Schema.Types.Mixed
  },
  aiScore: {
    type: Number,
    min: 0,
    max: 100
  },
  aiInsights: {
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative']
    },
    engagement: {
      type: String,
      enum: ['high', 'medium', 'low']
    },
    urgency: {
      type: String,
      enum: ['high', 'medium', 'low']
    },
    recommendations: [String]
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  activities: [{
    type: {
      type: String,
      enum: ['call', 'email', 'meeting', 'note', 'task', 'status_change'],
      required: true
    },
    description: {
      type: String,
      required: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed
    }
  }]
}, {
  timestamps: true
})

// Indexes for better performance
LeadSchema.index({ email: 1 })
LeadSchema.index({ assignedTo: 1 })
LeadSchema.index({ status: 1 })
LeadSchema.index({ createdAt: -1 })
LeadSchema.index({ expectedCloseDate: 1 })
LeadSchema.index({ tags: 1 })

export default mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema)
