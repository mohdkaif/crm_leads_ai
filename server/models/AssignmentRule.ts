import mongoose, { Document, Schema } from 'mongoose'

export interface IAssignmentRule extends Document {
  name: string
  description?: string
  isActive: boolean
  priority: number // Higher number = higher priority
  conditions: {
    regions?: string[] // Geographic regions
    leadSources?: string[] // Lead sources to match
    leadValue?: {
      min?: number
      max?: number
    }
    leadStatus?: string[] // Lead statuses to match
    customFields?: Array<{
      field: string
      operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than'
      value: string | number
    }>
  }
  assignment: {
    type: 'round_robin' | 'least_assigned' | 'most_available' | 'specific_user' | 'skill_based'
    userId?: string // For specific_user type
    skillRequirements?: string[] // For skill_based type
    maxLeadsPerDay?: number
    maxLeadsPerWeek?: number
    workingHours?: {
      start: string // HH:MM format
      end: string // HH:MM format
      timezone: string
      workingDays: number[] // 0-6 (Sunday-Saturday)
    }
  }
  fallback?: {
    type: 'round_robin' | 'least_assigned' | 'specific_user'
    userId?: string
  }
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

const AssignmentRuleSchema = new Schema<IAssignmentRule>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    required: true,
    default: 1
  },
  conditions: {
    regions: [{
      type: String,
      trim: true
    }],
    leadSources: [{
      type: String,
      trim: true
    }],
    leadValue: {
      min: Number,
      max: Number
    },
    leadStatus: [{
      type: String,
      trim: true
    }],
    customFields: [{
      field: {
        type: String,
        required: true
      },
      operator: {
        type: String,
        enum: ['equals', 'contains', 'starts_with', 'ends_with', 'greater_than', 'less_than'],
        required: true
      },
      value: Schema.Types.Mixed
    }]
  },
  assignment: {
    type: {
      type: String,
      enum: ['round_robin', 'least_assigned', 'most_available', 'specific_user', 'skill_based'],
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    skillRequirements: [{
      type: String,
      trim: true
    }],
    maxLeadsPerDay: Number,
    maxLeadsPerWeek: Number,
    workingHours: {
      start: String,
      end: String,
      timezone: String,
      workingDays: [Number]
    }
  },
  fallback: {
    type: {
      type: String,
      enum: ['round_robin', 'least_assigned', 'specific_user']
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

// Indexes for better performance
AssignmentRuleSchema.index({ isActive: 1, priority: -1 })
AssignmentRuleSchema.index({ 'conditions.regions': 1 })
AssignmentRuleSchema.index({ 'conditions.leadSources': 1 })
AssignmentRuleSchema.index({ createdBy: 1 })

export default mongoose.models.AssignmentRule || mongoose.model<IAssignmentRule>('AssignmentRule', AssignmentRuleSchema)
