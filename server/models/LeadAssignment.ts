import mongoose, { Document, Schema } from 'mongoose'

export interface ILeadAssignment extends Document {
  leadId: string
  assignedTo: string
  assignedBy: string
  assignmentRuleId?: string
  assignmentType: 'manual' | 'automatic' | 'rule_based'
  assignedAt: Date
  status: 'active' | 'transferred' | 'rejected' | 'completed'
  transferredTo?: string
  transferredAt?: Date
  transferredBy?: string
  rejectionReason?: string
  notes?: string
  metadata?: {
    ruleName?: string
    assignmentScore?: number
    skillMatch?: string[]
    regionMatch?: string
    sourceMatch?: string
  }
}

const LeadAssignmentSchema = new Schema<ILeadAssignment>({
  leadId: {
    type: Schema.Types.ObjectId,
    ref: 'Lead',
    required: true
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignmentRuleId: {
    type: Schema.Types.ObjectId,
    ref: 'AssignmentRule'
  },
  assignmentType: {
    type: String,
    enum: ['manual', 'automatic', 'rule_based'],
    required: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'transferred', 'rejected', 'completed'],
    default: 'active'
  },
  transferredTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  transferredAt: Date,
  transferredBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: String,
  notes: String,
  metadata: {
    ruleName: String,
    assignmentScore: Number,
    skillMatch: [String],
    regionMatch: String,
    sourceMatch: String
  }
}, {
  timestamps: true
})

// Indexes for better performance
LeadAssignmentSchema.index({ leadId: 1, status: 1 })
LeadAssignmentSchema.index({ assignedTo: 1, status: 1 })
LeadAssignmentSchema.index({ assignedAt: -1 })
LeadAssignmentSchema.index({ assignmentType: 1 })

export default mongoose.models.LeadAssignment || mongoose.model<ILeadAssignment>('LeadAssignment', LeadAssignmentSchema)
