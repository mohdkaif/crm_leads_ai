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
  const { success, error: showError } = useAlert()
  try {
    const response = await $fetch('/api/auth/me')
    await success('API is working!', 'Response: ' + JSON.stringify(response, null, 2))
  } catch (error) {
    await showError('API Error', error.message)
  }
}

// Lifecycle
onMounted(() => {
  checkAuth()
})
</script>