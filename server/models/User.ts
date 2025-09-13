import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  _id: string
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'admin' | 'sales_manager' | 'account_manager' | 'sales_rep' | 'customer_success' | 'marketing' | 'support' | 'viewer'
  avatar?: string
  phone?: string
  department?: string
  jobTitle?: string
  status: 'active' | 'inactive'
  createdBy?: string
  lastLogin?: Date
  settings?: {
    general?: {
      companyName: string
      defaultCurrency: string
      timeZone: string
      dateFormat: string
      language: string
      theme: string
    }
    notifications?: {
      email: boolean
      leadAssignment: boolean
      followUpReminders: boolean
      statusChanges: boolean
      weeklyReports: boolean
      monthlyReports: boolean
      systemUpdates: boolean
      marketingEmails: boolean
    }
    security?: {
      twoFactor: boolean
    }
    emailTemplates?: Array<{
      id: string
      name: string
      description: string
      category: string
      isSystem: boolean
      subject: string
      html: string
      variables: string[]
      createdAt: Date
      updatedAt: Date
    }>
  }
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
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
  role: {
    type: String,
    enum: ['admin', 'sales_manager', 'account_manager', 'sales_rep', 'customer_success', 'marketing', 'support', 'viewer'],
    default: 'viewer'
  },
  avatar: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  jobTitle: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  lastLogin: {
    type: Date,
    default: null
  },
  settings: {
    general: {
      companyName: { type: String, default: 'CRM Leads AI' },
      defaultCurrency: { type: String, default: 'USD' },
      timeZone: { type: String, default: 'UTC' },
      dateFormat: { type: String, default: 'MM/DD/YYYY' },
      language: { type: String, default: 'en' },
      theme: { type: String, default: 'light' }
    },
    notifications: {
      email: { type: Boolean, default: true },
      leadAssignment: { type: Boolean, default: true },
      followUpReminders: { type: Boolean, default: true },
      statusChanges: { type: Boolean, default: false },
      weeklyReports: { type: Boolean, default: true },
      monthlyReports: { type: Boolean, default: false },
      systemUpdates: { type: Boolean, default: true },
      marketingEmails: { type: Boolean, default: false }
    },
    security: {
      twoFactor: { type: Boolean, default: false }
    }
  }
}, {
  timestamps: true
})

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

// Remove password from JSON output
UserSchema.methods.toJSON = function() {
  const userObject = this.toObject()
  delete userObject.password
  return userObject
}

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
