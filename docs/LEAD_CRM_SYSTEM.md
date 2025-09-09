# Lead CRM System Documentation

## Overview

This is a comprehensive Lead Customer Relationship Management (CRM) system built with Nuxt.js, featuring AI-powered insights, role-based access control, and modern web technologies. The system manages the complete lead lifecycle from initial contact to conversion.

## System Architecture

### Technology Stack
- **Frontend**: Nuxt.js 4.1.1, Vue.js 3, TypeScript
- **Backend**: Node.js, Nitro server
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Styling**: Tailwind CSS with custom components
- **Icons**: Heroicons
- **AI Integration**: OpenAI API for lead analysis

### Project Structure
```
crm-leads-ai/
├── app.vue                 # Root application component
├── nuxt.config.ts         # Nuxt configuration
├── assets/css/main.css    # Global styles
├── components/            # Reusable Vue components
├── composables/          # Vue composables (useAuth, useUser)
├── layouts/              # Layout components (default, auth)
├── pages/                # Application pages
├── plugins/              # Nuxt plugins
├── server/               # Backend API and models
│   ├── api/             # API endpoints
│   ├── middleware/      # Server middleware
│   ├── models/          # Database models
│   └── utils/           # Utility functions
└── types/               # TypeScript type definitions
```

## Lead Management System

### Lead Data Model
```typescript
interface ILead {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  jobTitle?: string
  industry?: string
  source: 'website' | 'social_media' | 'referral' | 'cold_call' | 'email' | 'event' | 'other'
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  value?: number
  currency: string
  expectedCloseDate?: Date
  assignedTo: ObjectId
  createdBy: ObjectId
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
    createdBy: ObjectId
    createdAt: Date
    metadata?: Record<string, any>
  }>
  createdAt: Date
  updatedAt: Date
}
```

### Lead Status Workflow
```
New → Contacted → Qualified → Proposal → Negotiation → Closed Won/Closed Lost
```

### Lead Sources
- **Website**: Leads from company website
- **Social Media**: Leads from social media platforms
- **Referral**: Leads from existing customers or partners
- **Cold Call**: Leads from cold calling campaigns
- **Email**: Leads from email marketing campaigns
- **Event**: Leads from trade shows, conferences, or events
- **Other**: Leads from other sources

### Lead Priorities
- **Low**: Standard priority leads
- **Medium**: Important leads requiring attention
- **High**: Critical leads requiring immediate attention
- **Urgent**: Emergency leads requiring immediate action

## Core Features

### 1. Lead Management
- **Lead Creation**: Comprehensive lead form with validation
- **Lead Editing**: Update lead information and status
- **Lead Deletion**: Remove leads from the system
- **Lead Assignment**: Assign leads to specific users
- **Lead Search**: Search and filter leads
- **Lead Export**: Export leads to CSV format

### 2. Activity Management
- **Activity Tracking**: Record all interactions with leads
- **Follow-up Scheduling**: Schedule and track follow-up activities
- **Activity Types**: Calls, emails, meetings, notes, tasks, status changes
- **Activity History**: Complete audit trail of all activities
- **Due Date Management**: Track and manage activity due dates

### 3. AI-Powered Features
- **Lead Scoring**: AI-powered lead scoring based on various factors
- **Sentiment Analysis**: Analyze lead sentiment from interactions
- **Engagement Scoring**: Measure lead engagement levels
- **Urgency Detection**: Identify urgent leads automatically
- **Recommendations**: AI-generated recommendations for lead management
- **Follow-up Suggestions**: Smart follow-up timing recommendations

### 4. Analytics & Reporting
- **Dashboard Analytics**: Real-time metrics and KPIs
- **Conversion Tracking**: Track lead conversion rates
- **Source Analysis**: Analyze lead sources and performance
- **Activity Metrics**: Track user and team activity levels
- **Revenue Tracking**: Monitor lead values and revenue potential
- **Trend Analysis**: Identify trends and patterns in lead data

### 5. User Management
- **Role-Based Access**: Admin, Manager, Sales, Viewer roles
- **User Profiles**: Complete user profile management
- **Team Management**: Manage team members and assignments
- **Permission Control**: Granular permission management
- **User Activity**: Track user activity and performance

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### Lead Management
- `GET /api/leads` - Get all leads (with pagination and filtering)
- `POST /api/leads` - Create new lead
- `GET /api/leads/[id]` - Get specific lead
- `PUT /api/leads/[id]` - Update lead
- `DELETE /api/leads/[id]` - Delete lead

