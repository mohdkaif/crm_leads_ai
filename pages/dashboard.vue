<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p class="text-gray-600">Welcome back! Here's what's happening with your CRM.</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <Icon name="heroicons:arrow-path" class="w-8 h-8 animate-spin text-blue-600" />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-600">{{ error }}</p>
      </div>

      <!-- Dashboard Content -->
      <div v-else-if="analytics">
        <!-- Key Metrics -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="p-3 rounded-full bg-blue-100 text-blue-600">
                  <Icon name="heroicons:users" class="w-6 h-6" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Total Leads</p>
                  <p class="text-2xl font-bold text-gray-900">{{ analytics.metrics.totalLeads }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="p-3 rounded-full bg-green-100 text-green-600">
                  <Icon name="heroicons:check-circle" class="w-6 h-6" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Converted</p>
                  <p class="text-2xl font-bold text-gray-900">{{ analytics.metrics.convertedLeads }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <Icon name="heroicons:currency-dollar" class="w-6 h-6" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Total Value</p>
                  <p class="text-2xl font-bold text-gray-900">${{ formatNumber(analytics.metrics.totalValue) }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="p-3 rounded-full bg-purple-100 text-purple-600">
                  <Icon name="heroicons:chart-bar" class="w-6 h-6" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p class="text-2xl font-bold text-gray-900">{{ analytics.metrics.conversionRate.toFixed(1) }}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <!-- Lead Sources Chart -->
          <div class="card">
            <div class="card-header">
              <h3 class="text-lg font-semibold text-gray-900">Lead Sources</h3>
            </div>
            <div class="card-body">
              <div class="space-y-4">
                <div 
                  v-for="source in analytics.leadSources" 
                  :key="source.source"
                  class="flex items-center justify-between"
                >
                  <div class="flex items-center">
                    <div class="w-4 h-4 rounded-full mr-3" :style="{ backgroundColor: getSourceColor(source.source) }"></div>
                    <span class="text-sm font-medium text-gray-900 capitalize">{{ source.source.replace('_', ' ') }}</span>
                  </div>
                  <div class="flex items-center">
                    <span class="text-sm text-gray-600 mr-2">{{ source.count }}</span>
                    <div class="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        class="h-2 rounded-full" 
                        :style="{ 
                          width: `${(source.count / Math.max(...analytics.leadSources.map(s => s.count))) * 100}%`,
                          backgroundColor: getSourceColor(source.source) 
                        }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Activities -->
          <div class="card">
            <div class="card-header">
              <h3 class="text-lg font-semibold text-gray-900">Recent Activities</h3>
            </div>
            <div class="card-body">
              <div class="space-y-4">
                <div 
                  v-for="activity in analytics.recentActivities.slice(0, 5)" 
                  :key="activity._id"
                  class="flex items-center space-x-4"
                >
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Icon :name="getActivityIcon(activity.type)" class="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900">{{ activity.title }}</p>
                    <p class="text-sm text-gray-500">
                      {{ activity.leadId ? `${activity.leadId.firstName} ${activity.leadId.lastName}` : 'No lead' }}
                    </p>
                  </div>
                  <div class="text-sm text-gray-500">{{ formatDate(activity.createdAt) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div class="card-body">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <NuxtLink to="/leads/new" class="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <Icon name="heroicons:plus-circle" class="w-6 h-6 text-blue-600 mr-3" />
                <span class="text-blue-800 font-medium">Add New Lead</span>
              </NuxtLink>
              
              <NuxtLink to="/leads" class="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <Icon name="heroicons:users" class="w-6 h-6 text-green-600 mr-3" />
                <span class="text-green-800 font-medium">View All Leads</span>
              </NuxtLink>
              
              <NuxtLink to="/analytics" class="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <Icon name="heroicons:chart-bar" class="w-6 h-6 text-purple-600 mr-3" />
                <span class="text-purple-800 font-medium">View Analytics</span>
              </NuxtLink>
              
              <NuxtLink to="/ai-insights" class="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <Icon name="heroicons:sparkles" class="w-6 h-6 text-orange-600 mr-3" />
                <span class="text-orange-800 font-medium">AI Insights</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Reactive data
const loading = ref(true)
const error = ref('')
const analytics = ref(null)

// Methods
const loadAnalytics = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const token = useCookie('auth-token')
    if (!token.value) {
      throw new Error('Authentication required')
    }

    const response = await $fetch('/api/analytics/dashboard', {
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })
    
    if (response.success) {
      analytics.value = response.data
    } else {
      throw new Error('Failed to load analytics data')
    }
  } catch (err) {
    console.error('Error loading analytics:', err)
    error.value = err.message || 'Failed to load analytics data'
  } finally {
    loading.value = false
  }
}

const getSourceColor = (source) => {
  const colors = {
    website: '#3B82F6',
    social_media: '#10B981',
    email: '#F59E0B',
    referral: '#8B5CF6',
    cold_call: '#EF4444',
    event: '#06B6D4',
    other: '#6B7280'
  }
  return colors[source] || '#6B7280'
}

const getActivityIcon = (type) => {
  const icons = {
    follow_up: 'heroicons:phone',
    call: 'heroicons:phone',
    email: 'heroicons:envelope',
    meeting: 'heroicons:calendar',
    note: 'heroicons:document-text',
    task: 'heroicons:check-circle'
  }
  return icons[type] || 'heroicons:clock'
}

const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const formatDate = (date) => {
  const now = new Date()
  const activityDate = new Date(date)
  const diffInHours = Math.floor((now - activityDate) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  
  return activityDate.toLocaleDateString()
}

// Lifecycle
onMounted(() => {
  loadAnalytics()
})

// Meta
definePageMeta({
  layout: 'default',
  auth: true
})
</script>