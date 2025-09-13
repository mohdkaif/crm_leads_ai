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
                  <p class="text-2xl font-bold text-gray-900">{{ analytics.overview.totalLeads }}</p>
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
                  <p class="text-sm font-medium text-gray-600">Total Activities</p>
                  <p class="text-2xl font-bold text-gray-900">{{ analytics.overview.totalActivities }}</p>
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
                  <p class="text-sm font-medium text-gray-600">Pipeline Value</p>
                  <p class="text-2xl font-bold text-gray-900">${{ formatNumber(analytics.pipelineHealth.pipelineValue) }}</p>
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
                  <p class="text-2xl font-bold text-gray-900">{{ analytics.overview.conversionRate }}%</p>
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
              <h3 class="text-lg font-semibold text-gray-900">Lead Sources Performance</h3>
            </div>
            <div class="card-body">
              <div class="space-y-4">
                <div 
                  v-for="source in analytics.sourcePerformance" 
                  :key="source.source"
                  class="flex items-center justify-between"
                >
                  <div class="flex items-center">
                    <div class="w-4 h-4 rounded-full mr-3" :style="{ backgroundColor: getSourceColor(source.source) }"></div>
                    <span class="text-sm font-medium text-gray-900 capitalize">{{ source.source.replace('_', ' ') }}</span>
                  </div>
                  <div class="flex items-center">
                    <span class="text-sm text-gray-600 mr-2">{{ source.total }}</span>
                    <div class="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        class="h-2 rounded-full" 
                        :style="{ 
                          width: `${(source.total / Math.max(...analytics.sourcePerformance.map(s => s.total))) * 100}%`,
                          backgroundColor: getSourceColor(source.source) 
                        }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Activity Breakdown -->
          <div class="card">
            <div class="card-header">
              <h3 class="text-lg font-semibold text-gray-900">Activity Breakdown</h3>
            </div>
            <div class="card-body">
              <div class="space-y-4">
                <div 
                  v-for="(count, type) in analytics.activityBreakdown" 
                  :key="type"
                  class="flex items-center justify-between"
                >
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <Icon :name="getActivityIcon(type)" class="w-4 h-4 text-blue-600" />
                    </div>
                    <span class="text-sm font-medium text-gray-900 capitalize">{{ type }}</span>
                  </div>
                  <div class="flex items-center">
                    <span class="text-sm text-gray-600 mr-2">{{ count }}</span>
                    <div class="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        class="h-2 rounded-full bg-blue-500" 
                        :style="{ 
                          width: `${(count / Math.max(...Object.values(analytics.activityBreakdown))) * 100}%`
                        }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Analytics -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <!-- Lead Status Distribution -->
          <div class="card">
            <div class="card-header">
              <h3 class="text-lg font-semibold text-gray-900">Lead Status Distribution</h3>
            </div>
            <div class="card-body">
              <div class="space-y-3">
                <div 
                  v-for="(count, status) in analytics.leadStatusDistribution" 
                  :key="status"
                  class="flex items-center justify-between"
                >
                  <div class="flex items-center">
                    <div class="w-3 h-3 rounded-full mr-3" :style="{ backgroundColor: getStatusColor(status) }"></div>
                    <span class="text-sm font-medium text-gray-900 capitalize">{{ status.replace('_', ' ') }}</span>
                  </div>
                  <span class="text-sm text-gray-600">{{ count }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Lead Priority Distribution -->
          <div class="card">
            <div class="card-header">
              <h3 class="text-lg font-semibold text-gray-900">Lead Priority Distribution</h3>
            </div>
            <div class="card-body">
              <div class="space-y-3">
                <div 
                  v-for="(count, priority) in analytics.leadPriorityDistribution" 
                  :key="priority"
                  class="flex items-center justify-between"
                >
                  <div class="flex items-center">
                    <div class="w-3 h-3 rounded-full mr-3" :style="{ backgroundColor: getPriorityColor(priority) }"></div>
                    <span class="text-sm font-medium text-gray-900 capitalize">{{ priority }}</span>
                  </div>
                  <span class="text-sm text-gray-600">{{ count }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Pipeline Health -->
          <div class="card">
            <div class="card-header">
              <h3 class="text-lg font-semibold text-gray-900">Pipeline Health</h3>
            </div>
            <div class="card-body">
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium text-gray-600">Pipeline Value</span>
                  <span class="text-lg font-bold text-gray-900">${{ formatNumber(analytics.pipelineHealth.pipelineValue) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium text-gray-600">Win Rate</span>
                  <span class="text-lg font-bold text-green-600">{{ analytics.pipelineHealth.winRate }}%</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium text-gray-600">Loss Rate</span>
                  <span class="text-lg font-bold text-red-600">{{ analytics.pipelineHealth.lossRate }}%</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium text-gray-600">Avg Deal Cycle</span>
                  <span class="text-lg font-bold text-gray-900">{{ analytics.pipelineHealth.averageDealCycle }} days</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Performers -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <!-- Top Leads -->
          <div class="card">
            <div class="card-header">
              <h3 class="text-lg font-semibold text-gray-900">Top Leads by Value</h3>
            </div>
            <div class="card-body">
              <div class="space-y-4">
                <div 
                  v-for="(lead, index) in analytics.topPerformers.topLeads.slice(0, 5)" 
                  :key="lead.id"
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span class="text-sm font-bold text-blue-600">{{ index + 1 }}</span>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ lead.name }}</p>
                      <p class="text-xs text-gray-500">{{ lead.company }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-bold text-gray-900">${{ formatNumber(lead.value) }}</p>
                    <p class="text-xs text-gray-500 capitalize">{{ lead.priority }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Top Users -->
          <div class="card">
            <div class="card-header">
              <h3 class="text-lg font-semibold text-gray-900">User Performance</h3>
            </div>
            <div class="card-body">
              <div class="space-y-4">
                <div 
                  v-for="user in analytics.topPerformers.topUsers" 
                  :key="user.id"
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <Icon name="heroicons:user" class="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ user.name }}</p>
                      <p class="text-xs text-gray-500">{{ user.email }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-bold text-gray-900">{{ user.totalLeads }} leads</p>
                    <p class="text-xs text-gray-500">{{ user.conversionRate }}% conversion</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card mb-8">
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

        <!-- Features Overview -->
        <div class="card">
          <div class="card-header">
            <h3 class="text-2xl font-bold text-gray-900 mb-2">🚀 System Features</h3>
            <p class="text-gray-600">Explore all the powerful features available in your CRM Leads AI system</p>
          </div>
          <div class="card-body">
            <!-- Core Features -->
            <div class="mb-8">
              <h4 class="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <Icon name="heroicons:cog-6-tooth" class="w-6 h-6 text-blue-600 mr-2" />
                Core Features
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-300">
                  <div class="flex items-center mb-4">
                    <div class="p-3 bg-blue-500 rounded-lg">
                      <Icon name="heroicons:users" class="w-6 h-6 text-white" />
                    </div>
                    <h5 class="text-lg font-semibold text-blue-900 ml-3">Lead Management</h5>
                  </div>
                  <p class="text-blue-700 text-sm mb-4">Complete CRUD operations for leads with advanced filtering, search, and export capabilities.</p>
                  <div class="flex flex-wrap gap-2">
                    <span class="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full">Create Leads</span>
                    <span class="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full">Edit & Update</span>
                    <span class="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full">Advanced Search</span>
                    <span class="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full">Export Data</span>
                  </div>
                </div>

                <div class="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 hover:shadow-lg transition-all duration-300">
                  <div class="flex items-center mb-4">
                    <div class="p-3 bg-green-500 rounded-lg">
                      <Icon name="heroicons:chart-bar" class="w-6 h-6 text-white" />
                    </div>
                    <h5 class="text-lg font-semibold text-green-900 ml-3">Analytics & Reporting</h5>
                  </div>
                  <p class="text-green-700 text-sm mb-4">Real-time insights, performance metrics, and comprehensive reporting dashboards.</p>
                  <div class="flex flex-wrap gap-2">
                    <span class="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">Real-time Metrics</span>
                    <span class="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">Visual Charts</span>
                    <span class="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">Performance KPIs</span>
                    <span class="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">Export Reports</span>
                  </div>
                </div>

                <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 hover:shadow-lg transition-all duration-300">
                  <div class="flex items-center mb-4">
                    <div class="p-3 bg-purple-500 rounded-lg">
                      <Icon name="heroicons:user-group" class="w-6 h-6 text-white" />
                    </div>
                    <h5 class="text-lg font-semibold text-purple-900 ml-3">User Management</h5>
                  </div>
                  <p class="text-purple-700 text-sm mb-4">Role-based access control with granular permissions for different user types.</p>
                  <div class="flex flex-wrap gap-2">
                    <span class="px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded-full">RBAC System</span>
                    <span class="px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded-full">Team Management</span>
                    <span class="px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded-full">Permissions</span>
                    <span class="px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded-full">User Profiles</span>
                  </div>
                </div>

                <div class="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 hover:shadow-lg transition-all duration-300">
                  <div class="flex items-center mb-4">
                    <div class="p-3 bg-orange-500 rounded-lg">
                      <Icon name="heroicons:clock" class="w-6 h-6 text-white" />
                    </div>
                    <h5 class="text-lg font-semibold text-orange-900 ml-3">Activity Tracking</h5>
                  </div>
                  <p class="text-orange-700 text-sm mb-4">Comprehensive activity logging with follow-up scheduling and audit trails.</p>
                  <div class="flex flex-wrap gap-2">
                    <span class="px-2 py-1 bg-orange-200 text-orange-800 text-xs rounded-full">Activity Logs</span>
                    <span class="px-2 py-1 bg-orange-200 text-orange-800 text-xs rounded-full">Follow-ups</span>
                    <span class="px-2 py-1 bg-orange-200 text-orange-800 text-xs rounded-full">Audit Trail</span>
                    <span class="px-2 py-1 bg-orange-200 text-orange-800 text-xs rounded-full">Due Dates</span>
                  </div>
                </div>

                <div class="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl border border-indigo-200 hover:shadow-lg transition-all duration-300">
                  <div class="flex items-center mb-4">
                    <div class="p-3 bg-indigo-500 rounded-lg">
                      <Icon name="heroicons:envelope" class="w-6 h-6 text-white" />
                    </div>
                    <h5 class="text-lg font-semibold text-indigo-900 ml-3">Email Management</h5>
                  </div>
                  <p class="text-indigo-700 text-sm mb-4">Complete email system with templates, campaigns, and communication tracking.</p>
                  <div class="flex flex-wrap gap-2">
                    <span class="px-2 py-1 bg-indigo-200 text-indigo-800 text-xs rounded-full">Email Templates</span>
                    <span class="px-2 py-1 bg-indigo-200 text-indigo-800 text-xs rounded-full">Campaigns</span>
                    <span class="px-2 py-1 bg-indigo-200 text-indigo-800 text-xs rounded-full">History</span>
                    <span class="px-2 py-1 bg-indigo-200 text-indigo-800 text-xs rounded-full">Composer</span>
                  </div>
                </div>

                <div class="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-xl border border-pink-200 hover:shadow-lg transition-all duration-300">
                  <div class="flex items-center mb-4">
                    <div class="p-3 bg-pink-500 rounded-lg">
                      <Icon name="heroicons:adjustments-horizontal" class="w-6 h-6 text-white" />
                    </div>
                    <h5 class="text-lg font-semibold text-pink-900 ml-3">Assignment Rules</h5>
                  </div>
                  <p class="text-pink-700 text-sm mb-4">Smart lead assignment with automated rules and manual assignment capabilities.</p>
                  <div class="flex flex-wrap gap-2">
                    <span class="px-2 py-1 bg-pink-200 text-pink-800 text-xs rounded-full">Auto Assignment</span>
                    <span class="px-2 py-1 bg-pink-200 text-pink-800 text-xs rounded-full">Rule Engine</span>
                    <span class="px-2 py-1 bg-pink-200 text-pink-800 text-xs rounded-full">Manual Override</span>
                    <span class="px-2 py-1 bg-pink-200 text-pink-800 text-xs rounded-full">Transfer System</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- AI Features -->
            <div class="mb-8">
              <h4 class="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <Icon name="heroicons:sparkles" class="w-6 h-6 text-purple-600 mr-2" />
                AI-Powered Features
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 hover:shadow-lg transition-all duration-300">
                  <div class="flex items-center mb-4">
                    <div class="p-3 bg-purple-500 rounded-lg">
                      <Icon name="heroicons:star" class="w-6 h-6 text-white" />
                    </div>
                    <h5 class="text-lg font-semibold text-purple-900 ml-3">Lead Scoring</h5>
                  </div>
                  <p class="text-purple-700 text-sm mb-4">Automatic lead qualification scoring (0-100) based on multiple factors and engagement.</p>
                  <div class="flex flex-wrap gap-2">
                    <span class="px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded-full">Auto Scoring</span>
                    <span class="px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded-full">Engagement</span>
                    <span class="px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded-full">Qualification</span>
                  </div>
                </div>

                <div class="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-xl border border-cyan-200 hover:shadow-lg transition-all duration-300">
                  <div class="flex items-center mb-4">
                    <div class="p-3 bg-cyan-500 rounded-lg">
                      <Icon name="heroicons:heart" class="w-6 h-6 text-white" />
                    </div>
                    <h5 class="text-lg font-semibold text-cyan-900 ml-3">Sentiment Analysis</h5>
                  </div>
                  <p class="text-cyan-700 text-sm mb-4">Analyze communication sentiment to understand lead mood and engagement levels.</p>
                  <div class="flex flex-wrap gap-2">
                    <span class="px-2 py-1 bg-cyan-200 text-cyan-800 text-xs rounded-full">Positive</span>
                    <span class="px-2 py-1 bg-cyan-200 text-cyan-800 text-xs rounded-full">Neutral</span>
                    <span class="px-2 py-1 bg-cyan-200 text-cyan-800 text-xs rounded-full">Negative</span>
                  </div>
                </div>

                <div class="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200 hover:shadow-lg transition-all duration-300">
                  <div class="flex items-center mb-4">
                    <div class="p-3 bg-emerald-500 rounded-lg">
                      <Icon name="heroicons:light-bulb" class="w-6 h-6 text-white" />
                    </div>
                    <h5 class="text-lg font-semibold text-emerald-900 ml-3">Smart Recommendations</h5>
                  </div>
                  <p class="text-emerald-700 text-sm mb-4">AI-generated next actions, insights, and follow-up suggestions for optimal lead management.</p>
                  <div class="flex flex-wrap gap-2">
                    <span class="px-2 py-1 bg-emerald-200 text-emerald-800 text-xs rounded-full">Next Actions</span>
                    <span class="px-2 py-1 bg-emerald-200 text-emerald-800 text-xs rounded-full">Insights</span>
                    <span class="px-2 py-1 bg-emerald-200 text-emerald-800 text-xs rounded-full">Follow-ups</span>
                  </div>
                </div>

                <div class="bg-gradient-to-br from-rose-50 to-rose-100 p-6 rounded-xl border border-rose-200 hover:shadow-lg transition-all duration-300">
                  <div class="flex items-center mb-4">
                    <div class="p-3 bg-rose-500 rounded-lg">
                      <Icon name="heroicons:exclamation-triangle" class="w-6 h-6 text-white" />
                    </div>
                    <h5 class="text-lg font-semibold text-rose-900 ml-3">Risk Assessment</h5>
                  </div>
                  <p class="text-rose-700 text-sm mb-4">Identify potential issues and opportunities to optimize lead conversion rates.</p>
                  <div class="flex flex-wrap gap-2">
                    <span class="px-2 py-1 bg-rose-200 text-rose-800 text-xs rounded-full">Risk Detection</span>
                    <span class="px-2 py-1 bg-rose-200 text-rose-800 text-xs rounded-full">Opportunities</span>
                    <span class="px-2 py-1 bg-rose-200 text-rose-800 text-xs rounded-full">Alerts</span>
                  </div>
                </div>

                <div class="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200 hover:shadow-lg transition-all duration-300">
                  <div class="flex items-center mb-4">
                    <div class="p-3 bg-amber-500 rounded-lg">
                      <Icon name="heroicons:chart-pie" class="w-6 h-6 text-white" />
                    </div>
                    <h5 class="text-lg font-semibold text-amber-900 ml-3">Engagement Tracking</h5>
                  </div>
                  <p class="text-amber-700 text-sm mb-4">Monitor lead engagement levels and interaction patterns for better relationship management.</p>
                  <div class="flex flex-wrap gap-2">
                    <span class="px-2 py-1 bg-amber-200 text-amber-800 text-xs rounded-full">High</span>
                    <span class="px-2 py-1 bg-amber-200 text-amber-800 text-xs rounded-full">Medium</span>
                    <span class="px-2 py-1 bg-amber-200 text-amber-800 text-xs rounded-full">Low</span>
                  </div>
                </div>

                <div class="bg-gradient-to-br from-violet-50 to-violet-100 p-6 rounded-xl border border-violet-200 hover:shadow-lg transition-all duration-300">
                  <div class="flex items-center mb-4">
                    <div class="p-3 bg-violet-500 rounded-lg">
                      <Icon name="heroicons:clock" class="w-6 h-6 text-white" />
                    </div>
                    <h5 class="text-lg font-semibold text-violet-900 ml-3">Auto Follow-up</h5>
                  </div>
                  <p class="text-violet-700 text-sm mb-4">Intelligent follow-up suggestions with optimal timing and personalized content recommendations.</p>
                  <div class="flex flex-wrap gap-2">
                    <span class="px-2 py-1 bg-violet-200 text-violet-800 text-xs rounded-full">Timing</span>
                    <span class="px-2 py-1 bg-violet-200 text-violet-800 text-xs rounded-full">Personalization</span>
                    <span class="px-2 py-1 bg-violet-200 text-violet-800 text-xs rounded-full">Automation</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Security & Access Features -->
            <div class="mb-8">
              <h4 class="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <Icon name="heroicons:shield-check" class="w-6 h-6 text-green-600 mr-2" />
                Security & Access Control
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div class="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 hover:shadow-lg transition-all duration-300">
                  <div class="flex items-center mb-4">
                    <div class="p-3 bg-green-500 rounded-lg">
                      <Icon name="heroicons:key" class="w-6 h-6 text-white" />
                    </div>
                    <h5 class="text-lg font-semibold text-green-900 ml-3">JWT Authentication</h5>
                  </div>
                  <p class="text-green-700 text-sm">Secure token-based authentication system for enhanced security.</p>
                </div>

                <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-300">
                  <div class="flex items-center mb-4">
                    <div class="p-3 bg-blue-500 rounded-lg">
                      <Icon name="heroicons:user-group" class="w-6 h-6 text-white" />
                    </div>
                    <h5 class="text-lg font-semibold text-blue-900 ml-3">Role-Based Access</h5>
                  </div>
                  <p class="text-blue-700 text-sm">Admin, Manager, Sales, and Viewer roles with granular permissions.</p>
                </div>

                <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 hover:shadow-lg transition-all duration-300">
                  <div class="flex items-center mb-4">
                    <div class="p-3 bg-purple-500 rounded-lg">
                      <Icon name="heroicons:lock-closed" class="w-6 h-6 text-white" />
                    </div>
                    <h5 class="text-lg font-semibold text-purple-900 ml-3">Permission System</h5>
                  </div>
                  <p class="text-purple-700 text-sm">Granular permissions for different operations and data access.</p>
                </div>

                <div class="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200 hover:shadow-lg transition-all duration-300">
                  <div class="flex items-center mb-4">
                    <div class="p-3 bg-red-500 rounded-lg">
                      <Icon name="heroicons:shield-exclamation" class="w-6 h-6 text-white" />
                    </div>
                    <h5 class="text-lg font-semibold text-red-900 ml-3">Secure API</h5>
                  </div>
                  <p class="text-red-700 text-sm">Protected endpoints with middleware and authentication checks.</p>
                </div>
              </div>
            </div>

            <!-- User Experience Features -->
            <div>
              <h4 class="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <Icon name="heroicons:sparkles" class="w-6 h-6 text-pink-600 mr-2" />
                User Experience
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-xl border border-pink-200 hover:shadow-lg transition-all duration-300">
                  <div class="flex items-center mb-4">
                    <div class="p-3 bg-pink-500 rounded-lg">
                      <Icon name="heroicons:device-phone-mobile" class="w-6 h-6 text-white" />
                    </div>
                    <h5 class="text-lg font-semibold text-pink-900 ml-3">Responsive Design</h5>
                  </div>
                  <p class="text-pink-700 text-sm">Mobile-first approach with seamless experience across all devices.</p>
                </div>

                <div class="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl border border-indigo-200 hover:shadow-lg transition-all duration-300">
                  <div class="flex items-center mb-4">
                    <div class="p-3 bg-indigo-500 rounded-lg">
                      <Icon name="heroicons:sun" class="w-6 h-6 text-white" />
                    </div>
                    <h5 class="text-lg font-semibold text-indigo-900 ml-3">Theme Switching</h5>
                  </div>
                  <p class="text-indigo-700 text-sm">Dark and light mode support for comfortable viewing in any environment.</p>
                </div>

                <div class="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-xl border border-teal-200 hover:shadow-lg transition-all duration-300">
                  <div class="flex items-center mb-4">
                    <div class="p-3 bg-teal-500 rounded-lg">
                      <Icon name="heroicons:arrow-path" class="w-6 h-6 text-white" />
                    </div>
                    <h5 class="text-lg font-semibold text-teal-900 ml-3">Real-time Updates</h5>
                  </div>
                  <p class="text-teal-700 text-sm">Live data synchronization and real-time updates across the platform.</p>
                </div>

                <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200 hover:shadow-lg transition-all duration-300">
                  <div class="flex items-center mb-4">
                    <div class="p-3 bg-yellow-500 rounded-lg">
                      <Icon name="heroicons:eye" class="w-6 h-6 text-white" />
                    </div>
                    <h5 class="text-lg font-semibold text-yellow-900 ml-3">Accessibility</h5>
                  </div>
                  <p class="text-yellow-700 text-sm">WCAG compliant design for inclusive user experience.</p>
                </div>

                <div class="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-xl border border-cyan-200 hover:shadow-lg transition-all duration-300">
                  <div class="flex items-center mb-4">
                    <div class="p-3 bg-cyan-500 rounded-lg">
                      <Icon name="heroicons:arrow-right" class="w-6 h-6 text-white" />
                    </div>
                    <h5 class="text-lg font-semibold text-cyan-900 ml-3">Intuitive Navigation</h5>
                  </div>
                  <p class="text-cyan-700 text-sm">User-friendly interface with clear navigation and workflow.</p>
                </div>

                <div class="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200 hover:shadow-lg transition-all duration-300">
                  <div class="flex items-center mb-4">
                    <div class="p-3 bg-emerald-500 rounded-lg">
                      <Icon name="heroicons:chart-bar-square" class="w-6 h-6 text-white" />
                    </div>
                    <h5 class="text-lg font-semibold text-emerald-900 ml-3">Data Visualization</h5>
                  </div>
                  <p class="text-emerald-700 text-sm">Interactive charts and graphs for better data understanding.</p>
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
// Reactive data
const loading = ref(true)
const error = ref('')
const analytics = ref(null)

// Methods
const loadAnalytics = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const token = localStorage.getItem('auth-token')
    console.log(token,'token')
    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await $fetch('/api/analytics/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`
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

const getStatusColor = (status) => {
  const colors = {
    new: '#3B82F6',
    contacted: '#F59E0B',
    qualified: '#10B981',
    proposal: '#8B5CF6',
    negotiation: '#F97316',
    closed_won: '#059669',
    closed_lost: '#DC2626'
  }
  return colors[status] || '#6B7280'
}

const getPriorityColor = (priority) => {
  const colors = {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#EF4444',
    urgent: '#DC2626'
  }
  return colors[priority] || '#6B7280'
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