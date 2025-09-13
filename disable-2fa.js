const mongoose = require('mongoose');
require('dotenv').config();

// Define User schema inline
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'sales', 'viewer', 'user'], default: 'user' },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  phone: String,
  department: String,
  avatar: String,
  lastLogin: Date,
  settings: {
    general: {
      language: { type: String, default: 'en' },
      timezone: { type: String, default: 'UTC' },
      currency: { type: String, default: 'USD' },
      dateFormat: { type: String, default: 'MM/DD/YYYY' },
      timeFormat: { type: String, default: '12h' },
      companyName: { type: String, default: 'CRM Leads AI' }
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      leadAssigned: { type: Boolean, default: true },
      leadUpdated: { type: Boolean, default: true },
      followUpReminder: { type: Boolean, default: true },
      statusChange: { type: Boolean, default: true }
    },
    security: {
      twoFactor: { type: Boolean, default: false },
      sessionTimeout: { type: Number, default: 30 },
      passwordExpiry: { type: Number, default: 90 }
    },
    emailTemplates: [{
      name: String,
      subject: String,
      html: String,
      text: String,
      variables: [String],
      isDefault: { type: Boolean, default: false }
    }]
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function disable2FA() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const admin = await User.findOne({ email: 'admin@crmleadsai.com' });
    if (admin) {
      admin.settings = admin.settings || {};
      admin.settings.security = admin.settings.security || {};
      admin.settings.security.twoFactor = false;
      await admin.save();
      console.log('2FA disabled for admin user');
    } else {
      console.log('Admin user not found');
    }
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

disable2FA();
