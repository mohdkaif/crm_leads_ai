import mongoose, { Document, Schema } from 'mongoose'

export interface IEmailTemplate extends Document {
  _id: string
  name: string
  description?: string
  category: 'outreach' | 'follow_up' | 'response' | 'conversion' | 'nurture'
  
  // Template Content
  subject: string
  htmlContent: string
  textContent: string
  
  // Personalization
  personalizationFields: Array<{
    field: string
    displayName: string
    required: boolean
    defaultValue?: string
    description?: string
  }>
  
  // AI Integration
  aiSettings: {
    usePersonalization: boolean
    useSentimentAnalysis: boolean
    useIntentDetection: boolean
    generateVariations: boolean
    maxVariations: number
  }
  
  // Template Variables
  variables: Array<{
    name: string
    type: 'text' | 'number' | 'date' | 'boolean' | 'select'
    required: boolean
    options?: string[] // for select type
    defaultValue?: any
  }>
  
  // Usage Statistics
  usage: {
    totalUsed: number
    lastUsed?: Date
    successRate: number
    averageResponseRate: number
  }
  
  // Template Metadata
  tags: string[]
  isActive: boolean
  isPublic: boolean
  
  // Assignment
  createdBy: mongoose.Types.ObjectId
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}

const EmailTemplateSchema = new Schema<IEmailTemplate>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['outreach', 'follow_up', 'response', 'conversion', 'nurture'],
    required: true
  },
  
  // Template Content
  subject: {
    type: String,
    required: true,
    trim: true
  },
  htmlContent: {
    type: String,
    required: true
  },
  textContent: {
    type: String,
    required: true
  },
  
  // Personalization
  personalizationFields: [{
    field: {
      type: String,
      required: true,
      trim: true
    },
    displayName: {
      type: String,
      required: true,
      trim: true
    },
    required: {
      type: Boolean,
      default: false
    },
    defaultValue: String,
    description: String
  }],
  
  // AI Integration
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
    generateVariations: {
      type: Boolean,
      default: false
    },
    maxVariations: {
      type: Number,
      default: 3,
      min: 1,
      max: 10
    }
  },
  
  // Template Variables
  variables: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'boolean', 'select'],
      required: true
    },
    required: {
      type: Boolean,
      default: false
    },
    options: [String],
    defaultValue: Schema.Types.Mixed
  }],
  
  // Usage Statistics
  usage: {
    totalUsed: {
      type: Number,
      default: 0,
      min: 0
    },
    lastUsed: Date,
    successRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    averageResponseRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  
  // Template Metadata
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  
  // Assignment
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

// Indexes
EmailTemplateSchema.index({ category: 1 })
EmailTemplateSchema.index({ isActive: 1 })
EmailTemplateSchema.index({ isPublic: 1 })
EmailTemplateSchema.index({ createdBy: 1 })
EmailTemplateSchema.index({ tags: 1 })
EmailTemplateSchema.index({ createdAt: -1 })

// Method to personalize template
EmailTemplateSchema.methods.personalize = function(data: Record<string, any>) {
  let personalizedSubject = this.subject
  let personalizedHtml = this.htmlContent
  let personalizedText = this.textContent
  
  // Replace variables in subject
  this.personalizationFields.forEach(field => {
    const value = data[field.field] || field.defaultValue || ''
    const regex = new RegExp(`{{${field.field}}}`, 'g')
    personalizedSubject = personalizedSubject.replace(regex, value)
  })
  
  // Replace variables in HTML content
  this.personalizationFields.forEach(field => {
    const value = data[field.field] || field.defaultValue || ''
    const regex = new RegExp(`{{${field.field}}}`, 'g')
    personalizedHtml = personalizedHtml.replace(regex, value)
  })
  
  // Replace variables in text content
  this.personalizationFields.forEach(field => {
    const value = data[field.field] || field.defaultValue || ''
    const regex = new RegExp(`{{${field.field}}}`, 'g')
    personalizedText = personalizedText.replace(regex, value)
  })
  
  return {
    subject: personalizedSubject,
    htmlContent: personalizedHtml,
    textContent: personalizedText
  }
}

// Method to update usage statistics
EmailTemplateSchema.methods.updateUsage = function(responseRate: number) {
  this.usage.totalUsed += 1
  this.usage.lastUsed = new Date()
  
  // Update success rate (simple moving average)
  const currentSuccessRate = this.usage.successRate
  const totalUsed = this.usage.totalUsed
  this.usage.successRate = ((currentSuccessRate * (totalUsed - 1)) + (responseRate > 0 ? 100 : 0)) / totalUsed
  
  // Update average response rate
  const currentAvgResponseRate = this.usage.averageResponseRate
  this.usage.averageResponseRate = ((currentAvgResponseRate * (totalUsed - 1)) + responseRate) / totalUsed
  
  return this.save()
}

// Static method to get templates by category
EmailTemplateSchema.statics.getByCategory = function(category: string, isActive: boolean = true) {
  return this.find({ category, isActive })
}

// Static method to get public templates
EmailTemplateSchema.statics.getPublic = function() {
  return this.find({ isPublic: true, isActive: true })
}

export default mongoose.models.EmailTemplate || mongoose.model<IEmailTemplate>('EmailTemplate', EmailTemplateSchema)
