export type UserRole = 'admin' | 'sales_manager' | 'account_manager' | 'sales_rep' | 'customer_success' | 'marketing' | 'support' | 'viewer'

export interface Permission {
  resource: string
  action: string
  conditions?: Record<string, any>
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // User management - Full access
    { resource: 'users', action: 'create' },
    { resource: 'users', action: 'read' },
    { resource: 'users', action: 'update' },
    { resource: 'users', action: 'delete' },
    { resource: 'users', action: 'assign_role' },
    { resource: 'users', action: 'change_password' },
    
    // Lead management - Full access
    { resource: 'leads', action: 'create' },
    { resource: 'leads', action: 'read' },
    { resource: 'leads', action: 'update' },
    { resource: 'leads', action: 'delete' },
    { resource: 'leads', action: 'assign' },
    { resource: 'leads', action: 'transfer' },
    { resource: 'leads', action: 'bulk_update' },
    { resource: 'leads', action: 'export' },
    
    // Analytics - Full access
    { resource: 'analytics', action: 'read' },
    { resource: 'analytics', action: 'export' },
    { resource: 'analytics', action: 'dashboard' },
    
    // Settings - Full access
    { resource: 'settings', action: 'read' },
    { resource: 'settings', action: 'update' },
    { resource: 'settings', action: 'system' },
    
    // Activities - Full access
    { resource: 'activities', action: 'create' },
    { resource: 'activities', action: 'read' },
    { resource: 'activities', action: 'update' },
    { resource: 'activities', action: 'delete' },
    { resource: 'activities', action: 'bulk_create' },
    
    // Assignment Rules - Full access
    { resource: 'assignment-rules', action: 'create' },
    { resource: 'assignment-rules', action: 'read' },
    { resource: 'assignment-rules', action: 'update' },
    { resource: 'assignment-rules', action: 'delete' },
    { resource: 'assignment-rules', action: 'activate' },
    { resource: 'assignment-rules', action: 'deactivate' },
    
    // Assignments - Full access
    { resource: 'assignments', action: 'create' },
    { resource: 'assignments', action: 'read' },
    { resource: 'assignments', action: 'update' },
    { resource: 'assignments', action: 'delete' },
    { resource: 'assignments', action: 'auto_assign' },
    { resource: 'assignments', action: 'manual_assign' },
    { resource: 'assignments', action: 'transfer' },
    
    // Email - Full access
    { resource: 'email', action: 'create' },
    { resource: 'email', action: 'read' },
    { resource: 'email', action: 'update' },
    { resource: 'email', action: 'delete' },
    { resource: 'email', action: 'send' },
    { resource: 'email', action: 'draft' },
    { resource: 'email', action: 'templates' },
    { resource: 'email', action: 'campaigns' },
    
    // AI - Full access
    { resource: 'ai', action: 'create' },
    { resource: 'ai', action: 'read' },
    { resource: 'ai', action: 'update' },
    { resource: 'ai', action: 'delete' },
    { resource: 'ai', action: 'analyze' },
    { resource: 'ai', action: 'generate' },
    { resource: 'ai', action: 'insights' },
    