### Activity Management
- `GET /api/activities` - Get all activities
- `POST /api/activities` - Create new activity
- `PUT /api/activities/[id]` - Update activity
- `DELETE /api/activities/[id]` - Delete activity

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard analytics
- `GET /api/ai/insights` - Get AI insights and recommendations
- `GET /api/ai/analyze-lead` - Analyze specific lead with AI

### User Management
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user
- `PUT /api/users/me` - Update current user profile
- `POST /api/users/change-password` - Change password

## Database Models

### User Model
```typescript
interface IUser {
  _id: string
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'admin' | 'manager' | 'sales' | 'viewer' | 'user'
  avatar?: string
  phone?: string
  department?: string
  jobTitle?: string
  status: 'active' | 'inactive'
  createdBy?: string
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}
```

### Activity Model
```typescript
interface IActivity {
  _id: string
  type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'status_change' | 'file_upload' | 'ai_insight'
  title: string
  description: string
  leadId: ObjectId
  createdBy: ObjectId
  assignedTo?: ObjectId
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
```

### Analytics Model
```typescript
interface IAnalytics {
  _id: string
  userId: ObjectId
  date: Date
  metrics: {
    totalLeads: number
    newLeads: number
    convertedLeads: number
    conversionRate: number
    totalValue: number
    averageDealSize: number
    activitiesCompleted: number
    followUpsScheduled: number
  }
  leadSources: Record<string, number>
  statusBreakdown: Record<string, number>
  priorityBreakdown: Record<string, number>
  createdAt: Date
  updatedAt: Date
}
```

## Security Features

### 1. Authentication & Authorization
- JWT token-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Token expiration and refresh
- Secure cookie handling

### 2. Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting

### 3. Access Control
- Resource-level permissions
- User-specific data access
- Admin-only operations
- Audit logging

## Frontend Features

### 1. Responsive Design
- Mobile-first approach
- Responsive sidebar navigation
- Adaptive layouts
- Touch-friendly interfaces

### 2. User Interface
- Modern, clean design
- Intuitive navigation
- Real-time updates
- Loading states and error handling
- Form validation

### 3. Data Visualization
- Interactive charts and graphs
- Real-time metrics
- Export capabilities
- Filtering and sorting

## AI Integration

### 1. Lead Analysis
- Automatic lead scoring
- Sentiment analysis
- Engagement measurement
- Urgency detection

### 2. Recommendations
- Follow-up timing suggestions
- Lead prioritization
- Activity recommendations
- Conversion optimization

### 3. Insights
- Performance analytics
- Trend identification
- Predictive modeling
- Actionable insights

## Deployment

### Environment Setup
```env
MONGODB_URI=mongodb://localhost:27017/crm_leads_ai
JWT_SECRET=your-secret-key
OPENAI_API_KEY=your-openai-api-key
```

### Development
```bash
npm install
npm run dev
```

### Production
```bash
npm run build
npm run start
```

## Configuration

### Nuxt Configuration
- Tailwind CSS integration
- Google Fonts
- i18n support
- PWA capabilities
- SEO optimization

### Database Configuration
- MongoDB connection
- Mongoose schemas
- Index optimization
- Data validation

## Monitoring & Maintenance

### 1. Logging
- API request logging
- Error tracking
- User activity logging
- Performance monitoring

### 2. Backup
- Database backups
- File storage backups
- Configuration backups
- Disaster recovery

### 3. Updates
- Security patches
- Feature updates
- Performance improvements
- Bug fixes

## Best Practices

### 1. Code Organization
- Modular architecture
- Reusable components
- Type safety
- Error handling

### 2. Security
- Input validation
- Authentication checks
- Permission verification
- Data encryption

### 3. Performance
- Database optimization
- Caching strategies
- Lazy loading
- Code splitting

### 4. User Experience
- Intuitive navigation
- Responsive design
- Fast loading
- Error feedback

## Troubleshooting

### Common Issues
1. **Authentication Errors**: Check JWT token validity
2. **Database Connection**: Verify MongoDB connection
3. **Permission Denied**: Check user role and permissions
4. **API Errors**: Review server logs and error messages

### Debugging
- Enable debug logging
- Check browser console
- Review server logs
- Test API endpoints

## Future Enhancements

### Planned Features
1. **Advanced AI Features**: Machine learning models for lead prediction
2. **Mobile App**: Native mobile application
3. **Integration APIs**: Third-party service integrations
4. **Advanced Analytics**: Custom reporting and dashboards
5. **Workflow Automation**: Automated lead nurturing workflows
6. **Multi-tenant Support**: Organization-level data isolation
7. **Real-time Notifications**: Push notifications and alerts
8. **Advanced Search**: Full-text search and filtering

---

*This documentation is maintained alongside the codebase and should be updated when features are modified or extended.*
