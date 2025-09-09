# API Reference Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

All API endpoints (except authentication endpoints) require a valid JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

## Authentication Endpoints

### POST /api/auth/login
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin"
    },
    "token": "jwt_token_here"
  }
}
```

### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com",
  "password": "password123",
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user"
    }
  }
}
```

### GET /api/auth/me
Get current user information.

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin",
      "status": "active"
    }
  }
}
```

### POST /api/auth/logout
Logout current user.

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Lead Management Endpoints

### GET /api/leads
Get all leads with pagination and filtering.

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search term
- `status` (string): Filter by status
- `priority` (string): Filter by priority
- `source` (string): Filter by source
- `assignedTo` (string): Filter by assigned user

**Response:**
```json
{
  "success": true,
  "data": {
    "leads": [
      {
        "_id": "lead_id",
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane@example.com",
        "company": "Acme Corp",
        "status": "new",
        "priority": "high",
        "source": "website",
        "value": 50000,
        "assignedTo": "user_id",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

### POST /api/leads
Create a new lead.

**Headers:**
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "company": "Acme Corp",
  "jobTitle": "CEO",
  "industry": "Technology",
  "source": "website",
  "status": "new",
  "priority": "high",
  "value": 50000,
  "currency": "USD",
  "expectedCloseDate": "2024-12-31",
  "notes": "Interested in our premium package",
  "tags": ["enterprise", "high-value"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "lead": {
      "_id": "lead_id",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "company": "Acme Corp",
      "status": "new",
      "priority": "high",
      "source": "website",
      "value": 50000,
      "assignedTo": "user_id",
      "createdBy": "user_id",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### GET /api/leads/[id]
Get a specific lead by ID.

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "lead": {
      "_id": "lead_id",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "company": "Acme Corp",
      "status": "new",
      "priority": "high",
      "source": "website",
      "value": 50000,
      "assignedTo": "user_id",
      "createdBy": "user_id",
      "activities": [],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### PUT /api/leads/[id]
Update a specific lead.

**Headers:**
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "contacted",
  "priority": "medium",
  "notes": "Initial contact made, follow-up scheduled"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "lead": {
      "_id": "lead_id",
      "firstName": "Jane",
      "lastName": "Smith",
      "status": "contacted",
      "priority": "medium",
      "notes": "Initial contact made, follow-up scheduled",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

### DELETE /api/leads/[id]
Delete a specific lead.

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Lead deleted successfully"
}
```

## Activity Management Endpoints

### GET /api/activities
Get all activities with pagination and filtering.

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `type` (string): Filter by activity type
- `leadId` (string): Filter by lead ID
- `startDate` (string): Filter by start date
- `endDate` (string): Filter by end date

**Response:**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "_id": "activity_id",
        "type": "call",
        "title": "Initial contact call",
        "description": "Called lead to introduce our services",
        "leadId": "lead_id",
        "createdBy": "user_id",
        "dueDate": "2024-01-01T00:00:00.000Z",
        "isCompleted": true,
        "priority": "high",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    }
  }
}
```

### POST /api/activities
Create a new activity.

**Headers:**
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": "call",
  "title": "Follow-up call",
  "description": "Call to discuss proposal details",
  "leadId": "lead_id",
  "dueDate": "2024-01-15T14:00:00.000Z",
  "priority": "high"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "activity": {
      "_id": "activity_id",
      "type": "call",
      "title": "Follow-up call",
      "description": "Call to discuss proposal details",
      "leadId": "lead_id",
      "createdBy": "user_id",
      "dueDate": "2024-01-15T14:00:00.000Z",
      "isCompleted": false,
      "priority": "high",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

## Analytics Endpoints

### GET /api/analytics/dashboard
Get dashboard analytics data.

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalLeads": 150,
    "newLeads": 25,
    "convertedLeads": 30,
    "conversionRate": 20.0,
    "totalValue": 1500000,
    "averageDealSize": 50000,
    "leadSources": {
      "website": 60,
      "referral": 40,
      "social_media": 30,
      "email": 20
    },
    "statusBreakdown": {
      "new": 50,
      "contacted": 40,
      "qualified": 30,
      "proposal": 20,
      "closed_won": 30,
      "closed_lost": 10
    },
    "recentActivities": [
      {
        "_id": "activity_id",
        "type": "call",
        "title": "Follow-up call",
        "leadId": "lead_id",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

## AI Insights Endpoints

### GET /api/ai/insights
Get AI-powered insights and recommendations.

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "insights": [
      {
        "type": "warning",
        "title": "Low Conversion Rate",
        "message": "Your conversion rate is 15.2%. Consider improving your follow-up process.",
        "action": "Review follow-up strategies",
        "priority": "high"
      }
    ],
    "recommendations": [
      {
        "title": "Improve Follow-up Speed",
        "description": "Consider following up with leads within 24-48 hours for better conversion rates.",
        "impact": "high"
      }
    ],
    "summary": {
      "totalLeads": 150,
      "conversionRate": 15.2,
      "activeLeads": 120,
      "totalValue": 1500000
    }
  }
}
```

### POST /api/ai/analyze-lead
Analyze a specific lead with AI.

**Headers:**
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "leadId": "lead_id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "aiScore": 85,
    "sentiment": "positive",
    "engagement": "high",
    "urgency": "medium",
    "recommendations": [
      "Schedule a demo call within 48 hours",
      "Focus on ROI benefits in your pitch"
    ]
  }
}
```

## User Management Endpoints

### GET /api/users
Get all users (Admin only).

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search term
- `role` (string): Filter by role
- `status` (string): Filter by status

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "user_id",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "role": "admin",
        "status": "active",
        "department": "Sales",
        "jobTitle": "Sales Manager",
        "lastLogin": "2024-01-01T00:00:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### POST /api/users
Create a new user (Admin only).

**Headers:**
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "password": "password123",
  "role": "sales",
  "department": "Sales",
  "jobTitle": "Sales Representative",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "role": "sales",
      "status": "active",
      "department": "Sales",
      "jobTitle": "Sales Representative",
      "createdBy": "admin_user_id",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### PUT /api/users/[id]
Update a specific user (Admin only).

**Headers:**
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "manager",
  "department": "Sales",
  "jobTitle": "Sales Manager",
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "firstName": "Jane",
      "lastName": "Smith",
      "role": "manager",
      "department": "Sales",
      "jobTitle": "Sales Manager",
      "status": "active",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

### DELETE /api/users/[id]
Delete a specific user (Admin only).

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### PUT /api/users/me
Update current user profile.

**Headers:**
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "department": "Sales",
  "jobTitle": "Sales Manager"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890",
      "department": "Sales",
      "jobTitle": "Sales Manager",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

### POST /api/users/change-password
Change current user password.

**Headers:**
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

## Error Codes

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

### Common Error Messages
- `"Access token required"` - Missing or invalid JWT token
- `"Invalid token"` - Expired or malformed JWT token
- `"User not found"` - User doesn't exist or is inactive
- `"Insufficient permissions"` - User lacks required permissions
- `"Email already exists"` - Email is already registered
- `"Invalid credentials"` - Wrong email or password
- `"Lead not found"` - Lead doesn't exist or user can't access it
- `"Activity not found"` - Activity doesn't exist or user can't access it

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **Authentication endpoints**: 5 requests per minute per IP
- **Other endpoints**: 100 requests per minute per user

## Pagination

Most list endpoints support pagination:
- `page`: Page number (starts from 1)
- `limit`: Items per page (default: 10, max: 100)
- `total`: Total number of items
- `pages`: Total number of pages

## Filtering and Search

Many endpoints support filtering and search:
- **Search**: Text search across relevant fields
- **Filters**: Filter by specific field values
- **Date ranges**: Filter by date ranges
- **Sorting**: Sort by specific fields (ascending/descending)

---

*This API reference is maintained alongside the codebase and should be updated when endpoints are modified or added.*