    // Reports - Full access
    { resource: 'reports', action: 'create' },
    { resource: 'reports', action: 'read' },
    { resource: 'reports', action: 'update' },
    { resource: 'reports', action: 'delete' },
    { resource: 'reports', action: 'export' }
  ],
  
  sales_manager: [
    // User management (limited to sales team)
    { resource: 'users', action: 'read' },
    { resource: 'users', action: 'create', conditions: { role: { $in: ['sales_rep', 'account_manager', 'customer_success', 'viewer'] } } },
    { resource: 'users', action: 'update', conditions: { role: { $in: ['sales_rep', 'account_manager', 'customer_success', 'viewer'] } } },
    { resource: 'users', action: 'delete', conditions: { role: { $in: ['sales_rep', 'account_manager', 'customer_success', 'viewer'] } } },
    { resource: 'users', action: 'assign_role', conditions: { role: { $in: ['sales_rep', 'account_manager', 'customer_success', 'viewer'] } } },
    
    // Lead management - Full access
    { resource: 'leads', action: 'create' },
    { resource: 'leads', action: 'read' },
    { resource: 'leads', action: 'update' },
    { resource: 'leads', action: 'delete' },
    { resource: 'leads', action: 'assign' },
    { resource: 'leads', action: 'transfer' },
    { resource: 'leads', action: 'bulk_update' },
    { resource: 'leads', action: 'export' },
    
    // Analytics - Full access
    { resource: 'analytics', action: 'read' },
    { resource: 'analytics', action: 'export' },
    { resource: 'analytics', action: 'dashboard' },
    
    // Settings - Limited access
    { resource: 'settings', action: 'read' },
    { resource: 'settings', action: 'update' },
    
    // Activities - Full access
    { resource: 'activities', action: 'create' },
    { resource: 'activities', action: 'read' },
    { resource: 'activities', action: 'update' },
    { resource: 'activities', action: 'delete' },
    { resource: 'activities', action: 'bulk_create' },
    
    // Assignment Rules - Full access
    { resource: 'assignment-rules', action: 'create' },
    { resource: 'assignment-rules', action: 'read' },
    { resource: 'assignment-rules', action: 'update' },
    { resource: 'assignment-rules', action: 'delete' },
    { resource: 'assignment-rules', action: 'activate' },
    { resource: 'assignment-rules', action: 'deactivate' },
    
    // Assignments - Full access
    { resource: 'assignments', action: 'create' },
    { resource: 'assignments', action: 'read' },
    { resource: 'assignments', action: 'update' },
    { resource: 'assignments', action: 'delete' },
    { resource: 'assignments', action: 'auto_assign' },
    { resource: 'assignments', action: 'manual_assign' },
    { resource: 'assignments', action: 'transfer' },
    
    // Email - Full access
    { resource: 'email', action: 'create' },
    { resource: 'email', action: 'read' },
    { resource: 'email', action: 'update' },
    { resource: 'email', action: 'delete' },
    { resource: 'email', action: 'send' },
    { resource: 'email', action: 'draft' },
    { resource: 'email', action: 'templates' },
    { resource: 'email', action: 'campaigns' },
    
    // AI - Full access
    { resource: 'ai', action: 'create' },
    { resource: 'ai', action: 'read' },
    { resource: 'ai', action: 'update' },
    { resource: 'ai', action: 'delete' },
    { resource: 'ai', action: 'analyze' },
    { resource: 'ai', action: 'generate' },
    { resource: 'ai', action: 'insights' },
    
    // Reports - Full access
    { resource: 'reports', action: 'create' },
    { resource: 'reports', action: 'read' },
    { resource: 'reports', action: 'update' },
    { resource: 'reports', action: 'delete' },
    { resource: 'reports', action: 'export' }
  ],

  account_manager: [
    // User management - Self only
    { resource: 'users', action: 'read', conditions: { userId: 'self' } },
    { resource: 'users', action: 'update', conditions: { userId: 'self' } },
    { resource: 'users', action: 'change_password', conditions: { userId: 'self' } },
    
    // Lead management - Assigned accounts and leads
    { resource: 'leads', action: 'create' },
    { resource: 'leads', action: 'read', conditions: { assignedTo: 'self' } },
    { resource: 'leads', action: 'update', conditions: { assignedTo: 'self' } },
    { resource: 'leads', action: 'delete', conditions: { assignedTo: 'self' } },
    { resource: 'leads', action: 'export', conditions: { assignedTo: 'self' } },
    
    // Activities - Own activities
    { resource: 'activities', action: 'create' },
    { resource: 'activities', action: 'read', conditions: { createdBy: 'self' } },
    { resource: 'activities', action: 'update', conditions: { createdBy: 'self' } },
    { resource: 'activities', action: 'delete', conditions: { createdBy: 'self' } },
    { resource: 'activities', action: 'bulk_create' },
    
    // Analytics - Own data and team data
    { resource: 'analytics', action: 'read', conditions: { scope: 'team' } },
    { resource: 'analytics', action: 'export', conditions: { scope: 'team' } },
    
    // Email - Own emails
    { resource: 'email', action: 'create' },
    { resource: 'email', action: 'read', conditions: { createdBy: 'self' } },
    { resource: 'email', action: 'update', conditions: { createdBy: 'self' } },
    { resource: 'email', action: 'delete', conditions: { createdBy: 'self' } },
    { resource: 'email', action: 'send' },
    { resource: 'email', action: 'draft' },
    { resource: 'email', action: 'templates' },
    
    // AI - Limited access
    { resource: 'ai', action: 'read' },
    { resource: 'ai', action: 'analyze', conditions: { scope: 'own' } },
    { resource: 'ai', action: 'generate', conditions: { scope: 'own' } },
    { resource: 'ai', action: 'insights', conditions: { scope: 'own' } },
    
    // Reports - Own reports
    { resource: 'reports', action: 'create', conditions: { scope: 'own' } },
    { resource: 'reports', action: 'read', conditions: { createdBy: 'self' } },
    { resource: 'reports', action: 'export', conditions: { createdBy: 'self' } }
  ],

  sales_rep: [
    // User management - Self only
    { resource: 'users', action: 'read', conditions: { userId: 'self' } },
    { resource: 'users', action: 'update', conditions: { userId: 'self' } },
    { resource: 'users', action: 'change_password', conditions: { userId: 'self' } },
    
    // Lead management - Own leads
    { resource: 'leads', action: 'create' },
    { resource: 'leads', action: 'read', conditions: { assignedTo: 'self' } },
    { resource: 'leads', action: 'update', conditions: { assignedTo: 'self' } },
    { resource: 'leads', action: 'delete', conditions: { assignedTo: 'self' } },
    { resource: 'leads', action: 'export', conditions: { assignedTo: 'self' } },
    
    // Activities - Own activities
    { resource: 'activities', action: 'create' },
    { resource: 'activities', action: 'read', conditions: { createdBy: 'self' } },
    { resource: 'activities', action: 'update', conditions: { createdBy: 'self' } },
    { resource: 'activities', action: 'delete', conditions: { createdBy: 'self' } },
    { resource: 'activities', action: 'bulk_create' },
    
    // Analytics - Own data only
    { resource: 'analytics', action: 'read', conditions: { scope: 'own' } },
    { resource: 'analytics', action: 'export', conditions: { scope: 'own' } },
    
    // Email - Own emails
    { resource: 'email', action: 'create' },
    { resource: 'email', action: 'read', conditions: { createdBy: 'self' } },
    { resource: 'email', action: 'update', conditions: { createdBy: 'self' } },
    { resource: 'email', action: 'delete', conditions: { createdBy: 'self' } },
    { resource: 'email', action: 'send' },
    { resource: 'email', action: 'draft' },
    { resource: 'email', action: 'templates' },
    
    // AI - Limited access
    { resource: 'ai', action: 'read' },
    { resource: 'ai', action: 'analyze', conditions: { scope: 'own' } },
    { resource: 'ai', action: 'generate', conditions: { scope: 'own' } },
    { resource: 'ai', action: 'insights', conditions: { scope: 'own' } },
    
    // Reports - Own reports
    { resource: 'reports', action: 'create', conditions: { scope: 'own' } },
    { resource: 'reports', action: 'read', conditions: { createdBy: 'self' } },
    { resource: 'reports', action: 'export', conditions: { createdBy: 'self' } }
  ],

  customer_success: [
    // User management - Self only
    { resource: 'users', action: 'read', conditions: { userId: 'self' } },
    { resource: 'users', action: 'update', conditions: { userId: 'self' } },
    { resource: 'users', action: 'change_password', conditions: { userId: 'self' } },
    
    // Lead management - Customer accounts
    { resource: 'leads', action: 'create' },
    { resource: 'leads', action: 'read', conditions: { assignedTo: 'self' } },
    { resource: 'leads', action: 'update', conditions: { assignedTo: 'self' } },
    { resource: 'leads', action: 'export', conditions: { assignedTo: 'self' } },
    
    // Activities - Own activities
    { resource: 'activities', action: 'create' },
    { resource: 'activities', action: 'read', conditions: { createdBy: 'self' } },
    { resource: 'activities', action: 'update', conditions: { createdBy: 'self' } },
    { resource: 'activities', action: 'delete', conditions: { createdBy: 'self' } },
    { resource: 'activities', action: 'bulk_create' },
    
    // Analytics - Customer success metrics
    { resource: 'analytics', action: 'read', conditions: { scope: 'customer_success' } },
    { resource: 'analytics', action: 'export', conditions: { scope: 'customer_success' } },
    
    // Email - Customer communications
    { resource: 'email', action: 'create' },
    { resource: 'email', action: 'read', conditions: { createdBy: 'self' } },
    { resource: 'email', action: 'update', conditions: { createdBy: 'self' } },
    { resource: 'email', action: 'delete', conditions: { createdBy: 'self' } },
    { resource: 'email', action: 'send' },
    { resource: 'email', action: 'draft' },
    { resource: 'email', action: 'templates' },
    
    // AI - Customer insights
    { resource: 'ai', action: 'read' },
    { resource: 'ai', action: 'analyze', conditions: { scope: 'customer_success' } },
    { resource: 'ai', action: 'generate', conditions: { scope: 'customer_success' } },
    { resource: 'ai', action: 'insights', conditions: { scope: 'customer_success' } },
    
    // Reports - Customer success reports
    { resource: 'reports', action: 'create', conditions: { scope: 'customer_success' } },
    { resource: 'reports', action: 'read', conditions: { createdBy: 'self' } },
    { resource: 'reports', action: 'export', conditions: { createdBy: 'self' } }
  ],

  marketing: [
    // User management - Self only
    { resource: 'users', action: 'read', conditions: { userId: 'self' } },
    { resource: 'users', action: 'update', conditions: { userId: 'self' } },
    { resource: 'users', action: 'change_password', conditions: { userId: 'self' } },
    
    // Lead management - Marketing leads
    { resource: 'leads', action: 'create' },
    { resource: 'leads', action: 'read' },
    { resource: 'leads', action: 'update', conditions: { source: 'marketing' } },
    { resource: 'leads', action: 'export' },
    
    // Activities - Marketing activities
    { resource: 'activities', action: 'create' },
    { resource: 'activities', action: 'read' },
    { resource: 'activities', action: 'update', conditions: { createdBy: 'self' } },
    { resource: 'activities', action: 'delete', conditions: { createdBy: 'self' } },
    { resource: 'activities', action: 'bulk_create' },
    
    // Analytics - Marketing analytics
    { resource: 'analytics', action: 'read' },
    { resource: 'analytics', action: 'export' },
    { resource: 'analytics', action: 'dashboard' },
    
    // Email - Marketing campaigns
    { resource: 'email', action: 'create' },
    { resource: 'email', action: 'read' },
    { resource: 'email', action: 'update' },
    { resource: 'email', action: 'delete' },
    { resource: 'email', action: 'send' },
    { resource: 'email', action: 'draft' },
    { resource: 'email', action: 'templates' },
    { resource: 'email', action: 'campaigns' },
    
    // AI - Marketing insights
    { resource: 'ai', action: 'read' },
    { resource: 'ai', action: 'analyze' },
    { resource: 'ai', action: 'generate' },
    { resource: 'ai', action: 'insights' },
    
    // Reports - Marketing reports
    { resource: 'reports', action: 'create' },
    { resource: 'reports', action: 'read' },
    { resource: 'reports', action: 'update' },
    { resource: 'reports', action: 'delete' },
    { resource: 'reports', action: 'export' }
  ],

  support: [
    // User management - Self only
    { resource: 'users', action: 'read', conditions: { userId: 'self' } },
    { resource: 'users', action: 'update', conditions: { userId: 'self' } },
    { resource: 'users', action: 'change_password', conditions: { userId: 'self' } },
    
    // Lead management - Support tickets and leads
    { resource: 'leads', action: 'create' },
    { resource: 'leads', action: 'read' },
    { resource: 'leads', action: 'update', conditions: { type: 'support' } },
    { resource: 'leads', action: 'export' },
    
    // Activities - Support activities
    { resource: 'activities', action: 'create' },
    { resource: 'activities', action: 'read' },
    { resource: 'activities', action: 'update', conditions: { createdBy: 'self' } },
    { resource: 'activities', action: 'delete', conditions: { createdBy: 'self' } },
    { resource: 'activities', action: 'bulk_create' },
    
    // Analytics - Support metrics
    { resource: 'analytics', action: 'read', conditions: { scope: 'support' } },
    { resource: 'analytics', action: 'export', conditions: { scope: 'support' } },
    
    // Email - Support communications
    { resource: 'email', action: 'create' },
    { resource: 'email', action: 'read' },
    { resource: 'email', action: 'update', conditions: { createdBy: 'self' } },
    { resource: 'email', action: 'delete', conditions: { createdBy: 'self' } },
    { resource: 'email', action: 'send' },
    { resource: 'email', action: 'draft' },
    { resource: 'email', action: 'templates' },
    
    // AI - Support insights
    { resource: 'ai', action: 'read' },
    { resource: 'ai', action: 'analyze', conditions: { scope: 'support' } },
    { resource: 'ai', action: 'generate', conditions: { scope: 'support' } },
    { resource: 'ai', action: 'insights', conditions: { scope: 'support' } },
    
    // Reports - Support reports
    { resource: 'reports', action: 'create', conditions: { scope: 'support' } },
    { resource: 'reports', action: 'read', conditions: { createdBy: 'self' } },
    { resource: 'reports', action: 'export', conditions: { createdBy: 'self' } }
  ],
  
  
  viewer: [
    // User management - Self only (read-only)
    { resource: 'users', action: 'read', conditions: { userId: 'self' } },
    
    // Lead management - Read-only access
    { resource: 'leads', action: 'read' },
    
    // Activities - Read-only access
    { resource: 'activities', action: 'read' },
    
    // Analytics - Read-only access
    { resource: 'analytics', action: 'read' },
    
    // Email - Read-only access
    { resource: 'email', action: 'read' },
    
    // AI - Read-only access
    { resource: 'ai', action: 'read' },
    
    // Reports - Read-only access
    { resource: 'reports', action: 'read' }
  ]
}

