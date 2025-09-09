<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p class="text-gray-600">Track your CRM performance and insights</p>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid mb-8">
        <div class="stat-card">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100 text-blue-600">
              <Icon name="heroicons:users" class="w-6 h-6" />
            </div>
            <div class="ml-4">
              <p class="stat-label">Total Leads</p>
              <p class="stat-value">{{ stats.totalLeads || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-green-100 text-green-600">
              <Icon name="heroicons:check-circle" class="w-6 h-6" />
            </div>
            <div class="ml-4">
              <p class="stat-label">Converted</p>
              <p class="stat-value">{{ stats.convertedLeads || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <Icon name="heroicons:clock" class="w-6 h-6" />
            </div>
            <div class="ml-4">
              <p class="stat-label">In Progress</p>
              <p class="stat-value">{{ stats.inProgressLeads || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-purple-100 text-purple-600">
              <Icon name="heroicons:currency-dollar" class="w-6 h-6" />
            </div>
            <div class="ml-4">
              <p class="stat-label">Total Value</p>
              <p class="stat-value">${{ stats.totalValue || 0 }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-900">Lead Sources</h3>
          </div>
          <div class="card-body">
            <div class="space-y-4">
              <div v-for="source in leadSources" :key="source.name" class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-4 h-4 rounded-full mr-3" :style="{ backgroundColor: source.color }"></div>
                  <span class="text-sm font-medium text-gray-900">{{ source.name }}</span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm text-gray-600 mr-2">{{ source.count }}</span>
                  <div class="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      class="h-2 rounded-full" 
                      :style="{ 
                        width: `${(source.count / Math.max(...leadSources.map(s => s.count))) * 100}%`,
                        backgroundColor: source.color 
                      }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-900">Conversion Rate</h3>
          </div>
          <div class="card-body">
            <div class="text-center">
              <div class="text-4xl font-bold text-blue-600 mb-2">
                {{ conversionRate }}%
              </div>
              <p class="text-sm text-gray-600">Overall conversion rate</p>
              <div class="mt-4">
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    class="bg-blue-600 h-3 rounded-full transition-all duration-500"
                    :style="{ width: `${conversionRate}%` }"
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
            <div v-for="activity in recentActivities" :key="activity.id" class="flex items-center space-x-4">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Icon :name="activity.icon" class="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900">{{ activity.description }}</p>
                <p class="text-sm text-gray-500">{{ activity.time }}</p>
              </div>
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

// Computed
const stats = computed(() => analytics.value?.metrics || {
  totalLeads: 0,
  convertedLeads: 0,
  inProgressLeads: 0,
  totalValue: 0
})

const leadSources = computed(() => {
  if (!analytics.value?.leadSources) return []
  return analytics.value.leadSources.map(source => ({
    name: source.source.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    count: source.count,
    color: getSourceColor(source.source)
  }))
})

const recentActivities = computed(() => {
  if (!analytics.value?.recentActivities) return []
  return analytics.value.recentActivities.map(activity => ({
    id: activity._id,
    description: activity.title,
    time: formatDate(activity.createdAt),
    icon: getActivityIcon(activity.type)
  }))
})

const conversionRate = computed(() => {
  if (stats.value.totalLeads === 0) return 0
  return Math.round((stats.value.convertedLeads / stats.value.totalLeads) * 100)
})

// Methods
const loadAnalytics = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const token = useCookie('auth-token')
    let authToken = token.value
    
    if (!authToken && process.client) {
      authToken = localStorage.getItem('auth-token')
    }
    
    if (!authToken) {
      throw new Error('Authentication required')
    }

    const response = await $fetch('/api/analytics/dashboard', {
      headers: {
        'Authorization': `Bearer ${authToken}`
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
