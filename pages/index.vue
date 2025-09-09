<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold text-center text-gray-900 mb-8">
        🚀 CRM Leads AI
      </h1>
      
      <div class="max-w-4xl mx-auto">
        <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 class="text-2xl font-semibold text-gray-800 mb-4">Welcome to Your AI-Powered CRM</h2>
          <p class="text-gray-600 mb-6">
            A comprehensive lead management system with AI insights, analytics, and modern UI.
          </p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-blue-50 p-6 rounded-lg">
              <h3 class="text-lg font-semibold text-blue-800 mb-2">📊 Analytics</h3>
              <p class="text-blue-600">Real-time insights and performance metrics</p>
            </div>
            
            <div class="bg-green-50 p-6 rounded-lg">
              <h3 class="text-lg font-semibold text-green-800 mb-2">🤖 AI Features</h3>
              <p class="text-green-600">Lead scoring and smart recommendations</p>
            </div>
            
            <div class="bg-purple-50 p-6 rounded-lg">
              <h3 class="text-lg font-semibold text-purple-800 mb-2">👥 User Management</h3>
              <p class="text-purple-600">Role-based access control system</p>
            </div>
            
            <div class="bg-orange-50 p-6 rounded-lg">
              <h3 class="text-lg font-semibold text-orange-800 mb-2">📈 Lead Tracking</h3>
              <p class="text-orange-600">Complete lead lifecycle management</p>
            </div>
          </div>
          
          <div class="flex flex-col sm:flex-row gap-4">
            <NuxtLink 
              to="/login" 
              class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              🔐 Login
            </NuxtLink>
            <NuxtLink 
              to="/register" 
              class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors text-center"
            >
              ✨ Register
            </NuxtLink>
            <button 
              @click="testAPI" 
              class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              🧪 Test API
            </button>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-lg p-8">
          <h2 class="text-2xl font-semibold text-gray-800 mb-4">API Endpoints</h2>
          <div class="space-y-2 text-sm">
            <div class="flex items-center gap-2">
              <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono">GET</span>
              <code>/api/auth/me</code>
              <span class="text-gray-500">- Get current user</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">POST</span>
              <code>/api/auth/login</code>
              <span class="text-gray-500">- User login</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">POST</span>
              <code>/api/auth/register</code>
              <span class="text-gray-500">- User registration</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono">GET</span>
              <code>/api/leads</code>
              <span class="text-gray-500">- Get all leads</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono">GET</span>
              <code>/api/analytics/dashboard</code>
              <span class="text-gray-500">- Dashboard metrics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Reactive data
const user = ref(null)
const loading = ref(true)

// Methods
const checkAuth = async () => {
  try {
    const token = useCookie('auth-token')
    if (token.value) {
      const response = await $fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })
      
      if (response.success) {
        user.value = response.user
        // Redirect to dashboard if authenticated
        await navigateTo('/dashboard')
        return
      }
    }
  } catch (error) {
    console.error('Auth check error:', error)
  } finally {
    loading.value = false
  }
}

const testAPI = async () => {
  try {
    const response = await $fetch('/api/auth/me')
    alert('API is working! Response: ' + JSON.stringify(response, null, 2))
  } catch (error) {
    alert('API Error: ' + error.message)
  }
}

// Lifecycle
onMounted(() => {
  checkAuth()
})
</script>