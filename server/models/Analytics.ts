import mongoose from 'mongoose'

const analyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  metrics: {
    totalLeads: { type: Number, default: 0 },
    newLeads: { type: Number, default: 0 },
    convertedLeads: { type: Number, default: 0 },
    totalValue: { type: Number, default: 0 },
    averageDealSize: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    activitiesCompleted: { type: Number, default: 0 },
    followUpsScheduled: { type: Number, default: 0 }
  },
  leadSources: [{
    source: { type: String, required: true },
    count: { type: Number, default: 0 },
    value: { type: Number, default: 0 }
  }],
  leadStatuses: [{
    status: { type: String, required: true },
    count: { type: Number, default: 0 }
  }],
  monthlyTrends: [{
    month: { type: String, required: true },
    leads: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    value: { type: Number, default: 0 }
  }]
}, {
  timestamps: true
})

export default mongoose.models.Analytics || mongoose.model('Analytics', analyticsSchema)