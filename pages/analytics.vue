<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p class="text-gray-600">Comprehensive insights into your CRM performance</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="loading-spinner"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="card bg-red-50 border-red-200">
        <div class="card-body text-center">
          <Icon name="heroicons:exclamation-triangle" class="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 class="text-lg font-semibold text-red-900 mb-2">Error Loading Analytics</h3>
          <p class="text-red-700 mb-4">{{ error }}</p>
          <button @click="loadAnalytics" class="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else-if="analyticsData" class="space-y-8">
        <!-- Overview Metrics -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Icon name="heroicons:users" class="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Total Leads</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ analyticsData.overview.totalLeads }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Conversion Rate</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ analyticsData.overview.conversionRate }}%</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Icon name="heroicons:currency-dollar" class="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ formatCurrency(analyticsData.overview.totalRevenue) }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Icon name="heroicons:chart-bar" class="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Avg. Deal Size</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ formatCurrency(analyticsData.overview.averageDealSize) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Lead Status Distribution -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="card">
            <div class="card-header">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <Icon name="heroicons:chart-pie" class="w-5 h-5 mr-2 text-blue-600" />
                Lead Status Distribution
              </h3>
            </div>
            <div class="card-body">
              <div class="space-y-4">
                <div v-for="(count, status) in leadStatusDistribution" :key="status" 
                     class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="w-3 h-3 rounded-full mr-3" :class="getStatusColor(status)"></div>
                    <span class="text-sm font-medium text-gray-900 capitalize">{{ status.replace('_', ' ') }}</span>
                  </div>
                  <div class="flex items-center">
                    <span class="text-sm font-medium text-gray-900">{{ count }}</span>
                    <div class="w-16 bg-gray-200 rounded-full h-2 ml-3">
                      <div 
                        class="h-2 rounded-full"
                        :class="getStatusColor(status)"
                        :style="{ width: `${(count / totalLeads) * 100}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <Icon name="heroicons:chart-bar" class="w-5 h-5 mr-2 text-green-600" />
                Lead Priority Distribution
              </h3>
            </div>
            <div class="card-body">
              <div class="space-y-4">
                <div v-for="(count, priority) in leadPriorityDistribution" :key="priority" 
                     class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="w-3 h-3 rounded-full mr-3" :class="getPriorityColor(priority)"></div>
                    <span class="text-sm font-medium text-gray-900 capitalize">{{ priority }}</span>
                  </div>
                  <div class="flex items-center">
                    <span class="text-sm font-medium text-gray-900">{{ count }}</span>
                    <div class="w-16 bg-gray-200 rounded-full h-2 ml-3">
                      <div 
                        class="h-2 rounded-full"
                        :class="getPriorityColor(priority)"
                        :style="{ width: `${(count / totalLeads) * 100}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Source Performance & Activity Breakdown -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="card">
            <div class="card-header">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <Icon name="heroicons:chart-bar" class="w-5 h-5 mr-2 text-purple-600" />
                Source Performance
              </h3>
            </div>
            <div class="card-body">
              <div class="space-y-4">
                <div v-for="source in sourcePerformance" :key="source.source" 
                     class="p-3 bg-gray-50 rounded-lg">
                  <div class="flex items-center justify-between mb-2">
                    <h4 class="font-medium text-gray-900 capitalize">{{ source.source }}</h4>
                    <span class="text-sm text-gray-600">{{ source.conversionRate }}% conversion</span>
                  </div>
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span class="text-gray-600">Total:</span>
                      <span class="font-medium ml-1">{{ source.total }}</span>
                    </div>
                    <div>
                      <span class="text-gray-600">Converted:</span>
                      <span class="font-medium ml-1">{{ source.converted }}</span>
                    </div>
                    <div>
                      <span class="text-gray-600">Value:</span>
                      <span class="font-medium ml-1">{{ formatCurrency(source.totalValue) }}</span>
                    </div>
                    <div>
                      <span class="text-gray-600">Avg. Value:</span>
                      <span class="font-medium ml-1">{{ formatCurrency(source.averageValue) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <Icon name="heroicons:clock" class="w-5 h-5 mr-2 text-orange-600" />
                Activity Breakdown
              </h3>
            </div>
            <div class="card-body">
              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div class="text-center p-4 bg-blue-50 rounded-lg">
                    <p class="text-2xl font-bold text-blue-600">{{ activityBreakdown.calls }}</p>
                    <p class="text-sm text-gray-600">Calls</p>
                  </div>
                  <div class="text-center p-4 bg-green-50 rounded-lg">
                    <p class="text-2xl font-bold text-green-600">{{ activityBreakdown.emails }}</p>
                    <p class="text-sm text-gray-600">Emails</p>
                  </div>
                  <div class="text-center p-4 bg-purple-50 rounded-lg">
                    <p class="text-2xl font-bold text-purple-600">{{ activityBreakdown.meetings }}</p>
                    <p class="text-sm text-gray-600">Meetings</p>
                  </div>
                  <div class="text-center p-4 bg-yellow-50 rounded-lg">
                    <p class="text-2xl font-bold text-yellow-600">{{ activityBreakdown.notes }}</p>
                    <p class="text-sm text-gray-600">Notes</p>
                  </div>
                </div>
                <div class="text-center p-4 bg-gray-50 rounded-lg">
                  <p class="text-lg font-semibold text-gray-900">{{ activityBreakdown.totalActivities }}</p>
                  <p class="text-sm text-gray-600">Total Activities</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- User Performance -->
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-900 flex items-center">
              <Icon name="heroicons:user-group" class="w-5 h-5 mr-2 text-indigo-600" />
              User Performance
            </h3>
          </div>
          <div class="card-body">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leads</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Converted</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion Rate</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Deal Size</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activities</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="user in userPerformance" :key="user.userId">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                        <div class="text-sm text-gray-500">{{ user.email }}</div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ user.totalLeads }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ user.convertedLeads }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ user.conversionRate }}%</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatCurrency(user.totalValue) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatCurrency(user.averageDealSize) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ user.totalActivities }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Pipeline Health -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="card">
            <div class="card-body text-center">
              <p class="text-2xl font-bold text-blue-600">{{ formatCurrency(pipelineHealth.pipelineValue) }}</p>
              <p class="text-sm text-gray-600">Pipeline Value</p>
            </div>
          </div>
          <div class="card">
            <div class="card-body text-center">
              <p class="text-2xl font-bold text-green-600">{{ pipelineHealth.averageDealCycle }}</p>
              <p class="text-sm text-gray-600">Avg. Deal Cycle (days)</p>
            </div>
          </div>
          <div class="card">
            <div class="card-body text-center">
              <p class="text-2xl font-bold text-purple-600">{{ pipelineHealth.winRate }}%</p>
              <p class="text-sm text-gray-600">Win Rate</p>
            </div>
          </div>
          <div class="card">
            <div class="card-body text-center">
              <p class="text-2xl font-bold text-red-600">{{ pipelineHealth.lossRate }}%</p>
              <p class="text-sm text-gray-600">Loss Rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Use settings composable
