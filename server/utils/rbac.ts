export type UserRole = 'admin' | 'manager' | 'sales' | 'viewer'

export interface Permission {
  resource: string
  action: string
  conditions?: Record<string, any>
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // User management
    { resource: 'users', action: 'create' },
    { resource: 'users', action: 'read' },
    { resource: 'users', action: 'update' },
    { resource: 'users', action: 'delete' },
    
    // Lead management
    { resource: 'leads', action: 'create' },
    { resource: 'leads', action: 'read' },
    { resource: 'leads', action: 'update' },
    { resource: 'leads', action: 'delete' },
    
    // Analytics
    { resource: 'analytics', action: 'read' },
    
    // Settings
    { resource: 'settings', action: 'read' },
    { resource: 'settings', action: 'update' },
    
    // Activities
    { resource: 'activities', action: 'create' },
    { resource: 'activities', action: 'read' },
    { resource: 'activities', action: 'update' },
    { resource: 'activities', action: 'delete' }
  ],
  
  manager: [
    // User management (limited)
    { resource: 'users', action: 'read' },
    { resource: 'users', action: 'update', conditions: { role: { $in: ['sales', 'viewer'] } } },
    
    // Lead management
    { resource: 'leads', action: 'create' },
    { resource: 'leads', action: 'read' },
    { resource: 'leads', action: 'update' },
    { resource: 'leads', action: 'delete' },
    
    // Analytics
    { resource: 'analytics', action: 'read' },
    
    // Activities
    { resource: 'activities', action: 'create' },
    { resource: 'activities', action: 'read' },
    { resource: 'activities', action: 'update' },
    { resource: 'activities', action: 'delete' }
  ],
  
  sales: [
    // Lead management (own leads)
    { resource: 'leads', action: 'create' },
    { resource: 'leads', action: 'read', conditions: { assignedTo: 'self' } },
    { resource: 'leads', action: 'update', conditions: { assignedTo: 'self' } },
    { resource: 'leads', action: 'delete', conditions: { assignedTo: 'self' } },
    
    // Activities (own activities)
    { resource: 'activities', action: 'create' },
    { resource: 'activities', action: 'read', conditions: { createdBy: 'self' } },
    { resource: 'activities', action: 'update', conditions: { createdBy: 'self' } },
    { resource: 'activities', action: 'delete', conditions: { createdBy: 'self' } },
    
    // Limited analytics
    { resource: 'analytics', action: 'read', conditions: { scope: 'own' } }
  ],
  
  viewer: [
    // Read-only access
    { resource: 'leads', action: 'read' },
    { resource: 'activities', action: 'read' },
    { resource: 'analytics', action: 'read' }
  ]
}

export function hasPermission(
  userRole: UserRole,
  resource: string,
  action: string,
  context?: Record<string, any>
): boolean {
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
  const permissions = ROLE_PERMISSIONS[userRole] || []
  const resources = new Set(permissions.map(p => p.resource))
  return Array.from(resources)
}

export function getResourceActions(userRole: UserRole, resource: string): string[] {
  const permissions = ROLE_PERMISSIONS[userRole] || []
  return permissions
    .filter(p => p.resource === resource)
    .map(p => p.action)
}
