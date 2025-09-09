import mongoose, { Document, Schema } from 'mongoose'

export interface IActivity extends Document {
  _id: string
  type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'status_change' | 'file_upload' | 'ai_insight'
  title: string
  description: string
  leadId: mongoose.Types.ObjectId
  createdBy: mongoose.Types.ObjectId
  assignedTo?: mongoose.Types.ObjectId
  dueDate?: Date
  completedAt?: Date
  isCompleted: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  metadata?: Record<string, any>
  attachments?: Array<{
    filename: string
    originalName: string
    mimeType: string
    size: number
    url: string
  }>
  createdAt: Date
  updatedAt: Date
}

const ActivitySchema = new Schema<IActivity>({
  type: {
    type: String,
    enum: ['call', 'email', 'meeting', 'note', 'task', 'status_change', 'file_upload', 'ai_insight'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  leadId: {
    type: Schema.Types.ObjectId,
    ref: 'Lead',
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  dueDate: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  metadata: {
    type: Map,
    of: Schema.Types.Mixed
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String
  }]
}, {
  timestamps: true
})

// Indexes
ActivitySchema.index({ leadId: 1 })
ActivitySchema.index({ createdBy: 1 })
ActivitySchema.index({ assignedTo: 1 })
ActivitySchema.index({ type: 1 })
ActivitySchema.index({ dueDate: 1 })
ActivitySchema.index({ isCompleted: 1 })

export default mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema)
