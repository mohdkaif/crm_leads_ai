# Lead Management System Setup Guide

## Prerequisites

Before setting up the Lead Management System, ensure you have the following:

1. **Node.js** (v18 or higher)
2. **MongoDB** (local or cloud instance)
3. **OpenAI API Key** (for AI-powered analysis)
4. **Email Service** (Gmail, Outlook, or SMTP)

## Installation Steps

### 1. Install Dependencies

The system requires several new packages for AI and email functionality:

```bash
npm install openai
```

### 2. Environment Configuration

Create a `.env` file in the project root with the following variables:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/crm_ai?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# OpenAI API (Required for AI analysis)
OPENAI_API_KEY=sk-your-openai-api-key-here

# App URLs
AUTH_ORIGIN=http://localhost:3000
API_BASE_URL=http://localhost:3000/api
SITE_URL=http://localhost:3000

# Email Configuration (Optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
```

### 3. OpenAI API Key Setup

1. **Get OpenAI API Key:**
   - Visit [OpenAI Platform](https://platform.openai.com/)
   - Create an account or sign in
   - Navigate to API Keys section
   - Create a new API key
   - Copy the key and add it to your `.env` file

2. **API Usage Limits:**
   - Free tier: $5 credit (approximately 1M tokens)
   - Pay-as-you-go: $0.002 per 1K tokens
   - Monitor usage in OpenAI dashboard

### 4. Database Setup

The system will automatically create the following collections:

- `eventorganizers` - Event organizer leads
- `emailcampaigns` - Email campaigns
- `emailtemplates` - Email templates
- `users` - System users
- `leads` - General leads (existing)
- `activities` - Activities and follow-ups

### 5. Test the Installation

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test NLP functionality:**
   ```bash
   curl http://localhost:3000/api/test-nlp
   ```

3. **Expected response:**
   ```json
   {
     "success": true,
     "data": {
       "sampleEmail": "Hi, I'm interested in learning more about Quipo...",
       "analysis": {
         "intent": {
           "intent": "interested",
           "confidence": 0.95,
           "keywords": ["interested", "learning", "pricing"]
         },
         "sentiment": {
           "sentiment": "positive",
           "confidence": 0.88
         },
         "urgency": "high",
         "actionRequired": true,
         "followUpNeeded": true
       }
     }
   }
   ```

## API Endpoints

### Event Organizer Management

#### Create Event Organizer
```bash
POST /api/event-organizers
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "company": "Tech Events Inc",
  "eventName": "Tech Conference 2024",
  "eventType": "conference",
  "eventDate": "2024-06-15",
  "expectedAttendees": 500,
  "priority": "high"
}
```

#### Get Event Organizers
```bash
GET /api/event-organizers?page=1&limit=10&status=interested&priority=high
Authorization: Bearer <token>
```

#### Analyze Email Content
```bash
POST /api/event-organizers/analyze
Authorization: Bearer <token>
Content-Type: application/json

{
  "organizerId": "organizer_id_here",
  "emailContent": "Hi, I'm interested in learning more about Quipo...",
  "subject": "Re: Can we list your event on Quipo?",
  "direction": "inbound"
}
```

### Email Campaign Management

#### Create Email Campaign
```bash
POST /api/email-campaigns
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Tech Conference Outreach",
  "description": "Outreach campaign for tech conferences",
  "subject": "Can we list your event on Quipo?",
  "template": "Hi {{firstName}}, I hope this email finds you well...",
  "personalizationFields": ["firstName", "eventName", "company"],
  "targetCriteria": {
    "eventTypes": ["conference", "workshop"],
    "companySizes": ["medium", "large"]
  },
  "aiSettings": {
    "usePersonalization": true,
    "useSentimentAnalysis": true,
    "autoFollowUp": true,
    "followUpDelay": 24,
    "maxFollowUps": 3
  }
}
```

#### Get Email Campaigns
```bash
GET /api/email-campaigns?page=1&limit=10&status=running
Authorization: Bearer <token>
```

## Usage Examples

### 1. Basic Lead Management Workflow

```javascript
// 1. Create a new event organizer
const newOrganizer = await $fetch('/api/event-organizers', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah@techevents.com',
    company: 'Tech Events LLC',
    eventName: 'AI Summit 2024',
    eventType: 'conference',
    expectedAttendees: 1000,
    priority: 'high'
  }
})

// 2. Analyze incoming email response
const analysis = await $fetch('/api/event-organizers/analyze', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: {
    organizerId: newOrganizer.data.organizer._id,
    emailContent: "Hi, I'm very interested in Quipo! Can we schedule a call?",
    subject: "Re: Can we list your event on Quipo?",
    direction: "inbound"
  }
})

