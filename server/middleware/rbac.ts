import { checkPermission } from '../utils/rbac'

export default defineEventHandler(async (event) => {
  // Only apply RBAC middleware to API routes
  if (!event.node.req.url?.startsWith('/api/')) {
    return
  }

  // Skip RBAC check for auth routes
  if (event.node.req.url?.startsWith('/api/auth/')) {
    return
  }

  // Skip RBAC check for test routes
  if (event.node.req.url?.startsWith('/api/test-')) {
    return
  }

  const user = event.context.user
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  // Admin users have full access - skip all permission checks
  if (user.role === 'admin') {
    return
  }

  const method = event.node.req.method
  const url = event.node.req.url

  // Map HTTP methods to actions
  const methodToAction: Record<string, string> = {
    'GET': 'read',
    'POST': 'create',
    'PUT': 'update',
    'PATCH': 'update',
    'DELETE': 'delete'
  }

  const action = methodToAction[method]
  if (!action) {
    return
  }

  // Extract resource from URL
  let resource = ''
  if (url?.startsWith('/api/leads')) {
    resource = 'leads'
  } else if (url?.startsWith('/api/users')) {
    resource = 'users'
  } else if (url?.startsWith('/api/analytics')) {
    resource = 'analytics'
  } else if (url?.startsWith('/api/activities')) {
    resource = 'activities'
  } else if (url?.startsWith('/api/settings')) {
    resource = 'settings'
  } else if (url?.startsWith('/api/assignment-rules')) {
    resource = 'assignment-rules'
  } else if (url?.startsWith('/api/assignments')) {
    resource = 'assignments'
  } else if (url?.startsWith('/api/email')) {
    resource = 'email'
  } else if (url?.startsWith('/api/ai')) {
    resource = 'ai'
  }

  if (resource) {
    // Prepare context for permission checking
    const context: Record<string, any> = {
      userId: user._id,
      userRole: user.role
    }

    // For specific resource access, add resource-specific context
    if (url?.includes('/') && !url.endsWith('/')) {
      const resourceId = url.split('/').pop()
      if (resourceId && resourceId !== 'me') {
        context.resourceId = resourceId
      }
    }

    checkPermission(user.role, resource, action, context)
  }
})
