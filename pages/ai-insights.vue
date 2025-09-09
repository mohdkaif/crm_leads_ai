<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">AI Insights</h1>
        <p class="text-gray-600">AI-powered recommendations and lead analysis</p>
      </div>

      <!-- AI Recommendations -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-900 flex items-center">
              <Icon name="heroicons:sparkles" class="w-5 h-5 mr-2 text-purple-600" />
              AI Recommendations
            </h3>
          </div>
          <div class="card-body">
            <div class="space-y-4">
              <div v-for="recommendation in recommendations" :key="recommendation.id" 
                   class="p-4 rounded-lg border-l-4" 
                   :class="recommendation.priority === 'high' ? 'border-red-500 bg-red-50' : 
                           recommendation.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' : 
                           'border-blue-500 bg-blue-50'">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-900">{{ recommendation.title }}</h4>
                    <p class="text-sm text-gray-600 mt-1">{{ recommendation.description }}</p>
                    <div class="mt-2">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            :class="recommendation.priority === 'high' ? 'bg-red-100 text-red-800' : 
                                    recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                                    'bg-blue-100 text-blue-800'">
                        {{ recommendation.priority }} priority
                      </span>
                    </div>
                  </div>
                  <button class="ml-4 text-gray-400 hover:text-gray-600">
                    <Icon name="heroicons:x-mark" class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-900 flex items-center">
              <Icon name="heroicons:chart-bar" class="w-5 h-5 mr-2 text-green-600" />
              Lead Scoring
            </h3>
          </div>
          <div class="card-body">
            <div class="space-y-4">
              <div v-for="lead in scoredLeads" :key="lead.id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {{ lead.name.charAt(0) }}
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ lead.name }}</p>
                    <p class="text-sm text-gray-600">{{ lead.company }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <div class="flex items-center">
                    <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        class="h-2 rounded-full"
                        :class="lead.score >= 80 ? 'bg-green-500' : lead.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'"
                        :style="{ width: `${lead.score}%` }"
                      ></div>
                    </div>
                    <span class="text-sm font-medium text-gray-900">{{ lead.score }}%</span>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">{{ lead.status }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sentiment Analysis -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-900 flex items-center">
              <Icon name="heroicons:face-smile" class="w-5 h-5 mr-2 text-green-600" />
              Sentiment Analysis
            </h3>
          </div>
          <div class="card-body">
            <div class="space-y-4">
              <div v-for="sentiment in sentimentData" :key="sentiment.id" class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center"
                       :class="sentiment.sentiment === 'positive' ? 'bg-green-100 text-green-600' : 
                               sentiment.sentiment === 'negative' ? 'bg-red-100 text-red-600' : 
                               'bg-yellow-100 text-yellow-600'">
                    <Icon :name="sentiment.sentiment === 'positive' ? 'heroicons:face-smile' : 
                                 sentiment.sentiment === 'negative' ? 'heroicons:face-frown' : 
                                 'heroicons:face-meh'" class="w-4 h-4" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ sentiment.lead }}</p>
                    <p class="text-xs text-gray-600">{{ sentiment.interaction }}</p>
                  </div>
                </div>
                <span class="text-sm font-medium"
                      :class="sentiment.sentiment === 'positive' ? 'text-green-600' : 
                              sentiment.sentiment === 'negative' ? 'text-red-600' : 
                              'text-yellow-600'">
                  {{ sentiment.confidence }}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-900 flex items-center">
              <Icon name="heroicons:clock" class="w-5 h-5 mr-2 text-blue-600" />
              Engagement Trends
            </h3>
          </div>
          <div class="card-body">
            <div class="space-y-4">
              <div v-for="trend in engagementTrends" :key="trend.id" class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ trend.metric }}</p>
                  <p class="text-xs text-gray-600">{{ trend.description }}</p>
                </div>
                <div class="flex items-center">
                  <Icon :name="trend.trend === 'up' ? 'heroicons:arrow-trending-up' : 'heroicons:arrow-trending-down'" 
                        class="w-4 h-4 mr-1"
                        :class="trend.trend === 'up' ? 'text-green-500' : 'text-red-500'" />
                  <span class="text-sm font-medium"
                        :class="trend.trend === 'up' ? 'text-green-600' : 'text-red-600'">
                    {{ trend.value }}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- AI Actions -->
      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center">
            <Icon name="heroicons:bolt" class="w-5 h-5 mr-2 text-purple-600" />
            AI-Powered Actions
          </h3>
        </div>
        <div class="card-body">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
              <Icon name="heroicons:envelope" class="w-6 h-6 text-blue-600 mb-2" />
              <h4 class="font-medium text-gray-900">Generate Email</h4>
              <p class="text-sm text-gray-600">AI-generated personalized emails</p>
            </button>
            
            <button class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
              <Icon name="heroicons:phone" class="w-6 h-6 text-green-600 mb-2" />
              <h4 class="font-medium text-gray-900">Call Scripts</h4>
              <p class="text-sm text-gray-600">AI-generated call talking points</p>
            </button>
            
            <button class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
              <Icon name="heroicons:chart-bar" class="w-6 h-6 text-purple-600 mb-2" />
              <h4 class="font-medium text-gray-900">Predictions</h4>
              <p class="text-sm text-gray-600">Lead conversion predictions</p>
            </button>
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
const insightsData = ref(null)

// Computed
const recommendations = computed(() => {
  if (!insightsData.value?.recommendations) return []
  return insightsData.value.recommendations.map((rec, index) => ({
    id: index + 1,
    title: rec.title,
    description: rec.description,
    priority: rec.impact === 'high' ? 'high' : rec.impact === 'medium' ? 'medium' : 'low'
  }))
})

const scoredLeads = computed(() => {
  // This would need to be implemented based on actual lead data with AI scores
  // For now, return empty array
  return []
})

const sentimentData = computed(() => {
  // This would need to be implemented based on actual interaction data
  // For now, return empty array
  return []
})

const engagementTrends = computed(() => {
  // This would need to be implemented based on actual engagement data
  // For now, return empty array
  return []
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
    error.value = err.message || 'Failed to load AI insights'
  } finally {
    loading.value = false
  }
}

const dismissRecommendation = (id) => {
  // In a real app, you might want to track dismissed recommendations
  console.log('Dismissed recommendation:', id)
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
