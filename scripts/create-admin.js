#!/usr/bin/env node

import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crm_leads_ai';
const DB_NAME = 'crm_leads_ai';

async function createAdminUser() {
  let client;
  
  try {
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    const usersCollection = db.collection('users');
    
    // Check if admin user already exists
    const existingAdmin = await usersCollection.findOne({ email: 'admin@crmleadsai.com' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@crmleadsai.com');
      console.log('Password: admin123');
      return;
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@crmleadsai.com',
      password: hashedPassword,
      phone: '+1 (555) 000-0000',
      department: 'management',
      role: 'admin',
      status: 'active',
      permissions: [
        'leads:read',
        'leads:write',
        'leads:delete',
        'users:read',
        'users:write',
        'users:delete',
        'analytics:read',
        'activities:read',
        'activities:write',
        'settings:read',
        'settings:write'
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null
    };
    
    // Insert admin user
    const result = await usersCollection.insertOne(adminUser);
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@crmleadsai.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: Admin (Full Access)');
    console.log('🆔 User ID:', result.insertedId);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('Disconnected from MongoDB');
    }
  }
}

// Run the script
createAdminUser();
