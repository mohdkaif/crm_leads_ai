<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">AI Insights</h1>
        <p class="text-gray-600">AI-powered recommendations and lead analysis</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="loading-spinner"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="card bg-red-50 border-red-200">
        <div class="card-body text-center">
          <Icon name="heroicons:exclamation-triangle" class="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 class="text-lg font-semibold text-red-900 mb-2">Error Loading Insights</h3>
          <p class="text-red-700 mb-4">{{ error }}</p>
          <button @click="loadInsights" class="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else-if="insightsData" class="space-y-8">
        <!-- Key Metrics -->
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
                  <p class="text-2xl font-semibold text-gray-900">{{ insightsData.leadMetrics.totalLeads }}</p>
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
                  <p class="text-2xl font-semibold text-gray-900">{{ insightsData.leadMetrics.conversionRate }}%</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Icon name="heroicons:chart-bar" class="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Lead Quality Score</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ insightsData.aiInsights.leadQualityScore }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Icon name="heroicons:currency-dollar" class="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Total Value</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ formatCurrency(insightsData.leadMetrics.totalValue) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- AI Recommendations -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="card">
            <div class="card-header">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <Icon name="heroicons:sparkles" class="w-5 h-5 mr-2 text-purple-600" />
                AI Recommendations
              </h3>
            </div>
            <div class="card-body">
              <div class="space-y-4">
                <div v-for="recommendation in recommendations" :key="recommendation.type" 
                     class="p-4 rounded-lg border-l-4" 
                     :class="recommendation.priority === 'high' ? 'border-red-500 bg-red-50' : 
                             recommendation.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' : 
                             'border-blue-500 bg-blue-50'">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h4 class="font-medium text-gray-900">{{ recommendation.title }}</h4>
                      <p class="text-sm text-gray-600 mt-1">{{ recommendation.description }}</p>
                      <p class="text-sm text-gray-500 mt-2">{{ recommendation.action }}</p>
                      <div class="mt-2">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                              :class="recommendation.priority === 'high' ? 'bg-red-100 text-red-800' : 
                                      recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                                      'bg-blue-100 text-blue-800'">
                          {{ recommendation.priority }} priority
                        </span>
                      </div>
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
                Conversion Predictions
              </h3>
            </div>
            <div class="card-body">
              <div class="space-y-4">
                <div v-for="lead in conversionPredictions" :key="lead.leadId" 
                     class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {{ lead.leadName.charAt(0) }}
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">{{ lead.leadName }}</p>
                      <p class="text-sm text-gray-600">{{ lead.company }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="flex items-center">
                      <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          class="h-2 rounded-full"
                          :class="lead.conversionProbability >= 70 ? 'bg-green-500' : lead.conversionProbability >= 40 ? 'bg-yellow-500' : 'bg-red-500'"
                          :style="{ width: `${lead.conversionProbability}%` }"
                        ></div>
                      </div>
                      <span class="text-sm font-medium text-gray-900">{{ lead.conversionProbability }}%</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">{{ lead.currentStatus }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Priority Leads & Follow-up Recommendations -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="card">
            <div class="card-header">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 mr-2 text-orange-600" />
                Priority Leads
              </h3>
            </div>
            <div class="card-body">
              <div class="space-y-4">
                <div v-for="lead in priorityLeads" :key="lead.leadId" 
                     class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {{ lead.leadName.charAt(0) }}
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">{{ lead.leadName }}</p>
                      <p class="text-sm text-gray-600">{{ lead.company }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="flex items-center">
                      <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          class="h-2 rounded-full bg-orange-500"
                          :style="{ width: `${lead.priorityScore}%` }"
                        ></div>
                      </div>
                      <span class="text-sm font-medium text-gray-900">{{ lead.priorityScore }}</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">{{ lead.status }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <Icon name="heroicons:clock" class="w-5 h-5 mr-2 text-blue-600" />
                Follow-up Recommendations
              </h3>
            </div>
            <div class="card-body">
              <div class="space-y-4">
                <div v-for="recommendation in followUpRecommendations" :key="recommendation.leadId" 
                     class="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h4 class="font-medium text-gray-900">{{ recommendation.leadName }}</h4>
                      <p class="text-sm text-gray-600 mt-1">{{ recommendation.company }}</p>
                      <p class="text-sm text-blue-700 mt-2">{{ recommendation.reason }}</p>
                      <p class="text-sm text-blue-600 mt-1">{{ recommendation.suggestedAction }}</p>
                    </div>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          :class="recommendation.urgency === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'">
                      {{ recommendation.urgency }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Source Performance & Sales Velocity -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="card">
            <div class="card-header">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <Icon name="heroicons:chart-pie" class="w-5 h-5 mr-2 text-green-600" />
                Top Performing Sources
              </h3>
            </div>
            <div class="card-body">
              <div class="space-y-4">
                <div v-for="source in topPerformingSources" :key="source.source" 
                     class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p class="font-medium text-gray-900 capitalize">{{ source.source }}</p>
                    <p class="text-sm text-gray-600">{{ source.count }} leads</p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-medium text-gray-900">{{ source.percentage }}%</p>
                    <div class="w-16 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        class="h-2 rounded-full bg-green-500"
                        :style="{ width: `${source.percentage}%` }"
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
                <Icon name="heroicons:rocket-launch" class="w-5 h-5 mr-2 text-purple-600" />
                Sales Velocity
              </h3>
            </div>
            <div class="card-body">
              <div class="space-y-4">
                <div class="text-center">
                  <p class="text-3xl font-bold text-purple-600">{{ formatCurrency(salesVelocity.velocity) }}</p>
                  <p class="text-sm text-gray-600">Revenue per day</p>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div class="text-center">
                    <p class="text-lg font-semibold text-gray-900">{{ salesVelocity.averageDays }}</p>
                    <p class="text-sm text-gray-600">Avg. deal cycle (days)</p>
                  </div>
                  <div class="text-center">
                    <p class="text-lg font-semibold text-gray-900">{{ salesVelocity.wonLeads }}</p>
                    <p class="text-sm text-gray-600">Won deals</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Churn Risk & Activity Insights -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="card">
            <div class="card-header">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 mr-2 text-red-600" />
                Churn Risk Leads
              </h3>
            </div>
            <div class="card-body">
              <div class="space-y-4">
                <div v-for="lead in churnRisk" :key="lead.leadId" 
                     class="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h4 class="font-medium text-gray-900">{{ lead.leadName }}</h4>
                      <p class="text-sm text-gray-600 mt-1">{{ lead.company }}</p>
                      <p class="text-sm text-red-700 mt-2">
                        {{ lead.daysSinceActivity }} days since last activity
                      </p>
                    </div>
                    <div class="text-right">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {{ lead.riskScore }}% risk
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <Icon name="heroicons:chart-bar" class="w-5 h-5 mr-2 text-blue-600" />
                Activity Insights
              </h3>
            </div>
            <div class="card-body">
              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div class="text-center p-3 bg-blue-50 rounded-lg">
                    <p class="text-2xl font-bold text-blue-600">{{ activityInsights.totalActivities }}</p>
                    <p class="text-sm text-gray-600">Total Activities</p>
                  </div>
                  <div class="text-center p-3 bg-green-50 rounded-lg">
                    <p class="text-2xl font-bold text-green-600">{{ activityInsights.averageActivitiesPerLead }}</p>
                    <p class="text-sm text-gray-600">Per Lead</p>
                  </div>
                </div>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">Calls</span>
                    <span class="text-sm font-medium">{{ activityInsights.calls }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">Emails</span>
                    <span class="text-sm font-medium">{{ activityInsights.emails }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">Meetings</span>
                    <span class="text-sm font-medium">{{ activityInsights.meetings }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">Notes</span>
                    <span class="text-sm font-medium">{{ activityInsights.notes }}</span>
                  </div>
                </div>
              </div>
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
const insightsData = ref(null)

// Computed properties
const recommendations = computed(() => {
  if (!insightsData.value?.recommendations) return []
  return insightsData.value.recommendations
})

const conversionPredictions = computed(() => {
  if (!insightsData.value?.aiInsights?.conversionPredictions) return []
  return insightsData.value.aiInsights.conversionPredictions
})

const priorityLeads = computed(() => {
  if (!insightsData.value?.aiInsights?.priorityLeads) return []
  return insightsData.value.aiInsights.priorityLeads
})

const followUpRecommendations = computed(() => {
  if (!insightsData.value?.aiInsights?.followUpRecommendations) return []
  return insightsData.value.aiInsights.followUpRecommendations
})

const topPerformingSources = computed(() => {
  if (!insightsData.value?.aiInsights?.topPerformingSources) return []
  return insightsData.value.aiInsights.topPerformingSources
})

const salesVelocity = computed(() => {
  if (!insightsData.value?.aiInsights?.salesVelocity) return { velocity: 0, averageDays: 0, wonLeads: 0 }
  return insightsData.value.aiInsights.salesVelocity
})

const churnRisk = computed(() => {
  if (!insightsData.value?.aiInsights?.churnRisk) return []
  return insightsData.value.aiInsights.churnRisk
})

const activityInsights = computed(() => {
  if (!insightsData.value?.activityInsights) return {
    totalActivities: 0,
    calls: 0,
    emails: 0,
    meetings: 0,
    notes: 0,
    averageActivitiesPerLead: 0
  }
  return insightsData.value.activityInsights
})

// Methods
const loadInsights = async () => {
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

    const response = await $fetch('/api/ai/insights', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    
    if (response.success) {
      insightsData.value = response.data
    } else {
      throw new Error('Failed to load AI insights')
    }
  } catch (err) {
    console.error('Error loading AI insights:', err)
    error.value = err.data?.message || err.message || 'Failed to load AI insights'
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadInsights()
})

// Meta
definePageMeta({
  layout: 'default',
  auth: true
})
</script>