export function hasPermission(
  userRole: UserRole,
  resource: string,
  action: string,
  context?: Record<string, any>
): boolean {
  // Admin users have full access to everything
  if (userRole === 'admin') {
    return true
  }

  const permissions = ROLE_PERMISSIONS[userRole] || []
  
  const permission = permissions.find(
    p => p.resource === resource && p.action === action
  )
  
  if (!permission) {
    return false
  }
  
  // Check conditions if they exist
  if (permission.conditions && context) {
    for (const [key, value] of Object.entries(permission.conditions)) {
      if (value === 'self') {
        // Check if the user is accessing their own resource
        if (context.userId !== context.resourceUserId) {
          return false
        }
      } else if (typeof value === 'object' && value.$in) {
        // Check if the value is in the allowed array
        if (!value.$in.includes(context[key])) {
          return false
        }
      } else if (context[key] !== value) {
        return false
      }
    }
  }
  
  return true
}

export function checkPermission(
  userRole: UserRole,
  resource: string,
  action: string,
  context?: Record<string, any>
): void {
  if (!hasPermission(userRole, resource, action, context)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Insufficient permissions'
    })
  }
}

export function getAccessibleResources(userRole: UserRole): string[] {
  // Admin users have access to all resources
  if (userRole === 'admin') {
    return ['leads', 'users', 'analytics', 'activities', 'settings', 'emails', 'assignments', 'ai']
  }

  const permissions = ROLE_PERMISSIONS[userRole] || []
  const resources = new Set(permissions.map(p => p.resource))
  return Array.from(resources)
}

export function getResourceActions(userRole: UserRole, resource: string): string[] {
  // Admin users have access to all actions for all resources
  if (userRole === 'admin') {
    return ['create', 'read', 'update', 'delete']
  }

  const permissions = ROLE_PERMISSIONS[userRole] || []
  return permissions
    .filter(p => p.resource === resource)
    .map(p => p.action)
}