// 3. Check analysis results
console.log('Intent:', analysis.data.analysis.intent.intent) // 'interested'
console.log('Sentiment:', analysis.data.analysis.sentiment.sentiment) // 'positive'
console.log('Action Required:', analysis.data.analysis.actionRequired) // true
```

### 2. Email Campaign Workflow

```javascript
// 1. Create email campaign
const campaign = await $fetch('/api/email-campaigns', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: {
    name: 'Q1 2024 Outreach',
    subject: 'Can we list your event on Quipo?',
    template: `
      Hi {{firstName}},
      
      I hope this email finds you well. I came across {{eventName}} and was impressed by your event organization.
      
      At Quipo, we help event organizers like yourself reach a wider audience and increase attendance.
      
      Would you be interested in listing {{eventName}} on Quipo?
      
      Best regards,
      [Your Name]
    `,
    personalizationFields: ['firstName', 'eventName', 'company'],
    targetCriteria: {
      eventTypes: ['conference', 'workshop'],
      locations: ['United States', 'Canada']
    }
  }
})

// 2. Get campaign performance
const campaigns = await $fetch('/api/email-campaigns', {
  headers: { 'Authorization': `Bearer ${token}` }
})

console.log('Total Campaigns:', campaigns.data.summary.total)
console.log('Average Open Rate:', campaigns.data.summary.avgOpenRate)
```

## Configuration Options

### AI Analysis Settings

```javascript
// Customize AI analysis behavior
const aiSettings = {
  usePersonalization: true,      // Enable personalization
  useSentimentAnalysis: true,    // Enable sentiment analysis
  useIntentDetection: true,      // Enable intent detection
  autoFollowUp: true,           // Enable automatic follow-ups
  followUpDelay: 24,            // Hours before follow-up
  maxFollowUps: 3               // Maximum follow-up attempts
}
```

### Email Template Variables

Available personalization variables:

- `{{firstName}}` - Organizer's first name
- `{{lastName}}` - Organizer's last name
- `{{company}}` - Company name
- `{{eventName}}` - Event name
- `{{eventType}}` - Type of event
- `{{eventDate}}` - Event date
- `{{eventLocation}}` - Event location
- `{{expectedAttendees}}` - Expected number of attendees

### Lead Scoring Configuration

The system automatically calculates engagement scores based on:

- **Response Rate (40%)**: Percentage of emails that receive replies
- **Recent Activity (30%)**: Days since last contact
- **Intent (20%)**: Interest level based on responses
- **Sentiment (10%)**: Emotional tone of responses

## Troubleshooting

### Common Issues

1. **OpenAI API Key Error**
   ```
   Error: OpenAI API key not found
   ```
   - Ensure `OPENAI_API_KEY` is set in `.env` file
   - Verify the API key is valid and has credits

2. **MongoDB Connection Error**
   ```
   Error: connect ECONNREFUSED
   ```
   - Check `MONGODB_URI` in `.env` file
   - Ensure MongoDB is running and accessible

3. **NLP Analysis Failing**
   ```
   Error: AI analysis error
   ```
   - Check OpenAI API key and credits
   - Verify internet connection
   - Check API rate limits

### Performance Optimization

1. **Database Indexes**
   - The system automatically creates indexes for optimal performance
   - Monitor query performance in MongoDB

2. **API Rate Limits**
   - OpenAI has rate limits based on your plan
   - Implement caching for frequently analyzed content
   - Use rule-based analysis as fallback

3. **Memory Usage**
   - Monitor server memory usage
   - Consider implementing pagination for large datasets

## Security Considerations

1. **API Key Protection**
   - Never commit API keys to version control
   - Use environment variables for sensitive data
   - Rotate keys regularly

2. **Data Privacy**
   - Implement GDPR compliance for EU users
   - Encrypt sensitive data at rest
   - Use secure connections (HTTPS)

3. **Access Control**
   - Implement role-based access control
   - Audit user activities
   - Monitor API usage

## Monitoring and Analytics

### Key Metrics to Track

1. **Lead Acquisition**
   - New leads per day
   - Lead source performance
   - Lead quality scores

2. **Engagement**
   - Email open rates
   - Response rates
   - Engagement scores

3. **Conversion**
   - Conversion rates
   - Time to conversion
   - Revenue per lead

4. **AI Performance**
   - Analysis accuracy
   - Response generation quality
   - Automation effectiveness

### Recommended Monitoring Tools

1. **Application Monitoring**: New Relic, DataDog
2. **Database Monitoring**: MongoDB Atlas, Compass
3. **API Monitoring**: Postman, Insomnia
4. **Error Tracking**: Sentry, Bugsnag

## Support and Maintenance

### Regular Maintenance Tasks

1. **Database Cleanup**
   - Archive old leads
   - Remove duplicate entries
   - Optimize indexes

2. **AI Model Updates**
   - Monitor OpenAI model updates
   - Test new features
   - Update prompts as needed

3. **Performance Monitoring**
   - Check API response times
   - Monitor memory usage
   - Review error logs

### Getting Help

1. **Documentation**: Check the comprehensive docs in `/docs` folder
2. **API Testing**: Use the test endpoints to verify functionality
3. **Logs**: Check server logs for detailed error information
4. **Community**: Join relevant developer communities for support

---

*This setup guide provides everything needed to get the Lead Management System running successfully. Follow the steps carefully and refer to the troubleshooting section if you encounter any issues.*