const { formatCurrency } = useSettings()

// Reactive data
const loading = ref(true)
const error = ref('')
const analyticsData = ref(null)

// Computed properties
const leadStatusDistribution = computed(() => {
  if (!analyticsData.value?.leadStatusDistribution) return {}
  return analyticsData.value.leadStatusDistribution
})

const leadPriorityDistribution = computed(() => {
  if (!analyticsData.value?.leadPriorityDistribution) return {}
  return analyticsData.value.leadPriorityDistribution
})

const sourcePerformance = computed(() => {
  if (!analyticsData.value?.sourcePerformance) return []
  return analyticsData.value.sourcePerformance
})

const activityBreakdown = computed(() => {
  if (!analyticsData.value?.activityBreakdown) return {
    calls: 0,
    emails: 0,
    meetings: 0,
    notes: 0,
    totalActivities: 0
  }
  return analyticsData.value.activityBreakdown
})

const userPerformance = computed(() => {
  if (!analyticsData.value?.userPerformance) return []
  return analyticsData.value.userPerformance
})

const pipelineHealth = computed(() => {
  if (!analyticsData.value?.pipelineHealth) return {
    pipelineValue: 0,
    averageDealCycle: 0,
    winRate: 0,
    lossRate: 0
  }
  return analyticsData.value.pipelineHealth
})

const totalLeads = computed(() => {
  if (!analyticsData.value?.overview?.totalLeads) return 1
  return analyticsData.value.overview.totalLeads
})

// Helper functions
const getStatusColor = (status) => {
  const colors = {
    'new': 'bg-blue-500',
    'contacted': 'bg-yellow-500',
    'qualified': 'bg-green-500',
    'proposal': 'bg-purple-500',
    'negotiation': 'bg-orange-500',
    'closed_won': 'bg-green-600',
    'closed_lost': 'bg-red-500'
  }
  return colors[status] || 'bg-gray-500'
}

const getPriorityColor = (priority) => {
  const colors = {
    'low': 'bg-gray-500',
    'medium': 'bg-yellow-500',
    'high': 'bg-orange-500',
    'urgent': 'bg-red-500'
  }
  return colors[priority] || 'bg-gray-500'
}

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
      analyticsData.value = response.data
    } else {
      throw new Error('Failed to load analytics')
    }
  } catch (err) {
    console.error('Error loading analytics:', err)
    error.value = err.data?.message || err.message || 'Failed to load analytics'
  } finally {
    loading.value = false
  }
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