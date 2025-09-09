#!/usr/bin/env node

import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crm_leads_ai';
const DB_NAME = 'crm_leads_ai';

async function createTestUsers() {
  let client;
  
  try {
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    const usersCollection = db.collection('users');
    
    // Test users to create
    const testUsers = [
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@crmleadsai.com',
        password: 'admin123',
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
        ]
      },
      {
        firstName: 'John',
        lastName: 'Sales',
        email: 'john.sales@crmleadsai.com',
        password: 'sales123',
        phone: '+1 (555) 111-1111',
        department: 'sales',
        role: 'sales_rep',
        status: 'active',
        permissions: [
          'leads:read',
          'leads:write',
          'analytics:read',
          'activities:read',
          'activities:write'
        ]
      },
      {
        firstName: 'Sarah',
        lastName: 'Manager',
        email: 'sarah.manager@crmleadsai.com',
        password: 'manager123',
        phone: '+1 (555) 222-2222',
        department: 'management',
        role: 'manager',
        status: 'active',
        permissions: [
          'leads:read',
          'leads:write',
          'leads:delete',
          'users:read',
          'analytics:read',
          'activities:read',
          'activities:write',
          'settings:read'
        ]
      }
    ];
    
    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await usersCollection.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`✅ User ${userData.email} already exists`);
        continue;
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user object
      const user = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: hashedPassword,
        phone: userData.phone,
        department: userData.department,
        role: userData.role,
        status: userData.status,
        permissions: userData.permissions,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: null
      };
      
      // Insert user
      const result = await usersCollection.insertOne(user);
      console.log(`✅ Created user: ${userData.email} (${userData.role})`);
    }
    
    console.log('\n🎉 Test users created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log('│ ADMIN ACCESS (Full Permissions)                            │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log('│ Email: admin@crmleadsai.com                                │');
    console.log('│ Password: admin123                                         │');
    console.log('│ Role: Admin                                                │');
    console.log('└─────────────────────────────────────────────────────────────┘');
    console.log('\n┌─────────────────────────────────────────────────────────────┐');
    console.log('│ MANAGER ACCESS (Limited Permissions)                       │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log('│ Email: sarah.manager@crmleadsai.com                        │');
    console.log('│ Password: manager123                                       │');
    console.log('│ Role: Manager                                              │');
    console.log('└─────────────────────────────────────────────────────────────┘');
    console.log('\n┌─────────────────────────────────────────────────────────────┐');
    console.log('│ SALES REP ACCESS (Basic Permissions)                       │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log('│ Email: john.sales@crmleadsai.com                           │');
    console.log('│ Password: sales123                                         │');
    console.log('│ Role: Sales Representative                                 │');
    console.log('└─────────────────────────────────────────────────────────────┘');
    
  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\nDisconnected from MongoDB');
    }
  }
}

// Run the script
createTestUsers();
