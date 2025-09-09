# Role-Based Access Control (RBAC) Documentation

## Overview

This CRM system implements a comprehensive Role-Based Access Control (RBAC) system that manages user permissions and access to different resources based on their assigned roles. The system ensures data security and proper access control across all features.

## User Roles

### 1. Admin
**Full system access with complete control over all resources**

**Permissions:**
- **User Management**: Create, Read, Update, Delete all users
- **Lead Management**: Full CRUD operations on all leads
- **Analytics**: Access to all analytics and reports
- **Settings**: Read and update system settings
- **Activities**: Full CRUD operations on all activities

**Use Cases:**
- System administrators
- Company owners
- IT managers

### 2. Manager
**Management-level access with team oversight capabilities**

**Permissions:**
- **User Management**: Read all users, update sales and viewer roles only
- **Lead Management**: Full CRUD operations on all leads
- **Analytics**: Access to all analytics and reports
- **Activities**: Full CRUD operations on all activities

**Use Cases:**
- Sales managers
- Team leads
- Department heads

### 3. Sales
**Sales-focused access with limited scope to own resources**

**Permissions:**
- **Lead Management**: 
  - Create new leads
  - Read, Update, Delete only assigned leads (`assignedTo: self`)
- **Activities**: 
  - Create activities
  - Read, Update, Delete only own activities (`createdBy: self`)
- **Analytics**: Limited access to own data only (`scope: own`)

**Use Cases:**
- Sales representatives
- Account managers
- Business development executives

### 4. Viewer
**Read-only access for monitoring and reporting**

**Permissions:**
- **Lead Management**: Read-only access to all leads
- **Activities**: Read-only access to all activities
- **Analytics**: Read-only access to all analytics

**Use Cases:**
- Executives
- Stakeholders
- Reporting personnel

### 5. User
**Basic user role (default for new registrations)**

**Permissions:**
- Similar to Sales role but with additional restrictions
- Limited to own resources only

## Permission System

### Permission Structure
```typescript
interface Permission {
  resource: string    // Resource being accessed (leads, users, analytics, etc.)
  action: string      // Action being performed (create, read, update, delete)
  conditions?: Record<string, any>  // Additional conditions for access
}
```

### Resource Types
- **users**: User management
- **leads**: Lead management
- **analytics**: Analytics and reporting
- **settings**: System settings
- **activities**: Activity management

### Actions
- **create**: Create new resources
- **read**: View/read resources
- **update**: Modify existing resources
- **delete**: Remove resources

### Conditions
- **self**: Access only to own resources
- **role restrictions**: Access limited to specific user roles
- **scope limitations**: Access limited to specific data scope

## Implementation Details

### 1. Authentication Middleware
```typescript
// server/middleware/auth.ts
export default defineEventHandler(async (event) => {
  // Validates JWT token
  // Checks user status (active/inactive)
  // Sets user context for API routes
})
```

### 2. Permission Checking
```typescript
// server/utils/rbac.ts
export function hasPermission(
  userRole: UserRole,
  resource: string,
  action: string,
  context?: Record<string, any>
): boolean

export function checkPermission(
  userRole: UserRole,
  resource: string,
  action: string,
  context?: Record<string, any>
): void
```

### 3. Database-Level Security
- **Lead Access**: Users can only access leads where they are `assignedTo` or `createdBy`
- **Activity Access**: Users can only access activities where they are `createdBy` or `assignedTo`
- **User Access**: Role-based restrictions on user management operations

## Security Features

### 1. JWT Token Authentication
- Secure token-based authentication
- Token expiration handling
- Automatic token refresh

### 2. Password Security
- Bcrypt hashing with salt rounds (12)
- Minimum password length (6 characters)
- Password comparison methods

### 3. User Status Management
- Active/Inactive user status
- Account deactivation capabilities
- Last login tracking

### 4. API Protection
- All API endpoints require authentication
- Role-based access control on all operations
- Input validation and sanitization

## Usage Examples

### Checking Permissions
```typescript
// Check if user can read leads
const canReadLeads = hasPermission(userRole, 'leads', 'read')

// Check if user can update own leads
const canUpdateOwnLeads = hasPermission(userRole, 'leads', 'update', {
  userId: currentUserId,
  resourceUserId: lead.assignedTo
})
```

### Enforcing Permissions
```typescript
// Throw error if user lacks permission
checkPermission(userRole, 'users', 'delete', {
  userId: currentUserId,
  resourceUserId: targetUserId
})
```

### Getting Accessible Resources
```typescript
// Get all resources user can access
const accessibleResources = getAccessibleResources(userRole)

// Get all actions user can perform on a resource
const leadActions = getResourceActions(userRole, 'leads')
```

## Frontend Integration

### 1. Route Protection
```typescript
// pages/users.vue
definePageMeta({
  layout: 'default',
  auth: true  // Requires authentication
})
```

### 2. Component-Level Access Control
```vue
<template>
  <div v-if="canManageUsers">
    <button @click="addUser">Add User</button>
  </div>
</template>

<script setup>
const { user } = useAuth()
const canManageUsers = computed(() => 
  hasPermission(user.value.role, 'users', 'create')
)
</script>
```

### 3. API Integration
```typescript
// Automatic token inclusion in API calls
const response = await $fetch('/api/leads', {
  headers: {
    'Authorization': `Bearer ${authToken}`
  }
})
```

## Best Practices

### 1. Principle of Least Privilege
- Users are granted minimum necessary permissions
- Role-based restrictions prevent unauthorized access
- Regular permission audits

### 2. Data Isolation
- Users can only access their assigned resources
- Cross-user data access is strictly controlled
- Audit trails for all data access

### 3. Security Monitoring
- All API calls are logged
- Failed authentication attempts are tracked
- User activity monitoring

### 4. Regular Updates
- Permission matrix is regularly reviewed
- Role definitions are updated based on business needs
- Security patches are applied promptly

## Configuration

### Environment Variables
```env
JWT_SECRET=your-secret-key
MONGODB_URI=mongodb://localhost:27017/crm_leads_ai
```

### Role Configuration
Roles and permissions are defined in `server/utils/rbac.ts` and can be modified based on business requirements.

### User Model Configuration
User roles are defined in the User schema and can be extended as needed.

## Troubleshooting

### Common Issues
1. **403 Forbidden**: User lacks required permissions
2. **401 Unauthorized**: Invalid or expired token
3. **User not found**: User account is inactive or deleted

### Debugging
- Check user role and permissions
- Verify JWT token validity
- Confirm user status is active
- Review API endpoint permissions

## Future Enhancements

### Planned Features
1. **Dynamic Role Management**: Admin interface for role modification
2. **Permission Groups**: Group-based permission management
3. **Time-based Access**: Temporary permission grants
4. **Audit Logging**: Comprehensive access logging
5. **Multi-tenant Support**: Organization-level access control

---

*This documentation is maintained alongside the codebase and should be updated when RBAC features are modified or extended.*
