export const useAuth = () => {
  const user = ref(null)
  const loading = ref(false)

  const login = async (credentials: { email: string; password: string; remember?: boolean }) => {
    try {
      loading.value = true
      const response = await $fetch('/api/auth/login', {
        method: 'POST',
        body: credentials
      })
      
      if (response.success) {
        // Store authentication token in both cookie and localStorage
        const token = useCookie('auth-token', {
          maxAge: credentials.remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7, // 30 days or 7 days
          secure: false, // Changed to false for local development
          sameSite: 'lax' // Changed to lax for better compatibility
        })
        token.value = response.token
        
        // Also store in localStorage as backup
        if (process.client) {
          localStorage.setItem('auth-token', response.token)
        }
        
        user.value = response.user
        return response
      }
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  const register = async (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    role?: string
  }) => {
    try {
      loading.value = true
      const response = await $fetch('/api/auth/register', {
        method: 'POST',
        body: userData
      })
      
      if (response.success) {
        user.value = response.user
        return response
      }
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
      
      // Clear authentication token from both cookie and localStorage
      const token = useCookie('auth-token')
      token.value = null
      
      // Clear from localStorage as well
      if (process.client) {
        localStorage.removeItem('auth-token')
      }
      
      user.value = null
      await navigateTo('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const fetchUser = async () => {
    try {
      const token = useCookie('auth-token')
      
      // Fallback to localStorage if cookie is not available
      if (!token.value && process.client) {
        const localToken = localStorage.getItem('auth-token')
        if (localToken) {
          token.value = localToken
        }
      }
      
      if (!token.value) {
        user.value = null
        return null
      }
      
      const response = await $fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })
      
      if (response.success) {
        user.value = response.user
        return response.user
      }
    } catch (error) {
      user.value = null
      // Clear invalid token from both cookie and localStorage
      const token = useCookie('auth-token')
      token.value = null
      if (process.client) {
        localStorage.removeItem('auth-token')
      }
      throw error
    }
  }

  const isAuthenticated = computed(() => !!user.value)

  const hasRole = (role: string) => {
    return user.value?.role === role
  }

  const hasAnyRole = (roles: string[]) => {
    return roles.includes(user.value?.role)
  }

  const isAdmin = computed(() => user.value?.role === 'admin')

  const hasPermission = (resource: string, action: string) => {
    // Admin users have full access to everything
    if (user.value?.role === 'admin') {
      return true
    }
    
    // For non-admin users, you can implement more granular permission checks here
    // For now, we'll use role-based checks
    const role = user.value?.role
    
    switch (role) {
      case 'manager':
        return ['leads', 'users', 'analytics', 'activities'].includes(resource)
      case 'sales':
        return ['leads', 'activities'].includes(resource) && action !== 'delete'
      case 'viewer':
        return ['leads', 'activities', 'analytics'].includes(resource) && action === 'read'
      default:
        return false
    }
  }

  return {
    user: readonly(user),
    loading: readonly(loading),
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    fetchUser,
    hasRole,
    hasAnyRole,
    hasPermission
  }
}
